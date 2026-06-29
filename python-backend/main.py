"""
OptiX Python backend — minimal FastAPI service.

Endpoints:
  GET  /health        → liveness check
  POST /upload-csv    → accepts one or more CSV/XLS(X) files, auto-detects broker
                        (Schwab/Fidelity/Robinhood) and returns parsed trades JSON
                        normalized to a single shared schema.
"""

from __future__ import annotations

import io
import logging
import math
import os
import re
from typing import Any

import httpx
import pandas as pd
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parsers import (
    parse_generic_file,
    parse_schwab_to_robinhood,
    parse_robinhood_file,
    parse_fidelity_file,
    normalize_dataframe_columns,
)

logger = logging.getLogger("optix.backend")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="OptiX Backend", version="0.2.0")

# CORS: restrict to known app origins. Override with ALLOWED_ORIGINS env
# (comma-separated) when deploying to additional domains.
_default_origins = [
    "https://figma-to-ai-trader.lovable.app",
    "https://id-preview--4acc8039-25c8-4665-9b34-1ca3d038e55f.lovable.app",
    "http://localhost:8080",
    "http://localhost:5173",
]
_env_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = _env_origins or _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Upload limits to prevent resource exhaustion
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))  # 10 MB
ALLOWED_CONTENT_TYPES = {
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",  # some browsers send this for csv/xlsx
    "",  # missing content-type — fall back to extension check
}
ALLOWED_EXTENSIONS = {".csv", ".xls", ".xlsx"}

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")


async def require_supabase_user(
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    """Validate the caller's Supabase JWT by calling Supabase's /auth/v1/user.

    Rejects with 401 if the header is missing/invalid or Supabase rejects
    the token. Returns the user dict on success.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        # Misconfigured server — fail closed rather than allow anonymous access.
        logger.error("Supabase auth env vars are not configured")
        raise HTTPException(status_code=503, detail="Server auth not configured")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY,
                },
            )
    except Exception:
        logger.exception("Auth verification request failed")
        raise HTTPException(status_code=503, detail="Auth verification unavailable")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return resp.json()



@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _df_to_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    safe = df.copy()
    for col in safe.columns:
        if pd.api.types.is_datetime64_any_dtype(safe[col]):
            safe[col] = safe[col].dt.strftime("%Y-%m-%d")
    records = safe.to_dict(orient="records")
    cleaned: list[dict[str, Any]] = []
    for row in records:
        clean_row: dict[str, Any] = {}
        for k, v in row.items():
            if v is None:
                clean_row[k] = None
            elif isinstance(v, float) and math.isnan(v):
                clean_row[k] = None
            elif hasattr(v, "isoformat"):
                clean_row[k] = v.isoformat()
            else:
                clean_row[k] = v
        cleaned.append(clean_row)
    return cleaned


_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def _detect_broker(filename: str, head_text: str) -> str:
    fn = (filename or "").lower()
    stem = fn.rsplit(".", 1)[0]
    head = head_text.lower()

    if "schwab" in fn or fn.startswith("designated"):
        return "Schwab"
    if "fidelity" in fn or fn.startswith("history"):
        return "Fidelity"
    if "robinhood" in fn or "hood" in fn or _UUID_RE.match(stem):
        return "Robinhood"

    # Content sniff (header line)
    if "run date" in head and "action" in head and "settlement date" in head:
        return "Fidelity"
    if "trans code" in head and "instrument" in head:
        return "Robinhood"
    if "action" in head and "symbol" in head and ("date" in head):
        # Schwab "Designated*" exports: Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
        if "fees & comm" in head or "sell to open" in head or "buy to close" in head:
            return "Schwab"
    return "Other"


# Only these option-lifecycle trans codes are kept. Everything else
# (ACH deposits, dividends, interest, share buys, journal entries, etc.)
# is discarded so the dashboard / chatbot only see real options trades.
ALLOWED_TRANS_CODES = {"OASSGN", "OEXP", "STO", "BTC"}

# Map raw Action / Trans Code variants from different brokers onto our
# canonical four codes. Anything not in here is dropped.
TRANS_CODE_ALIASES = {
    "STO": "STO",
    "SELL TO OPEN": "STO",
    "SOLD": "STO",
    "BTC": "BTC",
    "BUY TO CLOSE": "BTC",
    "BOUGHT": "BTC",
    "OEXP": "OEXP",
    "EXPIRED": "OEXP",
    "OPTION EXPIRATION": "OEXP",
    "EXPIRATION": "OEXP",
    "OASSGN": "OASSGN",
    "ASSIGNED": "OASSGN",
    "ASSIGNMENT": "OASSGN",
    "OPTION ASSIGNMENT": "OASSGN",
}


def _filter_to_options_only(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only rows whose Trans Code maps to STO/BTC/OEXP/OASSGN."""
    if "Trans Code" not in df.columns or len(df) == 0:
        return df
    raw = df["Trans Code"].astype(str).str.upper().str.strip()
    canonical = raw.map(lambda x: TRANS_CODE_ALIASES.get(x, x))
    keep = canonical.isin(ALLOWED_TRANS_CODES)
    df = df.loc[keep].copy()
    df["Trans Code"] = canonical[keep].values
    return df


def _parse_one(filename: str, contents: bytes) -> pd.DataFrame:
    head_text = contents[:4096].decode("utf-8", errors="ignore")
    broker = _detect_broker(filename, head_text)

    buf = io.BytesIO(contents)
    buf.name = filename

    try:
        if broker == "Schwab":
            df = parse_schwab_to_robinhood(buf)
        elif broker == "Fidelity":
            df = parse_fidelity_file(buf)
        elif broker == "Robinhood":
            df = parse_robinhood_file(buf)
        else:
            df = parse_generic_file(buf)
    except Exception:
        buf.seek(0)
        df = parse_generic_file(buf)

    df = normalize_dataframe_columns(df)
    df = _filter_to_options_only(df)
    df["Broker"] = broker if broker != "Other" else df.get("Broker", "Other")
    df["Source File"] = filename
    return df


@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile | None = File(None),
    files: list[UploadFile] | None = File(None),
    _user: dict[str, Any] = Depends(require_supabase_user),
) -> dict[str, Any]:
    upload_list: list[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file:
        upload_list.append(file)
    if not upload_list:
        raise HTTPException(status_code=400, detail="No file provided")

    frames: list[pd.DataFrame] = []
    per_file: list[dict[str, Any]] = []
    total_bytes = 0
    for up in upload_list:
        if not up.filename:
            continue

        # MIME / extension allowlist
        ext = os.path.splitext(up.filename)[1].lower()
        ctype = (up.content_type or "").lower()
        if ext not in ALLOWED_EXTENSIONS and ctype not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=415,
                detail="Unsupported file type. Upload CSV or Excel files only.",
            )

        contents = await up.read()
        if not contents:
            continue

        total_bytes += len(contents)
        if len(contents) > MAX_UPLOAD_BYTES or total_bytes > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum upload size is 10 MB.",
            )

        try:
            df = _parse_one(up.filename, contents)
        except Exception:  # noqa: BLE001
            logger.exception("Parse error for uploaded file %s", up.filename)
            raise HTTPException(
                status_code=400,
                detail="File could not be parsed. Please check the format and try again.",
            )
        frames.append(df)
        per_file.append({
            "filename": up.filename,
            "broker": df["Broker"].iloc[0] if "Broker" in df.columns and len(df) else "Other",
            "row_count": int(len(df)),
        })

    if not frames:
        raise HTTPException(status_code=400, detail="No usable files")

    combined = pd.concat(frames, ignore_index=True, sort=False)
    combined = normalize_dataframe_columns(combined)
    combined = _filter_to_options_only(combined)

    records = _df_to_records(combined)
    return {
        "filename": per_file[0]["filename"] if len(per_file) == 1 else f"{len(per_file)} files",
        "files": per_file,
        "row_count": len(records),
        "columns": list(combined.columns),
        "rows": records,
    }


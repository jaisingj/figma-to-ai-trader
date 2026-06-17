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
import math
import re
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parsers import (
    parse_generic_file,
    parse_schwab_to_robinhood,
    parse_robinhood_file,
    parse_fidelity_file,
    normalize_dataframe_columns,
)

app = FastAPI(title="OptiX Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    for up in upload_list:
        if not up.filename:
            continue
        contents = await up.read()
        if not contents:
            continue
        try:
            df = _parse_one(up.filename, contents)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(
                status_code=400, detail=f"Parse error in {up.filename}: {e}"
            ) from e
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

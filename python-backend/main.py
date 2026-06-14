"""
OptiX Python backend — minimal FastAPI service.

Endpoints:
  GET  /health        → liveness check
  POST /upload-csv    → accepts a CSV/XLS(X) file, returns parsed trades JSON

Run locally:
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000

Then open http://localhost:8000/docs to try it.
"""

from __future__ import annotations

import io
import math
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parsers import parse_generic_file

app = FastAPI(title="OptiX Backend", version="0.1.0")

# CORS — relax for now so the Lovable preview/published URLs can call us.
# Tighten allow_origins to your real domains before going to prod.
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
    """Convert a DataFrame to JSON-safe records (NaN/NaT → None, dates → ISO)."""
    safe = df.copy()
    # Stringify date/datetime columns
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


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    buf = io.BytesIO(contents)
    buf.name = file.filename  # parsers.py inspects .name to pick the reader

    try:
        df = parse_generic_file(buf)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Parse error: {e}") from e

    records = _df_to_records(df)
    return {
        "filename": file.filename,
        "row_count": len(records),
        "columns": list(df.columns),
        "rows": records,
    }

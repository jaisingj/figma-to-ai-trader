# OptiX Python Backend (minimal)

A small FastAPI service that wraps your existing `parsers.py` so the Lovable
frontend can upload a CSV and get back parsed, normalized trade rows.

## Endpoints

- `GET /health` — liveness check
- `POST /upload-csv` — multipart form field `file` (CSV or XLS/XLSX).
  Returns `{ filename, row_count, columns, rows }`.

Interactive docs: `http://localhost:8000/docs`

## Run locally

```bash
cd python-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test:

```bash
curl -F "file=@../path/to/your.csv" http://localhost:8000/upload-csv | jq .row_count
```

## Deploy (Render — easiest)

1. Push this `python-backend/` folder to its own GitHub repo (or a subdir).
2. On https://render.com → **New → Web Service** → connect the repo.
3. Render auto-detects the `Dockerfile`. Click **Create Web Service**.
4. Once live you get a URL like `https://optix-backend.onrender.com`.
5. Verify: open `https://<your-url>/docs`.

## Deploy (Railway alternative)

1. https://railway.app → New Project → Deploy from GitHub.
2. Pick the repo/subdir. Railway uses the Dockerfile automatically.
3. Add a public domain in **Settings → Networking**.

## Next step (wiring to Lovable)

Once deployed, give me the URL. I'll:
1. Store it as a secret (`PYTHON_API_URL`) in Lovable Cloud.
2. Add a server function that proxies file uploads to `/upload-csv`.
3. Wire the **Upload CSV** button on the Insights page to call it and render
   the parsed rows.

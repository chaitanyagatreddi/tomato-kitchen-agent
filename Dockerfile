# ── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json .
RUN npm install

COPY frontend/ .
RUN npm run build
# Output lands in /app/backend/static/

# ── Stage 2: Python backend ─────────────────────────────────────────────────
FROM python:3.11-slim

# System deps for Prophet + pandas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY agent/ ./agent/
COPY data/ ./data/
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/backend/static ./backend/static/

# Generate mock data at build time
RUN python data/mock_data.py

EXPOSE 7860

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]

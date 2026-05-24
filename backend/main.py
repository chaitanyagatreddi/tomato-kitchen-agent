"""FastAPI backend for Tomato Kitchen Agent."""

from __future__ import annotations

import json
import logging
import os
import sys
from pathlib import Path

# Make agent/ importable from backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from agent.forecaster import available_cities, available_items, forecast, total_forecast_qty
from data.mock_data import generate

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("backend")

app = FastAPI(title="Tomato Kitchen Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent.parent / "data" / "orders.csv"
STATIC_DIR = Path(__file__).parent / "static"

# Generate mock data on startup if missing
@app.on_event("startup")
async def startup():
    if not DATA_PATH.exists():
        log.info("Generating mock order data…")
        generate()
        log.info("Mock data ready.")


# ── Data endpoints ──────────────────────────────────────────────────────────

CHANNEL_DATA = {
    "Bangalore": {"Swiggy": 45, "Zomato": 35, "Offline": 20,
                  "peaks": ["Sat 7–9pm", "Sun 1–3pm", "Fri Lunch"]},
    "Hyderabad": {"Swiggy": 40, "Zomato": 38, "Offline": 22,
                  "peaks": ["Fri 7–9pm", "Sat 12–2pm", "Mon–Fri Lunch"]},
    "Delhi":     {"Swiggy": 38, "Zomato": 40, "Offline": 22,
                  "peaks": ["Fri 8–10pm", "Sat 1–3pm", "Weekday Dinner"]},
}


@app.get("/api/health")
async def health():
    return {"status": "ok", "data_ready": DATA_PATH.exists()}


@app.get("/api/forecast/{city}")
async def get_forecast(city: str, days: int = 7):
    items = available_items()
    rows = []
    for item in items:
        qty = total_forecast_qty(city, item, days_ahead=days)
        if qty == 0:
            continue
        order = int(qty * 1.15)
        rows.append({"item": item, "forecast": qty, "order_qty": order})
    rows.sort(key=lambda r: r["forecast"], reverse=True)
    return {"city": city, "days": days, "rows": rows[:8]}


@app.get("/api/channels/{city}")
async def get_channels(city: str):
    d = CHANNEL_DATA.get(city, CHANNEL_DATA["Bangalore"])
    return {
        "city": city,
        "channels": [
            {"name": "Swiggy",  "pct": d["Swiggy"],  "color": "#FC8019"},
            {"name": "Zomato",  "pct": d["Zomato"],  "color": "#E23744"},
            {"name": "Offline", "pct": d["Offline"], "color": "#6b7280"},
        ],
        "peaks": d["peaks"],
    }


@app.get("/api/cities")
async def get_cities():
    return {"cities": available_cities()}


@app.get("/api/forecast-daily/{city}")
async def get_forecast_daily(city: str, item: str = "Biryani", days: int = 7):
    """Return day-by-day forecast for a single item — drives the line chart."""
    preds = forecast(city, item, days_ahead=days)
    if preds.empty:
        return {"city": city, "item": item, "points": []}
    points = [
        {
            "date": row["ds"].strftime("%a %d"),
            "forecast": max(0, int(row["yhat"])),
            "low":      max(0, int(row["yhat_lower"])),
            "high":     max(0, int(row["yhat_upper"])),
        }
        for _, row in preds.iterrows()
    ]
    return {"city": city, "item": item, "points": points}


# ── WebSocket chat ───────────────────────────────────────────────────────────

@app.websocket("/ws/chat")
async def chat_ws(ws: WebSocket):
    await ws.accept()
    log.info("WebSocket connected")
    try:
        from agent.graph import run
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            text = msg.get("message", "")
            thread_id = msg.get("thread_id", "default")

            await ws.send_json({"type": "thinking"})

            try:
                response = run(text, thread_id=thread_id)
                await ws.send_json({"type": "response", "content": response})
            except Exception as e:
                log.error("Agent error: %s", e)
                await ws.send_json({"type": "error", "content": str(e)})

    except WebSocketDisconnect:
        log.info("WebSocket disconnected")


# ── Serve React build ────────────────────────────────────────────────────────

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = STATIC_DIR / "index.html"
        return FileResponse(str(index))

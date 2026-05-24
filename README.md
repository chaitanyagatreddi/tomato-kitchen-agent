---
title: Tomato Kitchen Agent
emoji: 🍅
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 🍅 Tomato Kitchen Agent

A supply and demand forecasting agent for cloud kitchens across **Bangalore, Hyderabad, and Delhi** — powered by a LangGraph ReAct agent, Prophet time-series forecasting, and a React dashboard.

[![Hugging Face Space](https://img.shields.io/badge/🤗%20HF%20Space-live-teal)](https://huggingface.co/spaces/YOUR_HF_USERNAME/tomato-kitchen-agent)

## What it does

| Feature | Details |
|---|---|
| 📈 Demand forecast | 7-day Prophet forecast per city / item |
| 📦 Order suggestions | Forecast + 15% safety stock buffer |
| 🏙️ City comparison | Compare demand across BLR / HYD / DEL |
| 📊 Channel split | Swiggy / Zomato / Offline breakdown |
| 💬 Chat agent | Ask in plain English via WebSocket |

## Stack

- **LangGraph** — ReAct agent loop  
- **gpt-4o-mini** — LLM backbone  
- **Prophet** — time-series forecasting with weekly seasonality  
- **FastAPI** — REST + WebSocket backend  
- **React + Vite + Tailwind** — dashboard UI  
- **Recharts** — forecast line chart + channel bar chart  

## Local setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/tomato-kitchen-agent
cd tomato-kitchen-agent

# 2. Python deps
pip install -r backend/requirements.txt

# 3. Frontend
cd frontend && npm install && npm run build && cd ..

# 4. Generate mock data
python data/mock_data.py

# 5. Set your OpenAI key
export OPENAI_API_KEY=sk-...

# 6. Run
uvicorn backend.main:app --reload --port 8000
```

Open http://localhost:8000

## Docker

```bash
docker build -t tomato-kitchen .
docker run -p 7860:7860 -e OPENAI_API_KEY=sk-... tomato-kitchen
```

## Example questions

- *"How much Biryani should I order for Hyderabad next week?"*
- *"Compare Dosa demand across all 3 cities"*
- *"What's the Swiggy vs Zomato split in Delhi?"*
- *"Forecast Paneer Tikka in Bangalore for 14 days"*

## Data

Mock synthetic data (78 k rows) generated at startup — city-specific cuisine weights, weekend spikes (1.4× Sat / 1.3× Sun), and realistic channel splits. No real PII or proprietary data.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | gpt-4o-mini access |

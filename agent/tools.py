"""LangChain tools for the cloud kitchen demand agent."""

from __future__ import annotations

import json

from langchain_core.tools import tool

from agent.forecaster import available_cities, available_items, forecast, total_forecast_qty

SAFETY_STOCK_PCT = 0.15   # 15% buffer on top of forecast
LEAD_TIME_DAYS = 2        # days before stock needed


@tool
def forecast_demand(city: str, item: str, channel: str = "", days_ahead: int = 7) -> str:
    """Forecast daily demand for an item in a city over the next N days.

    Args:
        city: One of Bangalore, Hyderabad, Delhi
        item: Food item e.g. Biryani, Dosa, Burger
        channel: Optional — Swiggy, Zomato, Offline, or empty for all channels
        days_ahead: Number of days to forecast (default 7)
    """
    ch = channel if channel else None
    preds = forecast(city, item, ch, days_ahead)
    if preds.empty:
        return f"Not enough data to forecast {item} in {city}."

    lines = [f"Demand forecast for {item} in {city}" + (f" via {channel}" if channel else "") + ":"]
    for _, row in preds.iterrows():
        lines.append(f"  {row['ds'].strftime('%a %d %b')}: {max(0, int(row['yhat'])):>4} units  (range {max(0,int(row['yhat_lower']))}–{max(0,int(row['yhat_upper']))})")
    return "\n".join(lines)


@tool
def suggest_order(city: str, item: str, days_ahead: int = 7) -> str:
    """Suggest how much of an item to order for a city, across all channels.

    Applies a 15% safety stock buffer on top of the forecast total.
    Args:
        city: One of Bangalore, Hyderabad, Delhi
        item: Food item e.g. Biryani, Dosa, Burger
        days_ahead: Planning horizon in days (default 7)
    """
    total = total_forecast_qty(city, item, days_ahead=days_ahead)
    if total == 0:
        return f"Not enough historical data to suggest an order for {item} in {city}."

    buffer = int(total * SAFETY_STOCK_PCT)
    order_qty = total + buffer

    return (
        f"Order suggestion for {item} in {city} (next {days_ahead} days):\n"
        f"  Forecasted demand : {total} units\n"
        f"  Safety stock (15%): {buffer} units\n"
        f"  → Order by Day {days_ahead - LEAD_TIME_DAYS}: {order_qty} units total"
    )


@tool
def compare_cities(item: str, days_ahead: int = 7) -> str:
    """Compare forecasted demand for an item across Bangalore, Hyderabad, and Delhi.

    Args:
        item: Food item e.g. Biryani, Dosa, Burger
        days_ahead: Planning horizon in days (default 7)
    """
    cities = available_cities()
    lines = [f"City comparison for {item} (next {days_ahead} days):"]
    for city in cities:
        qty = total_forecast_qty(city, item, days_ahead=days_ahead)
        bar = "█" * (qty // 20)
        lines.append(f"  {city:<12}: {qty:>4} units  {bar}")
    return "\n".join(lines)


@tool
def channel_split(city: str, item: str) -> str:
    """Show the historical order split across Swiggy, Zomato, and Offline for an item in a city.

    Args:
        city: One of Bangalore, Hyderabad, Delhi
        item: Food item e.g. Biryani, Dosa, Burger
    """
    import pandas as pd
    from pathlib import Path

    df = pd.read_csv(Path(__file__).parent.parent / "data" / "orders.csv")
    subset = df[(df["city"] == city) & (df["item"] == item)]
    if subset.empty:
        return f"No data for {item} in {city}."

    totals = subset.groupby("channel")["quantity"].sum()
    grand = totals.sum()
    lines = [f"Channel split for {item} in {city}:"]
    for ch, qty in totals.sort_values(ascending=False).items():
        pct = qty / grand * 100
        lines.append(f"  {ch:<10}: {qty:>5} units ({pct:.1f}%)")
    return "\n".join(lines)

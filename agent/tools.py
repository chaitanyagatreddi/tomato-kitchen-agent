"""LangChain tools for the cloud kitchen demand agent."""

from __future__ import annotations

import json

from langchain_core.tools import tool

from agent.forecaster import available_cities, available_items, forecast, total_forecast_qty

SAFETY_STOCK_PCT = 0.15   # 15% buffer on top of forecast
LEAD_TIME_DAYS = 2        # days before stock needed

# --- Ingredient breakdown per portion (1 order) ---
# Each item maps to its raw ingredients with quantity and unit
INGREDIENT_MAP = {
    "Biryani": [
        {"ingredient": "Basmati Rice", "qty": 0.30, "unit": "kg"},
        {"ingredient": "Chicken", "qty": 0.20, "unit": "kg"},
        {"ingredient": "Onions", "qty": 0.10, "unit": "kg"},
        {"ingredient": "Yogurt", "qty": 0.05, "unit": "kg"},
        {"ingredient": "Spice Kit (biryani)", "qty": 1, "unit": "pkt"},
        {"ingredient": "Cooking Oil", "qty": 0.03, "unit": "L"},
    ],
    "Dosa": [
        {"ingredient": "Dosa Batter", "qty": 0.20, "unit": "L"},
        {"ingredient": "Coconut Chutney", "qty": 0.05, "unit": "kg"},
        {"ingredient": "Sambar", "qty": 0.10, "unit": "L"},
        {"ingredient": "Cooking Oil", "qty": 0.02, "unit": "L"},
    ],
    "Haleem": [
        {"ingredient": "Wheat/Daliya", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Mutton", "qty": 0.20, "unit": "kg"},
        {"ingredient": "Ghee", "qty": 0.03, "unit": "kg"},
        {"ingredient": "Onions (fried)", "qty": 0.05, "unit": "kg"},
        {"ingredient": "Spice Kit (haleem)", "qty": 1, "unit": "pkt"},
    ],
    "North Indian Thali": [
        {"ingredient": "Chapati Flour (atta)", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Rice", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Dal", "qty": 0.10, "unit": "kg"},
        {"ingredient": "Mixed Vegetables", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Paneer", "qty": 0.08, "unit": "kg"},
        {"ingredient": "Cooking Oil", "qty": 0.03, "unit": "L"},
    ],
    "Fried Rice": [
        {"ingredient": "Rice", "qty": 0.25, "unit": "kg"},
        {"ingredient": "Mixed Vegetables", "qty": 0.10, "unit": "kg"},
        {"ingredient": "Soy Sauce", "qty": 0.02, "unit": "L"},
        {"ingredient": "Cooking Oil", "qty": 0.03, "unit": "L"},
        {"ingredient": "Eggs", "qty": 1, "unit": "pcs"},
    ],
    "Burger": [
        {"ingredient": "Burger Buns", "qty": 1, "unit": "pcs"},
        {"ingredient": "Chicken Patty", "qty": 1, "unit": "pcs"},
        {"ingredient": "Lettuce", "qty": 0.03, "unit": "kg"},
        {"ingredient": "Cheese Slice", "qty": 1, "unit": "pcs"},
        {"ingredient": "Sauce Kit", "qty": 1, "unit": "pkt"},
    ],
    "Pizza": [
        {"ingredient": "Pizza Dough", "qty": 0.25, "unit": "kg"},
        {"ingredient": "Mozzarella", "qty": 0.12, "unit": "kg"},
        {"ingredient": "Pizza Sauce", "qty": 0.08, "unit": "L"},
        {"ingredient": "Toppings Mix", "qty": 0.10, "unit": "kg"},
    ],
    "Idli": [
        {"ingredient": "Idli Batter", "qty": 0.25, "unit": "L"},
        {"ingredient": "Coconut Chutney", "qty": 0.05, "unit": "kg"},
        {"ingredient": "Sambar", "qty": 0.10, "unit": "L"},
    ],
    "Rolls": [
        {"ingredient": "Paratha/Wrap", "qty": 1, "unit": "pcs"},
        {"ingredient": "Chicken/Paneer Filling", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Onions", "qty": 0.05, "unit": "kg"},
        {"ingredient": "Sauce Kit", "qty": 1, "unit": "pkt"},
    ],
    "Pasta": [
        {"ingredient": "Pasta", "qty": 0.15, "unit": "kg"},
        {"ingredient": "Pasta Sauce", "qty": 0.12, "unit": "L"},
        {"ingredient": "Cheese (grated)", "qty": 0.04, "unit": "kg"},
        {"ingredient": "Olive Oil", "qty": 0.02, "unit": "L"},
    ],
}


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
        lines.append(f"  {row['ds'].strftime('%a %d %b')}: {max(0, int(row['yhat'])):>4} portions  (range {max(0,int(row['yhat_lower']))}–{max(0,int(row['yhat_upper']))})")
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

    lines = [
        f"Order suggestion for {item} in {city} (next {days_ahead} days):",
        f"  Forecasted demand : {total} portions",
        f"  Safety stock (15%): {buffer} portions",
        f"  → Total to prepare : {order_qty} portions (order by Day {days_ahead - LEAD_TIME_DAYS})",
    ]

    # Add ingredient procurement breakdown
    ingredients = INGREDIENT_MAP.get(item)
    if ingredients:
        lines.append(f"\n  📦 Procurement list ({order_qty} portions of {item}):")
        for ing in ingredients:
            total_qty = round(ing["qty"] * order_qty, 2)
            lines.append(f"    • {ing['ingredient']:<25}: {total_qty:>8} {ing['unit']}")

    return "\n".join(lines)


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
        lines.append(f"  {city:<12}: {qty:>4} portions  {bar}")
    return "\n".join(lines)


@tool
def procurement_list(city: str, days_ahead: int = 7) -> str:
    """Generate a full procurement/grocery list for a city across all items.

    Aggregates forecasted demand for every item, applies safety stock,
    and converts portions into raw ingredient quantities.

    Args:
        city: One of Bangalore, Hyderabad, Delhi
        days_ahead: Planning horizon in days (default 7)
    """
    items = available_items()
    ingredient_totals: dict[str, dict] = {}  # ingredient -> {qty, unit}

    lines = [f"🛒 Procurement list for {city} (next {days_ahead} days):\n"]
    item_lines = []

    for item in items:
        total = total_forecast_qty(city, item, days_ahead=days_ahead)
        if total == 0:
            continue
        order_qty = total + int(total * SAFETY_STOCK_PCT)
        item_lines.append(f"  {item:<20}: {order_qty:>5} portions")

        ingredients = INGREDIENT_MAP.get(item, [])
        for ing in ingredients:
            key = f"{ing['ingredient']} ({ing['unit']})"
            if key not in ingredient_totals:
                ingredient_totals[key] = {"qty": 0, "unit": ing["unit"]}
            ingredient_totals[key]["qty"] += round(ing["qty"] * order_qty, 2)

    lines.append("  ITEM FORECAST (with 15% buffer):")
    lines.extend(item_lines)
    lines.append(f"\n  📦 RAW INGREDIENTS TO PROCURE:")

    for name, data in sorted(ingredient_totals.items()):
        lines.append(f"    • {name:<35}: {data['qty']:>10.1f}")

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
        lines.append(f"  {ch:<10}: {qty:>5} portions ({pct:.1f}%)")
    return "\n".join(lines)

"""Generate synthetic cloud kitchen order data for 3 Indian cities."""

import random
from datetime import date, timedelta

import pandas as pd

random.seed(42)

CITIES = ["Bangalore", "Hyderabad", "Delhi"]
CHANNELS = ["Swiggy", "Zomato", "Offline"]

# City-specific item weights (reflects real cuisine preferences)
CITY_ITEMS = {
    "Bangalore": {
        "Biryani": 0.18, "Dosa": 0.20, "North Indian Thali": 0.12,
        "Fried Rice": 0.10, "Burger": 0.10, "Pizza": 0.08,
        "Idli": 0.12, "Pasta": 0.05, "Rolls": 0.05,
    },
    "Hyderabad": {
        "Biryani": 0.35, "Haleem": 0.15, "Dosa": 0.10,
        "North Indian Thali": 0.10, "Fried Rice": 0.08, "Burger": 0.07,
        "Pizza": 0.05, "Rolls": 0.05, "Pasta": 0.05,
    },
    "Delhi": {
        "North Indian Thali": 0.22, "Biryani": 0.15, "Rolls": 0.15,
        "Burger": 0.12, "Pizza": 0.10, "Fried Rice": 0.08,
        "Dosa": 0.08, "Pasta": 0.05, "Haleem": 0.05,
    },
}

# Channel split per city
CHANNEL_WEIGHTS = {
    "Bangalore": {"Swiggy": 0.45, "Zomato": 0.35, "Offline": 0.20},
    "Hyderabad": {"Swiggy": 0.40, "Zomato": 0.38, "Offline": 0.22},
    "Delhi":     {"Swiggy": 0.38, "Zomato": 0.40, "Offline": 0.22},
}

# Base daily orders per city
BASE_ORDERS = {"Bangalore": 280, "Hyderabad": 220, "Delhi": 260}


def day_multiplier(d: date) -> float:
    """Weekend spike + Friday dinner peak."""
    if d.weekday() == 5:   # Saturday
        return 1.4
    if d.weekday() == 4:   # Friday
        return 1.25
    if d.weekday() == 6:   # Sunday
        return 1.3
    return 1.0


def generate(days: int = 90) -> pd.DataFrame:
    start = date(2024, 1, 1)
    rows = []

    for offset in range(days):
        d = start + timedelta(days=offset)
        mult = day_multiplier(d)

        for city in CITIES:
            items = list(CITY_ITEMS[city].keys())
            item_weights = list(CITY_ITEMS[city].values())
            channels = list(CHANNEL_WEIGHTS[city].keys())
            chan_weights = list(CHANNEL_WEIGHTS[city].values())

            n_orders = int(BASE_ORDERS[city] * mult * random.uniform(0.85, 1.15))

            for _ in range(n_orders):
                item = random.choices(items, weights=item_weights)[0]
                channel = random.choices(channels, weights=chan_weights)[0]
                qty = random.randint(1, 3)
                rows.append({
                    "date": d.isoformat(),
                    "city": city,
                    "item": item,
                    "channel": channel,
                    "quantity": qty,
                })

    df = pd.DataFrame(rows)
    df.to_csv("data/orders.csv", index=False)
    print(f"Generated {len(df):,} rows → data/orders.csv")
    return df


if __name__ == "__main__":
    generate()

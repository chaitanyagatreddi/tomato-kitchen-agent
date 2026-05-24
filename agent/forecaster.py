"""Prophet-based demand forecaster per city / item / channel."""

from __future__ import annotations

import warnings
from functools import lru_cache
from pathlib import Path

import pandas as pd
from prophet import Prophet

warnings.filterwarnings("ignore")

_DATA_PATH = Path(__file__).parent.parent / "data" / "orders.csv"
_df: pd.DataFrame | None = None


def _load() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = pd.read_csv(_DATA_PATH, parse_dates=["date"])
    return _df


def available_cities() -> list[str]:
    return sorted(_load()["city"].unique().tolist())


def available_items() -> list[str]:
    return sorted(_load()["item"].unique().tolist())


def available_channels() -> list[str]:
    return sorted(_load()["channel"].unique().tolist())


@lru_cache(maxsize=256)
def forecast(
    city: str,
    item: str,
    channel: str | None = None,
    days_ahead: int = 7,
) -> pd.DataFrame:
    """Return a daily demand forecast for (city, item[, channel]).

    Returns a DataFrame with columns: ds, yhat, yhat_lower, yhat_upper.
    """
    df = _load()
    mask = (df["city"] == city) & (df["item"] == item)
    if channel:
        mask &= df["channel"] == channel

    series = (
        df[mask]
        .groupby("date")["quantity"]
        .sum()
        .reset_index()
        .rename(columns={"date": "ds", "quantity": "y"})
    )

    if len(series) < 14:
        return pd.DataFrame(columns=["ds", "yhat", "yhat_lower", "yhat_upper"])

    m = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,
        interval_width=0.80,
    )
    m.fit(series)

    future = m.make_future_dataframe(periods=days_ahead)
    preds = m.predict(future)

    return preds[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead).reset_index(drop=True)


def total_forecast_qty(city: str, item: str, channel: str | None = None, days_ahead: int = 7) -> int:
    """Sum of forecasted quantity over the horizon."""
    preds = forecast(city, item, channel, days_ahead)
    if preds.empty:
        return 0
    return max(0, int(preds["yhat"].clip(lower=0).sum()))

"""Streamlit UI for the cloud kitchen demand planning agent."""

import uuid
from pathlib import Path

import pandas as pd
import streamlit as st

st.set_page_config(page_title="Cloud Kitchen Demand Agent", page_icon="🍱", layout="wide")

# ── sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("🍱 Cloud Kitchen Agent")
    st.caption("Demand planning for Bangalore · Hyderabad · Delhi")
    st.divider()

    st.subheader("Quick actions")
    starters = [
        "How much Biryani should I order for Hyderabad next week?",
        "Compare Dosa demand across all 3 cities",
        "What's the Swiggy vs Zomato split for Burger in Delhi?",
        "Forecast demand for North Indian Thali in Bangalore for 14 days",
    ]
    for s in starters:
        if st.button(s, use_container_width=True):
            st.session_state.pending_input = s

    st.divider()
    if st.button("Clear chat", use_container_width=True):
        st.session_state.messages = []
        st.session_state.thread_id = str(uuid.uuid4())

# ── session state ─────────────────────────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = []
if "thread_id" not in st.session_state:
    st.session_state.thread_id = str(uuid.uuid4())

# ── data tab + chat tab ───────────────────────────────────────────────────────
chat_tab, data_tab = st.tabs(["💬 Chat", "📊 Order Data"])

with data_tab:
    data_path = Path("data/orders.csv")
    if data_path.exists():
        df = pd.read_csv(data_path, parse_dates=["date"])
        col1, col2, col3 = st.columns(3)
        col1.metric("Total orders", f"{len(df):,}")
        col2.metric("Date range", f"{df['date'].min().date()} → {df['date'].max().date()}")
        col3.metric("Cities", df["city"].nunique())

        st.subheader("Daily orders by city")
        pivot = df.groupby(["date", "city"])["quantity"].sum().reset_index()
        chart_data = pivot.pivot(index="date", columns="city", values="quantity").fillna(0)
        st.line_chart(chart_data)

        st.subheader("Top items by city")
        for city in sorted(df["city"].unique()):
            with st.expander(city):
                top = (
                    df[df["city"] == city]
                    .groupby("item")["quantity"]
                    .sum()
                    .sort_values(ascending=False)
                    .reset_index()
                )
                st.dataframe(top, use_container_width=True, hide_index=True)
    else:
        st.warning("Run `python data/mock_data.py` to generate order data first.")

with chat_tab:
    # render history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # handle sidebar quick-action button
    prefill = st.session_state.pop("pending_input", None)

    user_input = st.chat_input("Ask about demand, orders, or channel split...") or prefill

    if user_input:
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                from agent.graph import run
                response = run(user_input, thread_id=st.session_state.thread_id)
            st.markdown(response)

        st.session_state.messages.append({"role": "assistant", "content": response})

"""LangGraph ReAct agent for cloud kitchen demand planning."""

from __future__ import annotations

from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

from agent.tools import channel_split, compare_cities, forecast_demand, procurement_list, suggest_order

SYSTEM_PROMPT = """You are a supply and demand planning assistant for cloud kitchens in India.
You help kitchen ops managers in Bangalore, Hyderabad, and Delhi with:
- Forecasting demand for food items
- Suggesting how much to order and by when
- Comparing demand across cities
- Understanding channel breakdown (Swiggy vs Zomato vs Offline)
- Generating procurement lists with raw ingredient quantities

Always report demand in "portions" (1 portion = 1 customer order). When suggesting orders, include the raw ingredient breakdown so kitchen ops knows exactly what to procure.
Always be specific with numbers. When suggesting orders, mention the city and deadline clearly.
If the user doesn't specify a city, ask which city or cover all three.
Available items: Biryani, Dosa, North Indian Thali, Fried Rice, Burger, Pizza, Idli, Pasta, Rolls, Haleem.
Available cities: Bangalore, Hyderabad, Delhi.
Available channels: Swiggy, Zomato, Offline."""

_agent = None


def get_agent():
    global _agent
    if _agent is None:
        model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        _agent = create_react_agent(
            model,
            tools=[forecast_demand, suggest_order, compare_cities, channel_split, procurement_list],
            prompt=SYSTEM_PROMPT,
        )
    return _agent


def run(message: str, thread_id: str = "default") -> str:
    """Run the agent and return the final text response."""
    agent = get_agent()
    config = {"configurable": {"thread_id": thread_id}}
    result = agent.invoke({"messages": [("human", message)]}, config=config)
    return result["messages"][-1].content

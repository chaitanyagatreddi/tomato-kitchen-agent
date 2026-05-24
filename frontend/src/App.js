import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ChatPane from './components/ChatPane';
import ChannelChart from './components/ChannelChart';
import ForecastLineChart from './components/ForecastLineChart';
import ForecastTable from './components/ForecastTable';
import Sidebar from './components/Sidebar';
import { useAgent } from './hooks/useAgent';
const CITIES = ['Bangalore', 'Hyderabad', 'Delhi'];
export default function App() {
    const [city, setCity] = useState('Hyderabad');
    const { messages, send, reset, connected } = useAgent();
    function handleQuickAction(q) {
        send(q);
    }
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-bg text-[#e2f0ee]", children: [_jsx(Sidebar, { city: city, onCityChange: setCity, onQuickAction: handleQuickAction, onReset: reset, connected: connected }), _jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [_jsxs("header", { className: "bg-surface border-b border-border h-[52px] flex items-center justify-between px-6 flex-shrink-0", children: [_jsx("span", { className: "font-semibold text-sm tracking-tight", children: "Supply & Demand Forecasting" }), _jsx("div", { className: "flex gap-2", children: CITIES.map(c => (_jsx("span", { onClick: () => setCity(c), className: `text-[11px] font-semibold px-2 py-1 rounded border cursor-pointer transition-all
                  ${city === c
                                        ? 'text-teal border-teal/40 bg-teal/10'
                                        : 'text-muted border-border hover:border-muted'}`, children: c }, c))) }), _jsx("span", { className: "text-[11px] font-mono text-muted", children: "gpt-4o-mini" })] }), _jsx("div", { className: "flex-1 overflow-hidden flex flex-col", children: _jsx(ChatPane, { messages: messages, onSend: send }) }), _jsxs("div", { className: "flex h-[220px] min-h-[220px] border-t border-border flex-shrink-0", children: [_jsx("div", { className: "w-[240px] min-w-[240px] overflow-hidden border-r border-border", children: _jsx(ForecastTable, { city: city }) }), _jsx("div", { className: "flex-1 overflow-hidden border-r border-border", children: _jsx(ForecastLineChart, { city: city }) }), _jsx("div", { className: "w-[260px] min-w-[260px] overflow-hidden", children: _jsx(ChannelChart, { city: city }) })] })] })] }));
}

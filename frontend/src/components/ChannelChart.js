import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, } from 'recharts';
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length)
        return null;
    const d = payload[0];
    return (_jsxs("div", { className: "bg-surface border border-border rounded px-3 py-1.5 text-xs", children: [_jsx("span", { style: { color: d.payload.color }, className: "font-semibold", children: d.payload.name }), _jsxs("span", { className: "text-muted ml-2", children: [d.value, "%"] })] }));
};
export default function ChannelChart({ city }) {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch(`/api/channels/${city}`)
            .then(r => r.json())
            .then(setData)
            .catch(() => null);
    }, [city]);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0", children: [_jsx("span", { className: "text-[11px] font-semibold text-muted uppercase tracking-wider", children: "Channel Split" }), _jsxs("span", { className: "text-[11px] font-mono text-muted", children: [city, " \u00B7 All items"] })] }), _jsx("div", { className: "flex-1 overflow-hidden flex flex-col px-2 pt-2 pb-1 gap-2 min-h-0", children: !data ? (_jsx("p", { className: "text-muted text-xs text-center py-4", children: "Loading\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex-1 min-h-0", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data.channels, layout: "vertical", margin: { top: 0, right: 28, left: 4, bottom: 0 }, barCategoryGap: "30%", children: [_jsx(XAxis, { type: "number", domain: [0, 100], tick: { fill: '#5f8a85', fontSize: 10 }, tickLine: false, axisLine: false, tickFormatter: v => `${v}%` }), _jsx(YAxis, { type: "category", dataKey: "name", tick: { fill: '#e2f0ee', fontSize: 11 }, tickLine: false, axisLine: false, width: 52 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}), cursor: { fill: 'rgba(0,204,188,0.05)' } }), _jsx(Bar, { dataKey: "pct", radius: [0, 3, 3, 0], children: data.channels.map(ch => (_jsx(Cell, { fill: ch.color }, ch.name))) })] }) }) }), _jsxs("div", { className: "border-t border-border pt-1.5 flex-shrink-0", children: [_jsx("p", { className: "text-[10px] text-muted mb-1 px-1", children: "Peak order slots" }), _jsx("div", { className: "flex flex-wrap gap-1 px-1", children: data.peaks.map((p, i) => (_jsx("span", { className: "text-[10px] px-2 py-0.5 rounded", style: {
                                            background: i === 0 ? 'rgba(252,128,25,0.12)' : i === 1 ? 'rgba(226,55,68,0.12)' : 'rgba(107,114,128,0.15)',
                                            color: i === 0 ? '#FC8019' : i === 1 ? '#E23744' : '#9ca3af',
                                        }, children: p }, p))) })] })] })) })] }));
}

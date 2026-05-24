import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from 'recharts';
const ITEMS = ['Biryani', 'Butter Chicken', 'Dosa', 'Paneer Tikka', 'Veg Thali', 'Dal Makhani', 'Pav Bhaji'];
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length)
        return null;
    const f = payload.find((p) => p.dataKey === 'forecast');
    const lo = payload.find((p) => p.dataKey === 'low');
    const hi = payload.find((p) => p.dataKey === 'high');
    return (_jsxs("div", { className: "bg-surface border border-border rounded px-3 py-2 text-xs space-y-0.5", children: [_jsx("p", { className: "text-muted font-mono mb-1", children: label }), f && _jsxs("p", { className: "text-teal font-semibold", children: ["Forecast: ", f.value] }), lo && hi && (_jsxs("p", { className: "text-muted", children: ["Range: ", lo.value, " \u2013 ", hi.value] }))] }));
};
export default function ForecastLineChart({ city }) {
    const [item, setItem] = useState('Biryani');
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch(`/api/forecast-daily/${city}?item=${encodeURIComponent(item)}&days=7`)
            .then(r => r.json())
            .then(setData)
            .catch(() => null);
    }, [city, item]);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0", children: [_jsx("span", { className: "text-[11px] font-semibold text-muted uppercase tracking-wider", children: "7-Day Forecast" }), _jsx("select", { value: item, onChange: e => setItem(e.target.value), className: "text-[11px] font-mono bg-surface2 border border-border rounded px-2 py-0.5 text-[#e2f0ee] focus:outline-none focus:border-teal/50 cursor-pointer", children: ITEMS.map(i => (_jsx("option", { value: i, children: i }, i))) })] }), _jsx("div", { className: "flex-1 min-h-0 px-2 pt-2 pb-1", children: !data ? (_jsx("p", { className: "text-muted text-xs text-center py-4", children: "Loading\u2026" })) : (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(ComposedChart, { data: data.points, margin: { top: 4, right: 12, left: -8, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)", vertical: false }), _jsx(XAxis, { dataKey: "date", tick: { fill: '#5f8a85', fontSize: 10 }, tickLine: false, axisLine: false }), _jsx(YAxis, { tick: { fill: '#5f8a85', fontSize: 10 }, tickLine: false, axisLine: false, width: 32 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Area, { type: "monotone", dataKey: "high", stroke: "none", fill: "rgba(0,204,188,0.08)", legendType: "none" }), _jsx(Area, { type: "monotone", dataKey: "low", stroke: "none", fill: "#0b1614", legendType: "none" }), _jsx(Line, { type: "monotone", dataKey: "forecast", stroke: "#00CCBC", strokeWidth: 2, dot: { fill: '#00CCBC', r: 3, strokeWidth: 0 }, activeDot: { r: 5, fill: '#00CCBC', strokeWidth: 0 } })] }) })) })] }));
}

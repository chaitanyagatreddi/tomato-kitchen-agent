import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export default function ForecastTable({ city }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        fetch(`/api/forecast/${city}`)
            .then(r => r.json())
            .then(d => { setRows(d.rows ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [city]);
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0", children: [_jsx("span", { className: "text-[11px] font-semibold text-muted uppercase tracking-wider", children: "7-Day Forecast" }), _jsx("span", { className: "text-[11px] font-mono text-muted", children: city })] }), _jsx("div", { className: "overflow-y-auto flex-1", children: _jsxs("table", { className: "w-full text-[12.5px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-surface2", children: [_jsx("th", { className: "text-left px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border", children: "Item" }), _jsx("th", { className: "text-right px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border", children: "Forecast" }), _jsx("th", { className: "text-right px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border", children: "Order Qty" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "text-center text-muted py-6 text-xs", children: "Loading\u2026" }) })) : rows.map((r, i) => (_jsxs("tr", { className: `border-b border-border/50 hover:bg-white/[0.02] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`, children: [_jsx("td", { className: "px-3 py-1.5 font-medium text-[#e2f0ee]", children: r.item }), _jsx("td", { className: "px-3 py-1.5 text-right font-mono text-teal/80", children: r.forecast.toLocaleString() }), _jsx("td", { className: "px-3 py-1.5 text-right font-mono font-bold text-teal", children: r.order_qty.toLocaleString() })] }, r.item))) })] }) })] }));
}

import { useEffect, useState } from 'react'

type Row = { item: string; forecast: number; order_qty: number }

export default function ForecastTable({ city }: { city: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/forecast/${city}`)
      .then(r => r.json())
      .then(d => { setRows(d.rows ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [city])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">7-Day Forecast</span>
        <span className="text-[11px] font-mono text-muted">{city}</span>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="bg-surface2">
              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border">Item</th>
              <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border">Forecast</th>
              <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wide border-b border-border">Order Qty</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center text-muted py-6 text-xs">Loading…</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.item} className={`border-b border-border/50 hover:bg-white/[0.02] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-3 py-1.5 font-medium text-[#e2f0ee]">{r.item}</td>
                <td className="px-3 py-1.5 text-right font-mono text-teal/80">{r.forecast.toLocaleString()}</td>
                <td className="px-3 py-1.5 text-right font-mono font-bold text-teal">{r.order_qty.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

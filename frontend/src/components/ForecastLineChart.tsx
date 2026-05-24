import { useEffect, useState } from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

type Point = { date: string; forecast: number; low: number; high: number }
type Data = { city: string; item: string; points: Point[] }

const ITEMS = ['Biryani', 'Butter Chicken', 'Dosa', 'Paneer Tikka', 'Veg Thali', 'Dal Makhani', 'Pav Bhaji']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const f = payload.find((p: any) => p.dataKey === 'forecast')
  const lo = payload.find((p: any) => p.dataKey === 'low')
  const hi = payload.find((p: any) => p.dataKey === 'high')
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs space-y-0.5">
      <p className="text-muted font-mono mb-1">{label}</p>
      {f && <p className="text-teal font-semibold">Forecast: {f.value}</p>}
      {lo && hi && (
        <p className="text-muted">Range: {lo.value} – {hi.value}</p>
      )}
    </div>
  )
}

export default function ForecastLineChart({ city }: { city: string }) {
  const [item, setItem] = useState('Biryani')
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch(`/api/forecast-daily/${city}?item=${encodeURIComponent(item)}&days=7`)
      .then(r => r.json())
      .then(setData)
      .catch(() => null)
  }, [city, item])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">7-Day Forecast</span>
        <select
          value={item}
          onChange={e => setItem(e.target.value)}
          className="text-[11px] font-mono bg-surface2 border border-border rounded px-2 py-0.5 text-[#e2f0ee] focus:outline-none focus:border-teal/50 cursor-pointer"
        >
          {ITEMS.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0 px-2 pt-2 pb-1">
        {!data ? (
          <p className="text-muted text-xs text-center py-4">Loading…</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.points} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#5f8a85', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#5f8a85', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Confidence band */}
              <Area
                type="monotone"
                dataKey="high"
                stroke="none"
                fill="rgba(0,204,188,0.08)"
                legendType="none"
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="none"
                fill="#0b1614"
                legendType="none"
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#00CCBC"
                strokeWidth={2}
                dot={{ fill: '#00CCBC', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00CCBC', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

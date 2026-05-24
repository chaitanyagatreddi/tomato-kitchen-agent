import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

type Channel = { name: string; pct: number; color: string }
type Data = { channels: Channel[]; peaks: string[] }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-surface border border-border rounded px-3 py-1.5 text-xs">
      <span style={{ color: d.payload.color }} className="font-semibold">{d.payload.name}</span>
      <span className="text-muted ml-2">{d.value}%</span>
    </div>
  )
}

export default function ChannelChart({ city }: { city: string }) {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch(`/api/channels/${city}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => null)
  }, [city])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Channel Split</span>
        <span className="text-[11px] font-mono text-muted">{city} · All items</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-2 pt-2 pb-1 gap-2 min-h-0">
        {!data ? (
          <p className="text-muted text-xs text-center py-4">Loading…</p>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.channels}
                  layout="vertical"
                  margin={{ top: 0, right: 28, left: 4, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#5f8a85', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#e2f0ee', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,204,188,0.05)' }} />
                  <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                    {data.channels.map(ch => (
                      <Cell key={ch.name} fill={ch.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-border pt-1.5 flex-shrink-0">
              <p className="text-[10px] text-muted mb-1 px-1">Peak order slots</p>
              <div className="flex flex-wrap gap-1 px-1">
                {data.peaks.map((p, i) => (
                  <span
                    key={p}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: i === 0 ? 'rgba(252,128,25,0.12)' : i === 1 ? 'rgba(226,55,68,0.12)' : 'rgba(107,114,128,0.15)',
                      color: i === 0 ? '#FC8019' : i === 1 ? '#E23744' : '#9ca3af',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import ChatPane from './components/ChatPane'
import ChannelChart from './components/ChannelChart'
import ForecastLineChart from './components/ForecastLineChart'
import ForecastTable from './components/ForecastTable'
import Sidebar from './components/Sidebar'
import { useAgent } from './hooks/useAgent'

const CITIES = ['Bangalore', 'Hyderabad', 'Delhi']

export default function App() {
  const [city, setCity] = useState('Hyderabad')
  const [item, setItem] = useState('Biryani')
  const { messages, send, reset, connected } = useAgent()

  function handleQuickAction(q: string) {
    send(q)
  }

  function handleItemChange(i: string) {
    setItem(i)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-[#e2f0ee]">
      <Sidebar
        city={city}
        item={item}
        onCityChange={setCity}
        onItemChange={handleItemChange}
        onQuickAction={handleQuickAction}
        onReset={reset}
        connected={connected}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="bg-surface border-b border-border h-[52px] flex items-center justify-between px-6 flex-shrink-0">
          <span className="font-semibold text-sm tracking-tight">Supply & Demand Forecasting</span>
          <div className="flex gap-2">
            {CITIES.map(c => (
              <span
                key={c}
                onClick={() => setCity(c)}
                className={`text-[11px] font-semibold px-2 py-1 rounded border cursor-pointer transition-all
                  ${city === c
                    ? 'text-teal border-teal/40 bg-teal/10'
                    : 'text-muted border-border hover:border-muted'}`}
              >
                {c}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-mono text-muted">gpt-4o-mini</span>
        </header>

        {/* Chat */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatPane messages={messages} onSend={send} />
        </div>

        {/* Data panels */}
        <div className="flex h-[220px] min-h-[220px] border-t border-border flex-shrink-0">
          <div className="w-[240px] min-w-[240px] overflow-hidden border-r border-border">
            <ForecastTable city={city} />
          </div>
          <div className="flex-1 overflow-hidden border-r border-border">
            <ForecastLineChart city={city} />
          </div>
          <div className="w-[260px] min-w-[260px] overflow-hidden">
            <ChannelChart city={city} />
          </div>
        </div>
      </div>
    </div>
  )
}

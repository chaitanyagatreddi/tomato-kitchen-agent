type Props = {
  city: string
  onCityChange: (c: string) => void
  onQuickAction: (q: string) => void
  onReset: () => void
  connected: boolean
}

const CITIES = [
  { name: 'Bangalore', code: 'BLR' },
  { name: 'Hyderabad', code: 'HYD' },
  { name: 'Delhi',     code: 'DEL' },
]

const QUICK_ACTIONS = [
  'How much Biryani to order for Hyderabad next week?',
  'Compare Dosa demand across all 3 cities',
  'Swiggy vs Zomato split for Burger in Delhi?',
  'Forecast North Indian Thali in Bangalore (14 days)',
]

export default function Sidebar({ city, onCityChange, onQuickAction, onReset, connected }: Props) {
  return (
    <aside className="w-60 min-w-[240px] bg-surface border-r border-border flex flex-col p-4 gap-6 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
             style={{ background: 'linear-gradient(135deg,#00CCBC,#00857A)' }}>
          🍅
        </div>
        <span>Tomato Kitchen</span>
        <span className={`ml-auto w-2 h-2 rounded-full ${connected ? 'bg-teal' : 'bg-red-500'}`} />
      </div>

      {/* Cities */}
      <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">City</p>
        <div className="flex flex-col gap-1">
          {CITIES.map(c => (
            <button
              key={c.name}
              onClick={() => onCityChange(c.name)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium border transition-all
                ${city === c.name
                  ? 'bg-teal/10 border-teal/30 text-teal'
                  : 'border-transparent hover:bg-surface2 text-[#e2f0ee]'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${city === c.name ? 'bg-teal' : 'bg-muted'}`} />
                {c.name}
              </span>
              <span className="text-[10px] font-mono text-muted bg-surface2 px-1.5 py-0.5 rounded">
                {c.code}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Quick Actions</p>
        <div className="flex flex-col gap-1">
          {QUICK_ACTIONS.map(q => (
            <button
              key={q}
              onClick={() => onQuickAction(q)}
              className="text-left text-[12px] text-muted leading-snug px-3 py-2 rounded-lg bg-surface2 border border-border hover:border-teal hover:text-[#e2f0ee] hover:bg-teal/5 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-[12px] text-muted hover:text-[#e2f0ee] py-2 border border-border rounded-lg hover:border-muted transition-all"
      >
        Clear chat
      </button>
    </aside>
  )
}

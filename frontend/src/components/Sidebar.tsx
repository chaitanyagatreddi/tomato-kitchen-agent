type Props = {
  city: string
  item: string
  onCityChange: (c: string) => void
  onItemChange: (i: string) => void
  onQuickAction: (q: string) => void
  onReset: () => void
  connected: boolean
}

const CITIES = [
  { name: 'Bangalore', code: 'BLR' },
  { name: 'Hyderabad', code: 'HYD' },
  { name: 'Delhi',     code: 'DEL' },
]

const ITEM_EMOJI: Record<string, string> = {
  'Biryani': '🍚', 'Dosa': '🥞', 'Haleem': '🍲',
  'North Indian Thali': '🍛', 'Fried Rice': '🍜', 'Burger': '🍔',
  'Pizza': '🍕', 'Idli': '🫓', 'Rolls': '🌯', 'Pasta': '🍝',
}

// City-specific menus sorted by popularity
const CITY_ITEMS: Record<string, string[]> = {
  'Bangalore': ['Dosa', 'Biryani', 'North Indian Thali', 'Idli', 'Fried Rice', 'Burger', 'Pizza'],
  'Hyderabad': ['Biryani', 'Haleem', 'Dosa', 'North Indian Thali', 'Fried Rice', 'Burger', 'Rolls'],
  'Delhi':     ['North Indian Thali', 'Biryani', 'Rolls', 'Burger', 'Pizza', 'Fried Rice', 'Dosa'],
}

const QUICK_ACTIONS = [
  'How much {item} to order for {city} next week?',
  'Compare {item} demand across all 3 cities',
  'Swiggy vs Zomato split for {item} in {city}?',
  'Full procurement list for {city} (7 days)',
]

export default function Sidebar({ city, item, onCityChange, onItemChange, onQuickAction, onReset, connected }: Props) {
  function fillTemplate(q: string) {
    return q.replace(/\{city\}/g, city).replace(/\{item\}/g, item)
  }

  return (
    <aside className="w-60 min-w-[240px] bg-surface border-r border-border flex flex-col p-4 gap-5 overflow-y-auto">
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

      {/* Items — city-specific menu */}
      <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Menu — {city}</p>
        <div className="flex flex-wrap gap-1">
          {(CITY_ITEMS[city] || []).map(name => (
            <button
              key={name}
              onClick={() => onItemChange(name)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                ${item === name
                  ? 'bg-tomato/10 border-tomato/30 text-tomato'
                  : 'border-border hover:bg-surface2 text-muted hover:text-[#e2f0ee]'}`}
            >
              <span>{ITEM_EMOJI[name] || '🍽️'}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2">Quick Actions</p>
        <div className="flex flex-col gap-1">
          {QUICK_ACTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onQuickAction(fillTemplate(q))}
              className="text-left text-[12px] text-muted leading-snug px-3 py-2 rounded-lg bg-surface2 border border-border hover:border-teal hover:text-[#e2f0ee] hover:bg-teal/5 transition-all"
            >
              {fillTemplate(q)}
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

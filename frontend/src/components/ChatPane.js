import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
function renderContent(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="font-mono text-[12px] bg-white/5 px-1 py-0.5 rounded">$1</code>')
        .replace(/\n/g, '<br/>');
}
export default function ChatPane({ messages, onSend }) {
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    function handleSend() {
        const t = input.trim();
        if (!t)
            return;
        onSend(t);
        setInput('');
        if (textareaRef.current)
            textareaRef.current.style.height = 'auto';
    }
    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }
    function handleInput(e) {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }
    return (_jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [_jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4", children: [messages.map(msg => (_jsxs("div", { className: `flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`, children: [_jsx("div", { className: `w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold
              ${msg.role === 'user'
                                    ? 'bg-teal/10 text-teal'
                                    : 'bg-tomato/10 text-tomato'}`, children: msg.role === 'user' ? 'U' : 'K' }), _jsx("div", { className: `max-w-[72%] px-3.5 py-2.5 rounded-xl text-[13.5px] leading-relaxed
              ${msg.role === 'user'
                                    ? 'bg-teal/8 border border-teal/20 rounded-tr-sm text-teal/90'
                                    : 'bg-surface2 border border-border rounded-tl-sm'}`, children: msg.thinking ? (_jsx("div", { className: "flex gap-1 items-center py-0.5", children: [0, 1, 2].map(i => (_jsx("span", { className: "dot-bounce w-1.5 h-1.5 rounded-full bg-muted block" }, i))) })) : (_jsx("span", { dangerouslySetInnerHTML: { __html: renderContent(msg.content) } })) })] }, msg.id))), _jsx("div", { ref: bottomRef })] }), _jsxs("div", { className: "px-6 py-3 border-t border-border bg-surface flex gap-2.5 items-end", children: [_jsx("textarea", { ref: textareaRef, rows: 1, value: input, onChange: handleInput, onKeyDown: handleKey, placeholder: "Ask about demand, orders, or channel split\u2026", className: "flex-1 bg-surface2 border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#e2f0ee] placeholder-muted resize-none outline-none focus:border-teal transition-colors min-h-[42px] max-h-[120px]" }), _jsx("button", { onClick: handleSend, className: "w-[42px] h-[42px] rounded-xl bg-teal text-bg font-bold text-lg flex-shrink-0 flex items-center justify-center hover:opacity-85 transition-opacity", children: "\u2191" })] })] }));
}

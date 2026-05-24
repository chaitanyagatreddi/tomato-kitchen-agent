import { useCallback, useEffect, useRef, useState } from 'react';
const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/chat`;
export function useAgent() {
    const [messages, setMessages] = useState([
        {
            id: 'intro',
            role: 'agent',
            content: "Hi! I'm your cloud kitchen demand planner. Ask me about forecast demand, order quantities, or channel splits across **Bangalore**, **Hyderabad**, and **Delhi**.\n\nTry: *\"How much Biryani should I order for Hyderabad next week?\"*",
        },
    ]);
    const [connected, setConnected] = useState(false);
    const ws = useRef(null);
    const threadId = useRef(`thread-${Date.now()}`);
    useEffect(() => {
        function connect() {
            const socket = new WebSocket(WS_URL);
            ws.current = socket;
            socket.onopen = () => setConnected(true);
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'thinking') {
                    setMessages(prev => [
                        ...prev.filter(m => m.id !== 'thinking'),
                        { id: 'thinking', role: 'agent', content: '', thinking: true },
                    ]);
                }
                else if (data.type === 'response') {
                    setMessages(prev => [
                        ...prev.filter(m => m.id !== 'thinking'),
                        { id: `agent-${Date.now()}`, role: 'agent', content: data.content },
                    ]);
                }
                else if (data.type === 'error') {
                    setMessages(prev => [
                        ...prev.filter(m => m.id !== 'thinking'),
                        { id: `err-${Date.now()}`, role: 'agent', content: `Error: ${data.content}` },
                    ]);
                }
            };
            socket.onclose = () => {
                setConnected(false);
                setTimeout(connect, 2000);
            };
        }
        connect();
        return () => ws.current?.close();
    }, []);
    const send = useCallback((text) => {
        if (!text.trim())
            return;
        setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text }]);
        ws.current?.send(JSON.stringify({ message: text, thread_id: threadId.current }));
    }, []);
    const reset = useCallback(() => {
        threadId.current = `thread-${Date.now()}`;
        setMessages([{
                id: 'intro',
                role: 'agent',
                content: "Hi! I'm your cloud kitchen demand planner. Ask me about forecast demand, order quantities, or channel splits across **Bangalore**, **Hyderabad**, and **Delhi**.",
            }]);
    }, []);
    return { messages, send, reset, connected };
}

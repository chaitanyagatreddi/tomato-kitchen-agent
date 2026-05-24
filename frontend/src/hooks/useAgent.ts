import { useCallback, useEffect, useRef, useState } from 'react'

export type Message = {
  id: string
  role: 'user' | 'agent'
  content: string
  thinking?: boolean
}

const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/chat`

export function useAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'agent',
      content: "Hi! I'm your cloud kitchen demand planner.\n\n**Step 1:** Pick a **city** and **item** from the sidebar\n**Step 2:** Ask about forecast demand, order quantities, procurement, or channel splits\n\nTry: *\"How much Biryani should I order for Hyderabad next week?\"*\n\nI'll show you **portions** (1 portion = 1 customer order) and break it down into **raw ingredients** for procurement.",
    },
  ])
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const threadId = useRef(`thread-${Date.now()}`)

  useEffect(() => {
    function connect() {
      const socket = new WebSocket(WS_URL)
      ws.current = socket

      socket.onopen = () => setConnected(true)

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.type === 'thinking') {
          setMessages(prev => [
            ...prev.filter(m => m.id !== 'thinking'),
            { id: 'thinking', role: 'agent', content: '', thinking: true },
          ])
        } else if (data.type === 'response') {
          setMessages(prev => [
            ...prev.filter(m => m.id !== 'thinking'),
            { id: `agent-${Date.now()}`, role: 'agent', content: data.content },
          ])
        } else if (data.type === 'error') {
          setMessages(prev => [
            ...prev.filter(m => m.id !== 'thinking'),
            { id: `err-${Date.now()}`, role: 'agent', content: `Error: ${data.content}` },
          ])
        }
      }

      socket.onclose = () => {
        setConnected(false)
        setTimeout(connect, 2000)
      }
    }

    connect()
    return () => ws.current?.close()
  }, [])

  const send = useCallback((text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: text }])
    ws.current?.send(JSON.stringify({ message: text, thread_id: threadId.current }))
  }, [])

  const reset = useCallback(() => {
    threadId.current = `thread-${Date.now()}`
    setMessages([{
      id: 'intro',
      role: 'agent',
      content: "Hi! I'm your cloud kitchen demand planner.\n\n**Step 1:** Pick a **city** and **item** from the sidebar\n**Step 2:** Ask about forecast demand, order quantities, procurement, or channel splits",
    }])
  }, [])

  return { messages, send, reset, connected }
}

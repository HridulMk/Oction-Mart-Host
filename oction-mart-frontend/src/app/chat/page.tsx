"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { config } from '@/config/environment';

const BASE_URL = config.API_BASE_URL;
const ADMIN_ID = 1 ; // Admin ID for support

export default function Chat() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load user & token
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      const user = JSON.parse(storedUser);
      setCurrentUserId(Number(user.id));
    } else {
      console.warn('No auth token or user found.');
    }
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token || !currentUserId) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/${ADMIN_ID}/history/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const lastMsg = data[data.length - 1];
          setConversations([{
            id: ADMIN_ID,
            name: 'Admin Support',
            avatar: '/products/default-avatar.jpg',
            last_message: lastMsg.message,
            last_time: new Date(lastMsg.timestamp).toLocaleString(),
            unread: 0,
          }]);
        } else {
          setConversations([]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Stable fetchConversations useEffect
  useEffect(() => {
    if (token && currentUserId) fetchConversations();
  }, [token, currentUserId]); // only primitives

  // Fetch chat history
  const fetchChatHistory = async () => {
    if (!selectedReceiver || !token) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/${selectedReceiver}/history/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // When selectedReceiver changes, fetch history & cleanup SSE
  useEffect(() => {
    fetchChatHistory();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [selectedReceiver, token]); // only stable dependencies

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); // track length, stable

  // SSE
  const startSSE = () => {
  if (!selectedReceiver || !token) return;

  // Close previous SSE if any
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    eventSourceRef.current = null;
  }

  const lastId = messages.length ? Math.max(...messages.map(m => m.id || 0)) : 0;
  const sseUrl = `${BASE_URL}/chat/${selectedReceiver}/stream/?last_id=${lastId}`;

  eventSourceRef.current = new EventSource(sseUrl);

  eventSourceRef.current.onopen = () => console.log('SSE connected');

  eventSourceRef.current.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      setMessages(prev => prev.some(msg => msg.id === data.id) ? prev : [...prev, data]);
    } catch (err) {
      console.error('SSE parse error:', err);
    }
  };

  eventSourceRef.current.onerror = () => {
    console.warn('SSE connection error. Will retry in 3s');
    if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
      setTimeout(startSSE, 3000);
    }
  };
};

// Only run once per selectedReceiver change
useEffect(() => {
  if (selectedReceiver) startSSE();

  return () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };
}, [selectedReceiver]); // <- DO NOT include messages here

  // Start SSE when receiver changes
  useEffect(() => {
    if (selectedReceiver) {
      const timer = setTimeout(() => startSSE(), 500);
      return () => clearTimeout(timer);
    }
  }, [selectedReceiver]); // don't use messages array here

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedReceiver || !token) return;
    try {
      const res = await fetch(`${BASE_URL}/chat/send/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: selectedReceiver, message: inputMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data]);
        setInputMessage('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedUser = conversations.find(c => c.id === selectedReceiver);
  const startNewSupportChat = () => setSelectedReceiver(ADMIN_ID);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ width: "100%", minHeight: 580, position: "relative", display: "flex", flexDirection: "column", background: `url('/products/III.png') center/cover no-repeat` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(255,255,255,0.55)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 260, marginTop: 18 }}>
          <img src="/logo2.jpg" alt="logo" style={{ width: 120, height: 120, borderRadius: 16, marginBottom: 12, objectFit: "cover" }} />
          <h1 style={{ fontSize: 48, fontWeight: 700, color: "black", margin: 0, letterSpacing: 1, textShadow: "0 2px 8px #fff8" }}>Support Chat</h1>
          <div style={{ color: "black", fontSize: 22, margin: "10px 0 24px 0", fontWeight: 500, textShadow: "0 2px 8px #fff8" }}>Chat with admin for queries and support</div>
          <button style={startSellingBtnStyle} onClick={startNewSupportChat}>New Support Query</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ background: "#181818", color: "#fff", display: "flex", minHeight: "calc(100vh - 580px)" }}>
        {/* Sidebar */}
        <section style={{ width: 300, background: "#232323", padding: "1rem", overflowY: "auto" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Support Threads</h2>
          {loadingConversations ? <div style={{ color: "#bbb", textAlign: "center" }}>Loading...</div> :
            conversations.length === 0 ? <div style={{ color: "#bbb", textAlign: "center" }}>No active support thread. Click "New Support Query" to start chatting with admin!</div> :
            conversations.map(conv => (
              <div key={conv.id} style={{ display: "flex", alignItems: "center", background: selectedReceiver === conv.id ? "#8A2BE2" : "transparent", borderRadius: 12, padding: 12, marginBottom: 12, cursor: "pointer" }} onClick={() => setSelectedReceiver(conv.id)}>
                <img src={conv.avatar} alt={conv.name} style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 12, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{conv.name}</div>
                  <div style={{ color: "#bbb", fontSize: 12, marginTop: 2 }}>{conv.last_message || 'Start chatting...'}</div>
                </div>
                <div style={{ color: "#bbb", fontSize: 12, textAlign: "right" }}>{conv.last_time}</div>
              </div>
            ))
          }
        </section>

        {/* Chat Area */}
        <section style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedReceiver ? (
            <>
              <div style={{ padding: "1rem", borderBottom: "1px solid #333", background: "#232323" }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{selectedUser?.name || 'Admin'}</h2>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#181818" }}>
                {loadingMessages ? <div style={{ textAlign: "center", color: "#bbb", marginTop: "2rem" }}>Loading messages...</div> :
                  messages.length === 0 ? <div style={{ textAlign: "center", color: "#bbb", marginTop: "2rem" }}>No messages yet. Start the conversation!</div> :
                    messages.map(msg => msg?.id && (
                      <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender?.id === currentUserId ? "flex-end" : "flex-start", marginBottom: 16 }}>
                        <div style={{ maxWidth: "70%", padding: 12, borderRadius: 16, background: msg.sender?.id === currentUserId ? "#8A2BE2" : "#333", color: "#fff", wordWrap: "break-word" }}>
                          <div style={{ fontSize: 14, marginBottom: 4 }}>{msg.userId}{msg.message}</div>
                          <div style={{ fontSize: 12, color: "#bbb", textAlign: msg.sender?.id === currentUserId ? "right" : "left" }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                }
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: "1rem", borderTop: "1px solid #333", background: "#232323" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your query..."
                    style={{ flex: 1, background: "#333", border: "none", borderRadius: 20, padding: "0.75rem 1rem", color: "#fff", outline: "none" }}
                  />
                  <button onClick={sendMessage} style={manageBtnStyle} disabled={!inputMessage.trim()}>Send</button>
                </div>
              </div>
            </>
          ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>Select your support thread or start a new query with admin</div>}
        </section>
      </main>
    </div>
  );
}

const startSellingBtnStyle = { background: "#8A2BE2", color: "#fff", border: "none", fontSize: 18, fontWeight: 600, borderRadius: 8, padding: "0.7rem 2.2rem", cursor: "pointer", marginTop: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const manageBtnStyle = { background: "#8A2BE2", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, borderRadius: 6, padding: "0.4rem 1.2rem", cursor: "pointer" };

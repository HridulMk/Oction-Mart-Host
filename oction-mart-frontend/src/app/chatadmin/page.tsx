"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaPaperPlane, FaUser } from "react-icons/fa";

interface Conversation {
  id: number;
  name: string;
  type: "buyer" | "seller";
  avatar: string;
  last_message: string;
  last_time: string;
  unread?: number;
}

interface Message {
  id: number;
  sender?: {
    id: number;
    username: string;
    type?: "buyer" | "seller";
  };
  message: string;
  timestamp: string;
}

const AdminChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
const BASE_URL = "http://localhost:8000/api"; // Django API prefix
  // Load admin user & token
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      const user = JSON.parse(storedUser);
      setCurrentUserId(Number(user.id));
    } else {
      console.warn("No auth token or user found.");
    }
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token || !currentUserId) return;
    setLoadingConversations(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/admin/conversations/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
        setFilteredConversations(data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [token, currentUserId]);

  useEffect(() => {
    if (token && currentUserId) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [token, currentUserId, fetchConversations]);

  // Filter conversations based on search query
  useEffect(() => {
    setFilteredConversations(
      conversations.filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, conversations]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!selectedReceiver || !token) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/${selectedReceiver}/history/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedReceiver, token]);

  useEffect(() => {
    if (selectedReceiver) {
      fetchChatHistory();
    }
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [selectedReceiver, fetchChatHistory]);

  // SSE
  const startSSE = useCallback(() => {
    if (!selectedReceiver || !token) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const lastId = messages.length ? Math.max(...messages.map((m) => m.id || 0)) : 0;
    const sseUrl = `${BASE_URL}/chat/${selectedReceiver}/stream/?last_id=${lastId}`;

    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onopen = () => console.log("SSE connected");
    eventSourceRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setMessages((prev) => (prev.some((msg) => msg.id === data.id) ? prev : [...prev, data]));
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSourceRef.current.onerror = () => {
      console.warn("SSE connection error. Will retry in 3s");
      if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
        setTimeout(startSSE, 3000);
      }
    };
  }, [selectedReceiver, token, messages]);

  useEffect(() => {
    if (selectedReceiver) {
      const timer = setTimeout(startSSE, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedReceiver, startSSE]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedReceiver || !token) return;
    try {
      const res = await fetch(`${BASE_URL}/chat/send/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: selectedReceiver, message: inputMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data]);
        setInputMessage("");
        fetchConversations();
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isAdminMessage = (msg: Message) => {
    if (!currentUserId || !msg.sender) return false;
    return msg.sender.id === currentUserId;
  };

  const selectedUser = conversations.find((c) => c.id === selectedReceiver) || null;

  return (
    <div className="admin-chat-page">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{color:"GrayText"} }>Admin Support Dashboard</h1>
        </div>
        <p>Manage queries from buyers and sellers</p>
      </header>

      <main className="main-container">
        {/* Sidebar */}
        <section className="sidebar" role="region" aria-label="User Queries">
          <div className="sidebar-header">
            <h2 className="sidebar-title" style={{color:"ButtonShadow"}}>User Queries ({conversations.length})</h2>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="search-input"
                aria-label="Search conversations"
              />
            </div>
          </div>
          {loadingConversations ? (
            <div className="loading">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="no-conversations">No matching queries found.</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedReceiver === conv.id ? "selected" : ""}`}
                onClick={() => setSelectedReceiver(conv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedReceiver(conv.id)}
                aria-label={`Select conversation with ${conv.name}`}
              >
                <img src={conv.avatar} alt={`${conv.name}'s avatar`} className="user-avatar" />
                <div className="conv-info">
                  <div className="conv-name">{conv.name}</div>
                  <span className={`conv-type ${conv.type}`}>
                    {conv.type.toUpperCase()}
                    {conv.unread ? <span className="unread-count">{conv.unread}</span> : null}
                  </span>
                  <div className="conv-last-msg" title={conv.last_message}>
                    {conv.last_message.length > 50 ? `${conv.last_message.substring(0, 50)}...` : conv.last_message}
                  </div>
                </div>
                <div className="conv-time">{new Date(conv.last_time).toLocaleString()}</div>
              </div>
            ))
          )}
        </section>

        {/* Chat Area */}
        <section className="chat-section" role="region" aria-label="Chat Area">
          {selectedReceiver ? (
            <>
              <div className="chat-header">
                <h2>
                  <FaUser className="chat-header-icon" /> {selectedUser?.name} ({selectedUser?.type})
                </h2>
              </div>
              <div className="messages-container" role="log" aria-live="polite">
                {loadingMessages ? (
                  <div className="loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">No messages yet. Respond to start.</div>
                ) : (
                  messages.map(
                    (msg) =>
                      msg?.id && (
                        <div
                          key={msg.id}
                          className={`message-wrapper ${isAdminMessage(msg) ? "admin-msg" : "user-msg"}`}
                        >
                          <div
                            className={`message ${
                              isAdminMessage(msg) ? "admin-message" : `user-message ${msg.sender?.type || ""}`
                            }`}
                            role="article"
                            aria-label={`${isAdminMessage(msg) ? "Admin" : msg.sender?.name} message: ${msg.message}`}
                          >
                            <div className="message-text">
  <strong>{isAdminMessage(msg) ? "Admin" : msg.sender?.username}:</strong> {msg.message}
</div>

                            <div className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      )
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-section">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="message-input"
                    aria-label="Type your message"
                  />
                  <button
                    onClick={sendMessage}
                    className="send-btn"
                    disabled={!inputMessage.trim()}
                    aria-label="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">Select a user query to respond</div>
          )}
        </section>
      </main>

      <style jsx>{`
        .admin-chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(145deg, #1e1e2f 0%, #2a2a4a 100%);
          color: #e0e0e0;
        }

        .header {
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(12px);
          padding: 1.5rem;
          text-align: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .header h1 {
          margin: 0 0 8px 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .header p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .main-container {
          display: flex;
          flex: 1;
          overflow: hidden;
          background: #1a1a2e;
        }

        .sidebar {
          width: 320px;
          background: #22223b;
          padding: 1.5rem;
          overflow-y: auto;
          border-right: 1px solid #33334d;
        }

        .sidebar-header {
          margin-bottom: 1.5rem;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          background: #2c2c4e;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .search-icon {
          color: #888;
          margin: 0 0.5rem;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0e0;
          outline: none;
          font-size: 0.9rem;
        }

        .loading,
        .no-conversations {
          color: #888;
          text-align: center;
          padding: 1.5rem;
          font-style: italic;
          font-size: 0.9rem;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          background: transparent;
          border-radius: 10px;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .conversation-item:hover {
          background: #2c2c4e;
          transform: translateY(-2px);
        }

        .conversation-item.selected {
          background: #6c63ff;
          color: #fff;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-right: 0.75rem;
          object-fit: cover;
          background: #444;
        }

        .conv-info {
          flex: 1;
        }

        .conv-name {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .conv-type {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #fff;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .conv-type.buyer {
          background: #4c8bf5;
        }

        .conv-type.seller {
          background: #38c172;
        }

        .unread-count {
          background: #ff4d4f;
          color: #fff;
          font-size: 0.65rem;
          padding: 0.2rem 0.4rem;
          border-radius: 10px;
        }

        .conv-last-msg {
          color: #aaa;
          font-size: 0.85rem;
          margin-top: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .conv-time {
          color: #aaa;
          font-size: 0.75rem;
          text-align: right;
          min-width: 80px;
        }

        .chat-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 1rem;
          border-bottom: 1px solid #33334d;
          background: #22223b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-header-icon {
          color: #6c63ff;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-wrapper {
          display: flex;
          justify-content: flex-start;
          animation: fadeIn 0.3s ease;
        }

        .admin-msg {
          justify-content: flex-end;
        }

        .message {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          word-wrap: break-word;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .admin-message {
          background: #6c63ff;
          color: #fff;
        }

        .user-message {
          background: #2c2c4e;
          color: #e0e0e0;
          border-left: 4px solid #555;
        }

        .user-message.buyer {
          border-left-color: #4c8bf5;
        }

        .user-message.seller {
          border-left-color: #38c172;
        }

        .message-text {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: #aaa;
          text-align: right;
        }

        .no-messages,
        .no-selection,
        .loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          font-style: italic;
          font-size: 0.9rem;
        }

        .input-section {
          padding: 1rem;
          border-top: 1px solid #33334d;
          background: #22223b;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
          background: #2c2c4e;
          border-radius: 12px;
          padding: 0.5rem;
        }

        .message-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #e0e0e0;
          outline: none;
          font-size: 0.9rem;
          padding: 0.5rem;
        }

        .send-btn {
          background: #6c63ff;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:disabled {
          background: #555;
          cursor: not-allowed;
        }

        .send-btn:hover:not(:disabled) {
          background: #5a54d9;
        }

        /* Scrollbar */
        .messages-container::-webkit-scrollbar,
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track,
        .sidebar::-webkit-scrollbar-track {
          background: #22223b;
        }

        .messages-container::-webkit-scrollbar-thumb,
        .sidebar::-webkit-scrollbar-thumb {
          background: #6c63ff;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover,
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #5a54d9;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .main-container {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            max-height: 50vh;
            border-right: none;
            border-bottom: 1px solid #33334d;
          }
          .chat-section {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminChat;
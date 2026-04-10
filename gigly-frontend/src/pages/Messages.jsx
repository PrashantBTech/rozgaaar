import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { appsAPI } from "../services/api";
import api from "../services/api";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const { socket, joinChat } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showChat, setShowChat] = useState(false); // mobile: show chat panel
  // unreadMap: { [applicationId]: count } — increments on new msg, clears on open
  const [unreadMap, setUnreadMap] = useState({});

  const bottomRef = useRef();
  const typingTimer = useRef();
  const activeRef = useRef(active);

  // keep ref in sync with state
  useEffect(() => { activeRef.current = active; }, [active]);

  // ── 1. Load conversations + compute unread counts from DB ───────────────
  useEffect(() => {
    if (!user) return;
    appsAPI.getMine()
      .then(async r => {
        const apps = (r.data.data || []).filter(a =>
          ["accepted", "in_progress", "completed"].includes(a.status)
        );
        setConversations(apps);

        // For each conversation, fetch messages and count unread ones
        // (messages where sender is NOT me and isRead is false)
        const counts = {};
        await Promise.all(apps.map(async (app) => {
          try {
            const res = await api.get(`/messages/${app._id}`);
            const msgs = res.data.data || [];
            const unread = msgs.filter(m => {
              const senderId = m.sender?._id || m.sender;
              return senderId !== user._id && m.isRead === false;
            }).length;
            if (unread > 0) counts[app._id] = unread;
          } catch { }
        }));
        setUnreadMap(counts);
      })
      .catch(() => { })
      .finally(() => setLoadingConvos(false));
  }, [user]);

  // ── 2. On active change: join room + load history ─────────────────────────
  useEffect(() => {
    if (!active) return;
    joinChat(active._id);
    setLoadingMsgs(true);
    api.get(`/messages/${active._id}`)
      .then(r => setMessages(r.data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
    setTypingUser(null);
  }, [active?._id]);

  // ── 3. Socket listeners registered ONCE — use ref for active ─────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const msgAppId = msg.application?._id || msg.application;
      if (msgAppId === activeRef.current?._id) {
        // Chat is open — add to messages (dedupe)
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } else {
        // Chat NOT open — show unread dot on sidebar
        setUnreadMap(prev => ({
          ...prev,
          [msgAppId]: (prev[msgAppId] || 0) + 1,
        }));
      }
    };

    const handleTyping = ({ userId, name }) => {
      if (userId === user?._id) return;
      setTypingUser(name);
    };
    const handleStopTyping = () => setTypingUser(null);
    const handleReadAck = ({ applicationId }) => {
      if (applicationId !== activeRef.current?._id) return;
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    };

    // Fires when a message arrives in a chat you are NOT currently viewing
    const handleMsgNotification = ({ applicationId }) => {
      if (applicationId === activeRef.current?._id) return; // already open, handled above
      setUnreadMap(prev => ({
        ...prev,
        [applicationId]: (prev[applicationId] || 0) + 1,
      }));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("messages_read_ack", handleReadAck);
    socket.on("message_notification", handleMsgNotification);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("messages_read_ack", handleReadAck);
      socket.off("message_notification", handleMsgNotification);
    };
  }, [socket, user?._id]);

  // ── 4. Auto scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  // ── 5. Mark as read when opening chat + clear unread dot ────────────────
  useEffect(() => {
    if (!active || !socket) return;
    // Tell backend + other party that messages are read
    socket.emit("messages_read", { applicationId: active._id });
    // Clear local unread badge immediately
    setUnreadMap(prev => ({ ...prev, [active._id]: 0 }));
  }, [active?._id, socket]);

  // ── 6. Send — only via socket, NO manual local push ──────────────────────
  const handleSend = useCallback(() => {
    if (!input.trim() || !active || sending || !socket) return;

    const otherId = user._id === (active.worker?._id || active.worker)
      ? (active.business?._id || active.business)
      : (active.worker?._id || active.worker);

    socket.emit("send_message", {
      applicationId: active._id,
      receiverId: otherId,
      text: input.trim(),
    });

    setInput("");
    clearTimeout(typingTimer.current);
    socket.emit("stop_typing", { applicationId: active._id });
  }, [input, active, user, socket, sending]);

  // ── 7. Typing ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!active || !socket) return;
    socket.emit("typing", { applicationId: active._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { applicationId: active._id });
    }, 1500);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const otherParty = (conv) => {
    if (!conv || !user) return null;
    const workerId = conv.worker?._id || conv.worker;
    // Return business if user is worker, otherwise return worker
    return user._id === workerId ? conv.business : conv.worker;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div style={{ display: "flex", height: "calc(100vh - var(--header-h))", overflow: "hidden" }}>

        {/* ── Conversation list ── */}
        <div className="messages-list" style={{
          width: 300, flexShrink: 0,
          borderRight: "1px solid var(--border)",
          display: (active && window.innerWidth <= 768) ? "none" : "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
        }}>
          <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontFamily: "var(--font-display)" }}>Messages</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {conversations.length} active conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {loadingConvos ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div className="skeleton" style={{ height: 44, borderRadius: "var(--radius-md)" }} />
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No conversations yet</div>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  Once a business accepts your application, you can chat here.
                </div>
              </div>
            ) : conversations.map(conv => {
              const other = otherParty(conv);
              const isActive = active?._id === conv._id;
              const initials = other?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
              return (
                <div key={conv._id} onClick={() => { setActive(conv); setShowChat(true); }} style={{
                  padding: "12px 16px", borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: isActive ? "var(--accent-dim)" : (unreadMap[conv._id] || 0) > 0 ? "rgba(255,107,107,0.05)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--accent)" : (unreadMap[conv._id] || 0) > 0 ? "3px solid var(--urgent)" : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div className="avatar avatar-md avatar-placeholder" style={{ fontSize: 12 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: (unreadMap[conv._id] || 0) > 0 ? 800 : 600,
                        fontSize: 13,
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                        color: isActive ? "var(--accent)" : (unreadMap[conv._id] || 0) > 0 ? "var(--text-primary)" : "var(--text-primary)",
                      }}>
                        {other?.businessName || other?.name || "Unknown"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {conv.job?.title || "Gig"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span className={`badge ${conv.status === "accepted" ? "badge-success" : "badge-info"}`}
                        style={{ fontSize: 9, textTransform: "capitalize" }}>
                        {conv.status}
                      </span>
                      {/* Unread dot — only visible when there are unseen messages */}
                      {(unreadMap[conv._id] || 0) > 0 && (
                        <div style={{
                          minWidth: 18, height: 18, borderRadius: 9,
                          background: "var(--urgent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#fff",
                          padding: "0 5px",
                          boxShadow: "0 0 8px rgba(255,107,107,0.6)",
                          animation: "pulse 2s ease infinite",
                        }}>
                          {unreadMap[conv._id] > 9 ? "9+" : unreadMap[conv._id]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chat window ── */}
        {!active ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", color: "var(--text-muted)", background: "var(--bg-base)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
              Select a conversation
            </div>
            <div style={{ fontSize: 14 }}>Choose a gig chat from the left panel</div>
          </div>
        ) : (
          <div className={`messages-chat ${showChat ? "active" : ""}`} style={{
            flex: 1,
            display: (active && window.innerWidth <= 768 && !showChat) ? "none" : "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-base)"
          }}>

            {/* Header */}
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12,
              background: "var(--bg-surface)", flexShrink: 0,
            }}>
              {/* Mobile back button */}
              <button className="btn btn-ghost btn-sm messages-back-btn"
                style={{ padding: 6, display: "none" }}
                onClick={() => setShowChat(false)}>← Back</button>
              <div className="avatar avatar-md avatar-placeholder" style={{ fontSize: 12 }}>
                {otherParty(active)?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {otherParty(active)?.businessName || otherParty(active)?.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>📋 {active.job?.title}</div>
              </div>
              <span className={`badge ${active.status === "in_progress" ? "badge-info" : "badge-success"}`}
                style={{ textTransform: "capitalize" }}>
                {active.status}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingMsgs ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                    <div className="skeleton" style={{ width: `${40 + i * 8}%`, height: 44, borderRadius: 18 }} />
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>Start the conversation</div>
                  <div style={{ fontSize: 13 }}>Say hello to {otherParty(active)?.name?.split(" ")[0]}!</div>
                </div>
              ) : messages.map((msg, idx) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMe = senderId === user._id;
                const prevMsg = messages[idx - 1];
                const showTime = idx === 0 ||
                  (new Date(msg.createdAt) - new Date(prevMsg?.createdAt)) > 5 * 60 * 1000;

                return (
                  <React.Fragment key={msg._id || `msg-${idx}`}>
                    {showTime && (
                      <div style={{
                        textAlign: "center", fontSize: 11, color: "var(--text-muted)",
                        padding: "4px 12px", background: "var(--bg-elevated)",
                        borderRadius: 20, alignSelf: "center", margin: "4px 0",
                      }}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
                      {!isMe && (
                        <div className="avatar avatar-sm avatar-placeholder" style={{ fontSize: 9, flexShrink: 0 }}>
                          {msg.sender?.name?.[0] || "?"}
                        </div>
                      )}
                      <div style={{
                        maxWidth: "68%", padding: "10px 14px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMe ? "var(--accent)" : "var(--bg-elevated)",
                        color: isMe ? "#080d1a" : "var(--text-primary)",
                        fontSize: 14, lineHeight: 1.5,
                        boxShadow: isMe ? "0 2px 12px rgba(59,232,176,0.2)" : "none",
                      }}>
                        <div>{msg.text}</div>
                        <div style={{
                          fontSize: 10, marginTop: 4, opacity: 0.6,
                          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4
                        }}>
                          {formatTime(msg.createdAt)}
                          {isMe && <span title={msg.isRead ? "Read" : "Delivered"}>{msg.isRead ? "✓✓" : "✓"}</span>}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {typingUser && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    padding: "10px 14px", background: "var(--bg-elevated)",
                    borderRadius: "18px 18px 18px 4px", fontSize: 13, color: "var(--text-muted)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 11 }}>{typingUser} is typing</span>
                    <span style={{ display: "flex", gap: 3 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "var(--text-muted)", display: "inline-block",
                          animation: "pulse 1.2s ease infinite",
                          animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "12px 20px", borderTop: "1px solid var(--border)",
              display: "flex", gap: 10, background: "var(--bg-surface)", flexShrink: 0,
            }}>
              <input className="input"
                placeholder={`Message ${otherParty(active)?.name?.split(" ")[0] || "them"}…`}
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                style={{ flex: 1, background: "var(--bg-base)" }}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleSend}
                disabled={!input.trim() || sending}
                style={{ padding: "10px 20px" }}>
                Send →
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .messages-list {
            width: 100% !important;
            flex: 1 !important;
          }
          .messages-chat {
            position: fixed !important;
            inset: 0 !important;
            z-index: 500 !important;
            width: 100% !important;
            height: 100% !important;
            display: none !important;
          }
          .messages-chat.active {
            display: flex !important;
          }
          .messages-back-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
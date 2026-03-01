import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Chat from "./Chat/Chat";
import "./dashboard.css";
import socket from "../Client/socket";

const makeSession = () => ({
  id: Date.now(),
  title: "New Chat",
  pinned: false,
  messages: []
});

const starterSessions = [
  {
    id: 1,
    title: "New Chat",
    pinned: false,
    messages: [
      { id: 1, sessionId: 1, sender: "user", content: "Hello ai" },
      { id: 2, sessionId: 1, sender: "assistant", content: "hello ai." }
    ]
  }
];

export default function Dashboard() {
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_sessions")) || starterSessions;
    } catch {
      return starterSessions;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(
    () => Number(localStorage.getItem("current_session_id")) || starterSessions[0].id
  );

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem("chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("current_session_id", currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    const onReceive = (message) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === message.sessionId
            ? { ...session, messages: [...session.messages, message] }
            : session
        )
      );
    };

    socket.on("receive_message", onReceive);
    return () => socket.off("receive_message", onReceive);
  }, []);

  const orderedSessions = useMemo(
    () => [...sessions.filter((s) => s.pinned), ...sessions.filter((s) => !s.pinned)],
    [sessions]
  );

  const currentSession =
    sessions.find((session) => session.id === currentSessionId) || sessions[0];

  const updateSession = (id, updater) =>
    setSessions((prev) =>
      prev.map((session) => (session.id === id ? updater(session) : session))
    );

  const handleNewChat = () => {
    const session = makeSession();
    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.id);
    setInput("");
  };

  const handleDeleteSession = (id) => {
    const next = sessions.filter((session) => session.id !== id);

    if (!next.length) {
      const fresh = makeSession();
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
      return;
    }

    setSessions(next);
    if (currentSessionId === id) setCurrentSessionId(next[0].id);
  };

  const handleRenameSession = (id, title) => {
    updateSession(id, (session) => ({
      ...session,
      title: title.trim() || "New Chat"
    }));
  };

  const handleTogglePin = (id) => {
    updateSession(id, (session) => ({
      ...session,
      pinned: !session.pinned
    }));
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !currentSession) return;

    const message = {
      id: Date.now(),
      sessionId: currentSession.id,
      sender: "user",
      content: text
    };

    updateSession(currentSession.id, (session) => ({
      ...session,
      title:
        session.title === "New Chat" && !session.messages.length
          ? text.slice(0, 30)
          : session.title,
      messages: [...session.messages, message]
    }));

    socket.emit("send_message", message);
    setInput("");
  };

  return (
    <div className="dashboard_container">
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sessions={orderedSessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePin}
      />

      <Chat
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        messages={currentSession?.messages || []}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Chat from "./Chat/Chat";
import "./dashboard.css";
import socket from "../Client/socket";

export default function Dashboard({ username, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("newest");

  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(false);

  useEffect(() => {
    const onSessionsData = (data) => {
      setSessions(data);

      setCurrentSessionId((prev) => {
        if (!data.length) return null;
        const stillExists = data.some((session) => session._id === prev);
        return stillExists ? prev : data[0]._id;
      });
    };

    const onNewSessionCreated = (id) => {
      setCurrentSessionId(id);
      setInput("");
      setIsThinking(false);
    };

    const onMessageReceived = () => {
      setIsThinking(false);
    };

    socket.on("sessions_data", onSessionsData);
    socket.on("new_session_created", onNewSessionCreated);
    socket.on("message_received", onMessageReceived);

  if (socket.connected) {
  socket.emit("get_sessions");
} else {
  socket.once("connect", () => {
    socket.emit("get_sessions");
  });
}

    return () => {
      socket.off("sessions_data", onSessionsData);
      socket.off("new_session_created", onNewSessionCreated);
      socket.off("message_received", onMessageReceived);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current || !sidebarOpen) return;

      const minWidth = 240;
      const maxWidth = 520;
      const nextWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);

      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      resizeRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sidebarOpen]);

  const visibleSessions = useMemo(() => {
    let next = [...sessions];

    next = next.filter((session) => {
      const title = (session.title || "New Chat").toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "pinned" && session.pinned) ||
        (filterType === "unpinned" && !session.pinned);

      return matchesSearch && matchesFilter;
    });

    if (sortType === "az") {
      next.sort((a, b) =>
        (a.title || "New Chat").localeCompare(b.title || "New Chat")
      );
    } else if (sortType === "oldest") {
      next.sort((a, b) => new Date(b._id) - new Date(a._id));
    } else {
     next.sort((a, b) => new Date(b._id) - new Date(a._id));
    }

    next.sort((a, b) => Number(b.pinned) - Number(a.pinned));

    return next;
  }, [sessions, searchTerm, filterType, sortType]);

  const currentSession =
    sessions.find((session) => session._id === currentSessionId) || null;


  const handleNewChat = () => {
  if (!socket.connected) {
    console.log("Socket is not connected");
    return;
  }

  socket.emit("new_session");
};

const handleDeleteSession = (id) => {
  setSessions((prev) => prev.filter((s) => s._id !== id)); 
  socket.emit("delete_session", id);
};

 const handleRenameSession = (id, title) => {
  setSessions((prev) =>
    prev.map((s) =>
      s._id === id ? { ...s, title: title.trim() || "New Chat" } : s
    )
  );

  socket.emit("rename_session", {
    id,
    title: title.trim() || "New Chat"
  });
};

  const handleTogglePin = (id) => {
  setSessions((prev) =>
    prev.map((s) =>
      s._id === id ? { ...s, pinned: !s.pinned } : s
    )
  );

  socket.emit("toggle_pin", id);
};

  const handleSend = () => {
    const text = input.trim();
    if (!text || !currentSession) return;

    const message = {
      id: Date.now(),
      sessionId: currentSession._id,
      sender: "user",
      content: text
    };

    socket.emit("send_message", message);
    setInput("");
    setIsThinking(true);
  };

  // ✅ FILE UPLOAD HANDLER (NEW)
  const handleFileUpload = async (file) => {
    if (!file || !currentSession) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      const message = {
        id: Date.now(),
        sessionId: currentSession._id,
        sender: "user",
        content: data.content
      };

      socket.emit("send_message", message);
      setIsThinking(true);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const startResize = () => {
    resizeRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className={`dashboard_container ${isResizing ? "resizing" : ""}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sessions={visibleSessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePin={handleTogglePin}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        sortType={sortType}
        onSortChange={setSortType}
        sidebarWidth={sidebarWidth}
        onStartResize={startResize}
      />

      <Chat
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        messages={currentSession?.messages || []}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        isThinking={isThinking}
        username={username}
        onLogout={onLogout}
        onFileUpload={handleFileUpload}   
      />
    </div>
  );
}
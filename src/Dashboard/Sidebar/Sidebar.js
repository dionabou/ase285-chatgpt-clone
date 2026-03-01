import React from "react";
import NewChatButton from "./NewChatButton";
import ListItem from "./ListItem";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

const Sidebar = ({sidebarOpen, toggleSidebar, sessions, currentSessionId, onNewChat, onSelectSession, onDeleteSession, onRenameSession, onTogglePin
}) => {
  return (
    <div className={`sidebar_container ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar_top">
        <button className="sidebar_toggle" onClick={toggleSidebar}>
          <HiOutlineMenuAlt2 size={20} color="white" />
        </button>

        {sidebarOpen && <NewChatButton onClick={onNewChat} />}
      </div>

      <div className="sidebar_list">
        {sessions.map((session) => (
          <ListItem
            key={session.id}
            session={session}
            active={session.id === currentSessionId}
            sidebarOpen={sidebarOpen}
            onClick={() => onSelectSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
            onRename={(newTitle) => onRenameSession(session.id, newTitle)}
            onTogglePin={() => onTogglePin(session.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
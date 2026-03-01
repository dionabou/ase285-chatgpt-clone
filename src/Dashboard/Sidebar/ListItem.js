import React, { useEffect, useRef, useState } from "react";
import { BsChatLeft, BsThreeDots } from "react-icons/bs";
import { PiPushPinSimpleFill } from "react-icons/pi";

export default function ListItem({session, onClick, active, sidebarOpen, onDelete, onRename, onTogglePin}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title || "New Chat");
  const inputRef = useRef(null);

  useEffect(() => {
    setTitle(session.title || "New Chat");
  }, [session.title]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const saveRename = () => {
    const nextTitle = title.trim() || "New Chat";
    onRename(nextTitle);
    setTitle(nextTitle);
    setEditing(false);
  };

  const cancelRename = () => {
    setTitle(session.title || "New Chat");
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      onDelete();
    }
    setMenuOpen(false);
  };

  return (
    <div
      className={`list_item ${active ? "active_list_item" : ""}`}
      onClick={editing ? undefined : onClick}
    >
      <div className="list_item_left">
        <div className="list_item_icon">
          <BsChatLeft color="white" />
        </div>

        {sidebarOpen && (
          <div className="list_item_title_wrap">
            {editing ? (
              <input
                ref={inputRef}
                className="rename_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveRename}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") cancelRename();
                }}
              />
            ) : (
              <>
                <p className="list_item_text">{session.title || "New Chat"}</p>
                {session.pinned && (
                  <PiPushPinSimpleFill className="pin_icon" color="white" />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {sidebarOpen && !editing && (
        <div
          className="list_item_menu_wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="menu_button"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <BsThreeDots color="white" />
          </button>

          {menuOpen && (
            <div className="chat_menu">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                Rename
              </button>
              <button
                onClick={() => {
                  onTogglePin();
                  setMenuOpen(false);
                }}
              >
                {session.pinned ? "Unpin" : "Pin"}
              </button>
              <button className="danger_button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
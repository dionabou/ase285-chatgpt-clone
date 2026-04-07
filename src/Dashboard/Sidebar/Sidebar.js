import React, { useEffect, useRef, useState } from "react";
import NewChatButton from "./NewChatButton";
import ListItem from "./ListItem";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { FiFilter, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

const Sidebar = ({
  sidebarOpen,
  toggleSidebar,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onTogglePin,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  sidebarWidth,
  onStartResize
}) => {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
      }

      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterLabel =
    filterType === "all"
      ? "All conversations"
      : filterType === "pinned"
      ? "Pinned only"
      : "Unpinned only";

  const sortLabel =
    sortType === "newest"
      ? "Newest first"
      : sortType === "oldest"
      ? "Oldest first"
      : "A to Z";

  return (
    <div
      className={`sidebar_container ${sidebarOpen ? "open" : "closed"}`}
      style={sidebarOpen ? { width: `${sidebarWidth}px` } : {}}
    >
      <div className="sidebar_top">
        <button className="sidebar_toggle" onClick={toggleSidebar}>
          <HiOutlineMenuAlt2 size={20} color="white" />
        </button>

        {sidebarOpen && <NewChatButton onClick={onNewChat} />}
      </div>

      {sidebarOpen && (
        <div className="sidebar_search_row">
          <div className="sidebar_search_wrap">
            <FiSearch className="sidebar_search_icon" />

            <input
              type="text"
              className="sidebar_search_input"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            <div className="sidebar_menu_anchor" ref={filterMenuRef}>
              <button
                type="button"
                className={`sidebar_icon_button ${filterType !== "all" ? "active" : ""}`}
                onClick={() => {
                  setFilterMenuOpen((prev) => !prev);
                  setSortMenuOpen(false);
                }}
                title={filterLabel}
                aria-label={filterLabel}
              >
                <FiFilter size={16} />
              </button>

              {filterMenuOpen && (
                <div className="sidebar_popup_menu">
                  <button
                    className={filterType === "all" ? "selected" : ""}
                    onClick={() => {
                      onFilterChange("all");
                      setFilterMenuOpen(false);
                    }}
                  >
                    All
                  </button>
                  <button
                    className={filterType === "pinned" ? "selected" : ""}
                    onClick={() => {
                      onFilterChange("pinned");
                      setFilterMenuOpen(false);
                    }}
                  >
                    Pinned
                  </button>
                  <button
                    className={filterType === "unpinned" ? "selected" : ""}
                    onClick={() => {
                      onFilterChange("unpinned");
                      setFilterMenuOpen(false);
                    }}
                  >
                    Unpinned
                  </button>
                </div>
              )}
            </div>

            <div className="sidebar_menu_anchor" ref={sortMenuRef}>
              <button
                type="button"
                className={`sidebar_icon_button ${sortType !== "newest" ? "active" : ""}`}
                onClick={() => {
                  setSortMenuOpen((prev) => !prev);
                  setFilterMenuOpen(false);
                }}
                title={sortLabel}
                aria-label={sortLabel}
              >
                {sortType === "az" ? (
                  <FiArrowUp size={16} />
                ) : (
                  <FiArrowDown size={16} />
                )}
              </button>

              {sortMenuOpen && (
                <div className="sidebar_popup_menu">
                  <button
                    className={sortType === "newest" ? "selected" : ""}
                    onClick={() => {
                      onSortChange("newest");
                      setSortMenuOpen(false);
                    }}
                  >
                    Newest
                  </button>
                  <button
                    className={sortType === "oldest" ? "selected" : ""}
                    onClick={() => {
                      onSortChange("oldest");
                      setSortMenuOpen(false);
                    }}
                  >
                    Oldest
                  </button>
                  <button
                    className={sortType === "az" ? "selected" : ""}
                    onClick={() => {
                      onSortChange("az");
                      setSortMenuOpen(false);
                    }}
                  >
                    A to Z
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="sidebar_list">
        {sessions.length === 0 && sidebarOpen ? (
          <p className="no_sessions_text">No conversations found.</p>
        ) : (
          sessions.map((session) => (
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
          ))
        )}
      </div>

      {sidebarOpen && (
        <div
          className="sidebar_resize_handle"
          onMouseDown={onStartResize}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Sidebar;
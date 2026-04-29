import React, { useState } from "react";
import Messages from "./Messages";
import NewMessageInput from "./NewMessageInput";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { FaRegUserCircle } from "react-icons/fa";

const Chat = ({
  sidebarOpen,
  toggleSidebar,
  messages,
  input,
  onInputChange,
  onSend,
  onKeyDown,
  isThinking,
  username,
  onLogout,
  onFileUpload
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="chat_container">
      <div className="chat_header">
        <button className="chat_toggle_button" onClick={toggleSidebar}>
          <HiOutlineMenuAlt2 size={20} />
        </button>

        <div className="profile_wrapper">
          <button
            className="profile_icon_container"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <FaRegUserCircle size={24} />
          </button>

          {showProfileMenu && (
            <div className="profile_menu">
              <p className="profile_username">{username}</p>
              <button className="logout_button" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chat_selected_container">
        <Messages messages={messages} isThinking={isThinking} />

        <NewMessageInput
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          onKeyDown={onKeyDown}
          onFileUpload={onFileUpload}
        />
      </div>
    </div>
  );
};

export default Chat;
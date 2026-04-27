import React from "react";
import Messages from "./Messages";
import NewMessageInput from "./NewMessageInput";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

const Chat = ({
  sidebarOpen,
  toggleSidebar,
  messages,
  input,
  onInputChange,
  onSend,
  onKeyDown,
  isThinking
}) => {
  return (
    <div className="chat_container">
      <div className="chat_header">
        <button className="chat_toggle_button" onClick={toggleSidebar}>
          <HiOutlineMenuAlt2 size={20} />
        </button>
      </div>

      <div className="chat_selected_container">
        <Messages messages={messages} isThinking={isThinking} />

        <NewMessageInput
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
};

export default Chat;
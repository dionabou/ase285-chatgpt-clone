import React from "react";
import { BsSend } from "react-icons/bs";

const NewMessageInput = ({ value, onChange, onSend, onKeyDown }) => {
  return (
    <div className="new_message_input_container">
      <input
        className="new_message_input"
        placeholder="Send a message ..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div
        className="new_message_icon_container"
        onClick={onSend}
        style={{ cursor: "pointer" }}
      >
        <BsSend color="grey" />
      </div>
    </div>
  );
};

export default NewMessageInput;
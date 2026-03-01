import React from "react";
import { GrUser } from "react-icons/gr";
import { FcMindMap } from "react-icons/fc";

const Message = ({ content, aiMessage }) => {
  return (
    <div
      className="message_container"
      style={{ background: aiMessage ? "rgb(247, 247, 248)" : "white" }}
    >
      <div className="message_avatar_container">
        {aiMessage ? <FcMindMap /> : <GrUser />}
      </div>
      <p className="message_text">{content}</p>
    </div>
  );
};

export default Message;
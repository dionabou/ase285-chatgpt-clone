import React from "react";
import { GrUser } from "react-icons/gr";
import { FcMindMap } from "react-icons/fc";
import { FiPaperclip } from "react-icons/fi";

const Message = ({ content, aiMessage, isThinking, attachmentName }) => {
  const isImage =
    typeof content === "string" && content.startsWith("data:image");

  return (
    <div
      className="message_container"
      style={{ background: aiMessage ? "rgb(247, 247, 248)" : "white" }}
    >
      <div className="message_avatar_container">
        {aiMessage ? <FcMindMap /> : <GrUser />}
      </div>

      {isThinking ? (
        <div className="thinking_indicator">
          <span className="thinking_spinner"></span>
          <span className="thinking_dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
      ) : attachmentName ? (
        <div className="file_attachment_preview">
          <FiPaperclip size={18} />
          <span>{attachmentName}</span>
        </div>
      ) : isImage ? (
        <img src={content} alt="uploaded" className="message_image" />
      ) : (
        <p className="message_text">{content}</p>
      )}
    </div>
  );
};

export default Message;
import React from "react";
import Message from "./Message";

const Messages = ({ messages }) => {
  return (
    <div className="chat_messages_container">
      {messages.length === 0 ? (
        <Message content="Start a new conversation." aiMessage={true} />
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            aiMessage={message.sender === "assistant"}
          />
        ))
      )}
    </div>
  );
};

export default Messages;
import React from "react";
import Message from "./Message";

const Messages = ({ messages, isThinking }) => {
  return (
    <div className="messages_container">
      {messages.map((message) => (
        <Message
          key={message.id}
          content={message.content}
          aiMessage={message.sender !== "user"}
        />
      ))}

      {isThinking && (
        <Message
          content=""
          aiMessage={true}
          isThinking={true}
        />
      )}
    </div>
  );
};

export default Messages;
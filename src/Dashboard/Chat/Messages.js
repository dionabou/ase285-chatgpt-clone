import React, { useEffect, useRef } from "react";
import Message from "./Message";

const Messages = ({ messages, isThinking }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isThinking]);

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

      <div ref={bottomRef}></div>
    </div>
  );
};

export default Messages;
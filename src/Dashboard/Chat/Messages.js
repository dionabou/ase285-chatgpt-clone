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
      {messages.length === 0 && !isThinking ? (
        <div className="empty_chat_container">
          <h1>How can I help you today?</h1>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <Message
              key={message.id || message._id}   // ✅ FIXED
              content={message.content}
              aiMessage={message.sender !== "user"}
            />
          ))}

          {isThinking && (
            <Message content="" aiMessage={true} isThinking={true} />
          )}

          <div ref={bottomRef}></div>
        </>
      )}
    </div>
  );
};

export default Messages;
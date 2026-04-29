import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import Message from "../../Dashboard/Chat/Message";
import NewMessageInput from "../../Dashboard/Chat/NewMessageInput";
import Dashboard from "../../Dashboard/Dashboard";
import socket from "../../Client/socket";

jest.mock("../../Client/socket", () => ({
  connected: true,
  on: jest.fn(),
  off: jest.fn(),
  once: jest.fn(),
  emit: jest.fn()
}));

jest.mock("../../Dashboard/Sidebar/Sidebar", () => {
  return function MockSidebar({ sessions, onNewChat, onSelectSession }) {
    return (
      <div>
        <button onClick={onNewChat}>New chat</button>
        {sessions.map((session) => (
          <button key={session._id} onClick={() => onSelectSession(session._id)}>
            {session.title}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock("../../Dashboard/Chat/Chat", () => {
  return function MockChat({ messages, input, onInputChange, onSend, onFileUpload }) {
    return (
      <div>
        <input
          placeholder="Send a message..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <button onClick={onSend}>Send</button>
        <button
          onClick={() =>
            onFileUpload(
              new File(["secret file text"], "private.pdf", {
                type: "application/pdf"
              })
            )
          }
        >
          Upload file
        </button>

        {messages.map((message) => (
          <p key={message.id || message._id}>
            {message.attachmentName || message.content}
          </p>
        ))}
      </div>
    );
  };
});

const triggerSocketEvent = (eventName, payload) => {
  const handler = socket.on.mock.calls.find(([event]) => event === eventName)?.[1];

  if (handler) {
    act(() => {
      handler(payload);
    });
  }
};

describe("Regression Tests - Previously Fixed Bugs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("Regression: file attachment does not display extracted file content", () => {
    render(
      <Message
        content="This content should not show in the chat UI"
        attachmentName="private.pdf"
        aiMessage={false}
      />
    );

    expect(screen.getByText("private.pdf")).toBeInTheDocument();
    expect(
      screen.queryByText("This content should not show in the chat UI")
    ).not.toBeInTheDocument();
  });

  test("Regression: normal text messages still display after file preview change", () => {
    render(<Message content="Normal message" aiMessage={false} />);

    expect(screen.getByText("Normal message")).toBeInTheDocument();
  });

  test("Regression: send icon still calls onSend after attach icon changes", () => {
    const onSend = jest.fn();

    const { container } = render(
      <NewMessageInput
        value="Hello"
        onChange={jest.fn()}
        onSend={onSend}
        onKeyDown={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".new_message_icon_container"));

    expect(onSend).toHaveBeenCalled();
  });

  test("Regression: attach icon still triggers file upload after input layout changes", () => {
    const onFileUpload = jest.fn();
    const file = new File(["hello"], "test.txt", { type: "text/plain" });

    const { container } = render(
      <NewMessageInput
        value=""
        onChange={jest.fn()}
        onSend={jest.fn()}
        onKeyDown={jest.fn()}
        onFileUpload={onFileUpload}
      />
    );

    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    expect(onFileUpload).toHaveBeenCalledWith(file);
  });

  test("Regression: New Chat still emits socket event after styling changes", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    fireEvent.click(screen.getByText("New chat"));

    expect(socket.emit).toHaveBeenCalledWith("new_session");
  });

  test("Regression: uploaded file sends fileContent to AI but not to visible content", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: "AI should receive this extracted file content",
        filename: "notes.pdf",
        mimetype: "application/pdf"
      })
    });

    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "File Chat",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("Upload file"));

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith(
        "send_message",
        expect.objectContaining({
          content: "",
          attachmentName: "notes.pdf",
          fileContent: "AI should receive this extracted file content"
        })
      );
    });
  });

  test("Regression: user-specific session selection uses _id, not id", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "abc123",
        title: "Mongo Session",
        pinned: false,
        messages: [{ id: 1, sender: "user", content: "Mongo message" }],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("Mongo Session"));

    expect(screen.getByText("Mongo message")).toBeInTheDocument();
  });
});
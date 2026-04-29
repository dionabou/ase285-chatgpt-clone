import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

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
  return function MockSidebar({
    sessions,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onRenameSession,
    onTogglePin,
    searchTerm,
    onSearchChange
  }) {
    return (
      <div>
        <button onClick={onNewChat}>New chat</button>
        <input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {sessions.map((session) => (
          <div key={session._id}>
            <button onClick={() => onSelectSession(session._id)}>
              {session.title}
            </button>
            <button onClick={() => onDeleteSession(session._id)}>Delete</button>
            <button onClick={() => onRenameSession(session._id, "Renamed Chat")}>
              Rename
            </button>
            <button onClick={() => onTogglePin(session._id)}>Pin</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock("../../Dashboard/Chat/Chat", () => {
  return function MockChat({
    messages,
    input,
    onInputChange,
    onSend,
    onKeyDown,
    onFileUpload,
    onLogout
  }) {
    return (
      <div>
        <input
          placeholder="Send a message..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={onSend}>Send</button>
        <button
          onClick={() =>
            onFileUpload(
              new File(["file content"], "assignment.pdf", {
                type: "application/pdf"
              })
            )
          }
        >
          Upload file
        </button>
        <button onClick={onLogout}>Logout</button>

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

describe("Integration Tests - Dashboard and Socket Events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("Dashboard requests sessions when socket is connected", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    expect(socket.emit).toHaveBeenCalledWith("get_sessions");
  });

  test("New chat button emits new_session", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    fireEvent.click(screen.getByText("New chat"));

    expect(socket.emit).toHaveBeenCalledWith("new_session");
  });

  test("Dashboard loads sessions from socket data", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "First Chat",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    expect(screen.getByText("First Chat")).toBeInTheDocument();
  });

  test("Selecting a session shows its messages", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "First Chat",
        pinned: false,
        messages: [{ id: 1, sender: "user", content: "Hello from chat" }],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("First Chat"));

    expect(screen.getByText("Hello from chat")).toBeInTheDocument();
  });

  test("Sending a message emits send_message", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "First Chat",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.change(screen.getByPlaceholderText("Send a message..."), {
      target: { value: "Hello AI" }
    });

    fireEvent.click(screen.getByText("Send"));

    expect(socket.emit).toHaveBeenCalledWith(
      "send_message",
      expect.objectContaining({
        sessionId: "1",
        sender: "user",
        content: "Hello AI"
      })
    );
  });

  test("File upload emits send_message with attachment metadata and fileContent", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: "Extracted content for AI",
        filename: "assignment.pdf",
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
          sessionId: "1",
          sender: "user",
          content: "",
          attachmentName: "assignment.pdf",
          attachmentType: "application/pdf",
          fileContent: "Extracted content for AI"
        })
      );
    });
  });

  test("Delete emits delete_session", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "Delete Me",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("Delete"));

    expect(socket.emit).toHaveBeenCalledWith("delete_session", "1");
  });

  test("Rename emits rename_session", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "Old Name",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("Rename"));

    expect(socket.emit).toHaveBeenCalledWith("rename_session", {
      id: "1",
      title: "Renamed Chat"
    });
  });

  test("Pin emits toggle_pin", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "Pin Me",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.click(screen.getByText("Pin"));

    expect(socket.emit).toHaveBeenCalledWith("toggle_pin", "1");
  });

  test("Search filters conversations", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "School Project",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      },
      {
        _id: "2",
        title: "Work Notes",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.change(screen.getByPlaceholderText("Search conversations..."), {
      target: { value: "School" }
    });

    expect(screen.getByText("School Project")).toBeInTheDocument();
    expect(screen.queryByText("Work Notes")).not.toBeInTheDocument();
  });
});


test("Integration: filter shows pinned conversations only", () => {
  render(<Dashboard username="nana" onLogout={jest.fn()} />);

  triggerSocketEvent("sessions_data", [
    {
      _id: "1",
      title: "Pinned Chat",
      pinned: true,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    },
    {
      _id: "2",
      title: "Normal Chat",
      pinned: false,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    }
  ]);

  fireEvent.click(screen.getByLabelText("All conversations"));
  fireEvent.click(screen.getByText("Pinned"));

  expect(screen.getByText("Pinned Chat")).toBeInTheDocument();
  expect(screen.queryByText("Normal Chat")).not.toBeInTheDocument();
});

test("Integration: filter shows unpinned conversations only", () => {
  render(<Dashboard username="nana" onLogout={jest.fn()} />);

  triggerSocketEvent("sessions_data", [
    {
      _id: "1",
      title: "Pinned Chat",
      pinned: true,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    },
    {
      _id: "2",
      title: "Normal Chat",
      pinned: false,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    }
  ]);

  fireEvent.click(screen.getByLabelText("All conversations"));
  fireEvent.click(screen.getByText("Unpinned"));

  expect(screen.queryByText("Pinned Chat")).not.toBeInTheDocument();
  expect(screen.getByText("Normal Chat")).toBeInTheDocument();
});

test("Integration: sort A to Z orders chats alphabetically", () => {
  render(<Dashboard username="nana" onLogout={jest.fn()} />);

  triggerSocketEvent("sessions_data", [
    {
      _id: "1",
      title: "Zebra Chat",
      pinned: false,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    },
    {
      _id: "2",
      title: "Apple Chat",
      pinned: false,
      messages: [],
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    }
  ]);

  fireEvent.click(screen.getByLabelText("Newest first"));
  fireEvent.click(screen.getByText("A to Z"));

  const buttons = screen.getAllByRole("button").map((button) => button.textContent);

  expect(buttons.indexOf("Apple Chat")).toBeLessThan(buttons.indexOf("Zebra Chat"));
});

test("Integration: sidebar collapse hides search input", () => {
  const { container } = render(<Dashboard username="nana" onLogout={jest.fn()} />);

  expect(screen.getByPlaceholderText("Search conversations...")).toBeInTheDocument();

  fireEvent.click(container.querySelector(".sidebar_toggle"));

  expect(screen.queryByPlaceholderText("Search conversations...")).not.toBeInTheDocument();
});
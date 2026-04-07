import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../src/Dashboard/Dashboard";
import socket from "../src/Client/socket";

/* Mock the socket client */
jest.mock("../src/Client/socket", () => ({
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: true
}));

describe("Dashboard features", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  /* -----------------------------
     Basic render / initial UI
  ----------------------------- */
  test("renders the default chat and input", () => {
    render(<Dashboard />);

    expect(screen.getByText("History 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/send a message/i)).toBeInTheDocument();
  });

  /* -----------------------------
     New chat feature
  ----------------------------- */
  test("creates a new chat when New Chat is clicked", () => {
    render(<Dashboard />);

    fireEvent.click(screen.getByText(/new chat/i));

    expect(screen.getByText(/start a new conversation/i)).toBeInTheDocument();
  });

  /* -----------------------------
     Send message feature
  ----------------------------- */
  test("sends a user message and emits a socket event", () => {
    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/send a message/i);

    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Hello AI")).toBeInTheDocument();
    expect(socket.emit).toHaveBeenCalledWith(
      "send_message",
      expect.objectContaining({
        sender: "user",
        content: "Hello AI"
      })
    );
  });

  /* -----------------------------
     Receive AI response feature
  ----------------------------- */
  test("adds the AI response when socket callback runs", async () => {
    render(<Dashboard />);

    const receiveCall = socket.on.mock.calls.find(
      (call) => call[0] === "receive_message"
    );

    const receiveHandler = receiveCall[1];

    receiveHandler({
      id: 99,
      sessionId: 1,
      sender: "assistant",
      content: "Hello from AI"
    });

    await waitFor(() => {
      expect(screen.getByText("Hello from AI")).toBeInTheDocument();
    });
  });

  /* -----------------------------
     Sidebar open / close feature
  ----------------------------- */
  test("toggles the sidebar open and closed", () => {
    const { container } = render(<Dashboard />);

    const toggleButton = container.querySelector(".chat_toggle_button");
    const sidebar = container.querySelector(".sidebar_container");

    expect(sidebar).toHaveClass("open");

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass("closed");

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass("open");
  });

  /* -----------------------------
     Rename conversation feature
  ----------------------------- */
  test("renames a conversation inline from the sidebar", () => {
    const { container } = render(<Dashboard />);

    const menuButton = container.querySelector(".menu_button");
    fireEvent.click(menuButton);

    fireEvent.click(screen.getByText("Rename"));

    const renameInput = container.querySelector(".rename_input");
    fireEvent.change(renameInput, { target: { value: "My Renamed Chat" } });
    fireEvent.blur(renameInput);

    expect(screen.getByText("My Renamed Chat")).toBeInTheDocument();
  });

  /* -----------------------------
     Pin conversation feature
  ----------------------------- */
  test("pins a conversation from the sidebar menu", () => {
    const { container } = render(<Dashboard />);

    const menuButton = container.querySelector(".menu_button");
    fireEvent.click(menuButton);

    fireEvent.click(screen.getByText("Pin"));

    fireEvent.click(container.querySelector(".menu_button"));
    expect(screen.getByText("Unpin")).toBeInTheDocument();
  });

  /* -----------------------------
     Delete conversation feature
  ----------------------------- */
  test("asks for confirmation before deleting a conversation", () => {
    window.confirm = jest.fn(() => true);

    const { container } = render(<Dashboard />);

    fireEvent.click(screen.getByText(/new chat/i));

    const historyChat = screen.getByText("History 1");
    fireEvent.click(historyChat);

    const menuButtons = container.querySelectorAll(".menu_button");
    fireEvent.click(menuButtons[0]);

    fireEvent.click(screen.getByText("Delete"));

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this conversation?"
    );
  });
});
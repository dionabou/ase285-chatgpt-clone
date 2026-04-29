import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import App from "../../App";
import Dashboard from "../../Dashboard/Dashboard";
import socket, { connectSocket, disconnectSocket } from "../../Client/socket";

jest.mock("../../Client/socket", () => ({
  __esModule: true,
  default: {
    connected: true,
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    auth: {}
  },
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn()
}));

const triggerSocketEvent = (eventName, payload) => {
  const handler = socket.on.mock.calls.find(([event]) => event === eventName)?.[1];

  if (handler) {
    act(() => {
      handler(payload);
    });
  }
};

describe("Acceptance Tests - User Workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    global.fetch = jest.fn();
  });

  test("Acceptance: user can sign up successfully", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Account created"
      })
    });

    render(<App />);

    fireEvent.click(screen.getByText("Sign up"));

    fireEvent.change(screen.getByPlaceholderText("Create username"), {
      target: { value: "nana" }
    });

    fireEvent.change(screen.getByPlaceholderText("Create password"), {
      target: { value: "password123" }
    });

    fireEvent.click(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(screen.getByText("Account created. You can now log in.")).toBeInTheDocument();
    });
  });

  test("Acceptance: user can log in and socket connects with token", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        username: "nana",
        token: "fake-jwt-token"
      })
    });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "nana" }
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(connectSocket).toHaveBeenCalledWith("fake-jwt-token");
    });

    expect(sessionStorage.getItem("username")).toBe("nana");
    expect(sessionStorage.getItem("token")).toBe("fake-jwt-token");
  });

  test("Acceptance: login failure shows error message", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: "Invalid credentials"
      })
    });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "wrong" }
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrong" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("Acceptance: user can create a new chat", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    fireEvent.click(screen.getByText("New chat"));

    expect(socket.emit).toHaveBeenCalledWith("new_session");
  });

  test("Acceptance: user can send a message in a selected chat", () => {
    render(<Dashboard username="nana" onLogout={jest.fn()} />);

    triggerSocketEvent("sessions_data", [
      {
        _id: "1",
        title: "Test Chat",
        pinned: false,
        messages: [],
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ]);

    fireEvent.change(screen.getByPlaceholderText("Send a message..."), {
      target: { value: "Can you help me?" }
    });

    fireEvent.keyDown(screen.getByPlaceholderText("Send a message..."), {
      key: "Enter"
    });

    expect(socket.emit).toHaveBeenCalledWith(
      "send_message",
      expect.objectContaining({
        content: "Can you help me?",
        sessionId: "1"
      })
    );
  });

  test("Acceptance: user can upload a file and see file attachment preview", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: "Extracted file content for AI",
        filename: "project.pdf",
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

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["hello"], "project.pdf", {
      type: "application/pdf"
    });

    fireEvent.change(fileInput, {
      target: { files: [file] }
    });

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith(
        "send_message",
        expect.objectContaining({
          content: "",
          attachmentName: "project.pdf",
          fileContent: "Extracted file content for AI"
        })
      );
    });
  });

  test("Acceptance: user can logout and socket disconnects", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        username: "nana",
        token: "fake-jwt-token"
      })
    });

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "nana" }
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(connectSocket).toHaveBeenCalledWith("fake-jwt-token");
    });

    fireEvent.click(screen.getByText("Logout"));

    expect(disconnectSocket).toHaveBeenCalled();
    expect(sessionStorage.getItem("username")).toBeNull();
  });
});
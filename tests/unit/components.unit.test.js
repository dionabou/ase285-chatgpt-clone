import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Message from "../../Dashboard/Chat/Message";
import Messages from "../../Dashboard/Chat/Messages";
import NewMessageInput from "../../Dashboard/Chat/NewMessageInput";
import Chat from "../../Dashboard/Chat/Chat";
import ListItem from "../../Dashboard/Sidebar/ListItem";
import Login from "../../Auth/Login";
import Signup from "../../Auth/Signup";

describe("Unit Tests - Components", () => {
  test("Message displays normal text", () => {
    render(<Message content="Hello world" aiMessage={false} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  test("Message displays attachment name instead of file content", () => {
    render(
      <Message
        content="hidden file content"
        attachmentName="notes.pdf"
        aiMessage={false}
      />
    );

    expect(screen.getByText("notes.pdf")).toBeInTheDocument();
    expect(screen.queryByText("hidden file content")).not.toBeInTheDocument();
  });

  test("Message displays image preview", () => {
    render(<Message content="data:image/png;base64,abc" aiMessage={false} />);
    expect(screen.getByAltText("uploaded")).toBeInTheDocument();
  });

  test("Message displays thinking indicator", () => {
    const { container } = render(
      <Message content="" aiMessage={true} isThinking={true} />
    );

    expect(container.querySelector(".thinking_indicator")).toBeInTheDocument();
  });

  test("Messages displays empty chat text when no messages", () => {
    render(<Messages messages={[]} isThinking={false} />);
    expect(screen.getByText("How can I help you today?")).toBeInTheDocument();
  });

  test("Messages renders multiple messages", () => {
    render(
      <Messages
        isThinking={false}
        messages={[
          { id: 1, sender: "user", content: "Hi" },
          { id: 2, sender: "assistant", content: "Hello" }
        ]}
      />
    );

    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("NewMessageInput changes text", () => {
    const onChange = jest.fn();

    render(
      <NewMessageInput
        value=""
        onChange={onChange}
        onSend={jest.fn()}
        onKeyDown={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Send a message..."), {
      target: { value: "test" }
    });

    expect(onChange).toHaveBeenCalledWith("test");
  });

  test("NewMessageInput sends message when send button clicked", () => {
    const onSend = jest.fn();

    const { container } = render(
      <NewMessageInput
        value="test"
        onChange={jest.fn()}
        onSend={onSend}
        onKeyDown={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".new_message_icon_container"));

    expect(onSend).toHaveBeenCalled();
  });

  test("NewMessageInput uploads file", () => {
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

    fireEvent.change(container.querySelector('input[type="file"]'), {
      target: { files: [file] }
    });

    expect(onFileUpload).toHaveBeenCalledWith(file);
  });

  test("Chat opens profile menu and logs out", () => {
    const onLogout = jest.fn();

    const { container } = render(
      <Chat
        sidebarOpen={true}
        toggleSidebar={jest.fn()}
        messages={[]}
        input=""
        onInputChange={jest.fn()}
        onSend={jest.fn()}
        onKeyDown={jest.fn()}
        isThinking={false}
        username="nana"
        onLogout={onLogout}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".profile_icon_container"));

    expect(screen.getByText("nana")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));

    expect(onLogout).toHaveBeenCalled();
  });

  test("Chat calls sidebar toggle", () => {
    const toggleSidebar = jest.fn();

    const { container } = render(
      <Chat
        sidebarOpen={true}
        toggleSidebar={toggleSidebar}
        messages={[]}
        input=""
        onInputChange={jest.fn()}
        onSend={jest.fn()}
        onKeyDown={jest.fn()}
        isThinking={false}
        username="nana"
        onLogout={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".chat_toggle_button"));

    expect(toggleSidebar).toHaveBeenCalled();
  });

  test("ListItem delete confirms before deleting", () => {
    window.confirm = jest.fn(() => true);
    const onDelete = jest.fn();

    const { container } = render(
      <ListItem
        session={{ _id: "1", title: "Delete Test", pinned: false }}
        onClick={jest.fn()}
        active={false}
        sidebarOpen={true}
        onDelete={onDelete}
        onRename={jest.fn()}
        onTogglePin={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".menu_button"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalled();
  });

  test("Login renders form fields", () => {
    render(<Login onLogin={jest.fn()} onSwitchToSignup={jest.fn()} />);

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("Signup renders form fields", () => {
    render(<Signup onSwitchToLogin={jest.fn()} />);

    expect(screen.getByPlaceholderText("Create username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create password")).toBeInTheDocument();
  });
});
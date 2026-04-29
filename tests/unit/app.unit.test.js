import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import Message from "../../Dashboard/Chat/Message";
import NewMessageInput from "../../Dashboard/Chat/NewMessageInput";
import NewChatButton from "../../Dashboard/Sidebar/NewChatButton";
import ListItem from "../../Dashboard/Sidebar/ListItem";
import Login from "../../Auth/Login";
import Signup from "../../Auth/Signup";

describe("Unit Tests - Components", () => {
  test("Message shows normal text message", () => {
    render(<Message content="Hello world" aiMessage={false} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  test("Message shows file attachment name instead of file content", () => {
    render(
      <Message
        content="This is extracted file content that should not be displayed"
        attachmentName="notes.pdf"
        aiMessage={false}
      />
    );

    expect(screen.getByText("notes.pdf")).toBeInTheDocument();
    expect(
      screen.queryByText("This is extracted file content that should not be displayed")
    ).not.toBeInTheDocument();
  });

  test("Message shows image when content is image data", () => {
    render(<Message content="data:image/png;base64,abc123" aiMessage={false} />);

    expect(screen.getByAltText("uploaded")).toBeInTheDocument();
  });

  test("Message shows thinking indicator", () => {
    const { container } = render(
      <Message content="" aiMessage={true} isThinking={true} />
    );

    expect(container.querySelector(".thinking_indicator")).toBeInTheDocument();
  });

  test("NewMessageInput calls onChange when typing", () => {
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
      target: { value: "Hello" }
    });

    expect(onChange).toHaveBeenCalledWith("Hello");
  });

  test("NewMessageInput calls onSend when send button is clicked", () => {
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

  test("NewMessageInput calls onKeyDown when key is pressed", () => {
    const onKeyDown = jest.fn();

    render(
      <NewMessageInput
        value="Hello"
        onChange={jest.fn()}
        onSend={jest.fn()}
        onKeyDown={onKeyDown}
        onFileUpload={jest.fn()}
      />
    );

    fireEvent.keyDown(screen.getByPlaceholderText("Send a message..."), {
      key: "Enter"
    });

    expect(onKeyDown).toHaveBeenCalled();
  });

  test("NewMessageInput calls onFileUpload when file is selected", () => {
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

  test("NewChatButton calls onClick", () => {
    const onClick = jest.fn();

    render(<NewChatButton onClick={onClick} />);

    fireEvent.click(screen.getByText("New chat"));

    expect(onClick).toHaveBeenCalled();
  });

  test("ListItem calls onClick when selected", () => {
    const onClick = jest.fn();

    render(
      <ListItem
        session={{ _id: "1", title: "Test Chat", pinned: false }}
        onClick={onClick}
        active={false}
        sidebarOpen={true}
        onDelete={jest.fn()}
        onRename={jest.fn()}
        onTogglePin={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Test Chat"));

    expect(onClick).toHaveBeenCalled();
  });

  test("ListItem opens menu and calls pin", () => {
    const onTogglePin = jest.fn();

    const { container } = render(
      <ListItem
        session={{ _id: "1", title: "Test Chat", pinned: false }}
        onClick={jest.fn()}
        active={false}
        sidebarOpen={true}
        onDelete={jest.fn()}
        onRename={jest.fn()}
        onTogglePin={onTogglePin}
      />
    );

    fireEvent.click(container.querySelector(".menu_button"));
    fireEvent.click(screen.getByText("Pin"));

    expect(onTogglePin).toHaveBeenCalled();
  });

  test("ListItem calls rename after editing", () => {
    const onRename = jest.fn();

    const { container } = render(
      <ListItem
        session={{ _id: "1", title: "Old Chat", pinned: false }}
        onClick={jest.fn()}
        active={false}
        sidebarOpen={true}
        onDelete={jest.fn()}
        onRename={onRename}
        onTogglePin={jest.fn()}
      />
    );

    fireEvent.click(container.querySelector(".menu_button"));
    fireEvent.click(screen.getByText("Rename"));

    const input = container.querySelector(".rename_input");

    fireEvent.change(input, {
      target: { value: "New Chat Name" }
    });

    fireEvent.keyDown(input, {
      key: "Enter"
    });

    expect(onRename).toHaveBeenCalledWith("New Chat Name");
  });

  test("Login renders username and password fields", () => {
    render(<Login onLogin={jest.fn()} onSwitchToSignup={jest.fn()} />);

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("Signup renders username and password fields", () => {
    render(<Signup onSwitchToLogin={jest.fn()} />);

    expect(screen.getByPlaceholderText("Create username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create password")).toBeInTheDocument();
  });
});
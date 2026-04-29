import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../../Dashboard/Sidebar/Sidebar";

const mockSessions = [
  { _id: "1", title: "School Project", pinned: true },
  { _id: "2", title: "Work Notes", pinned: false }
];

const setup = (props = {}) => {
  return render(
    <Sidebar
      sidebarOpen={true}
      toggleSidebar={jest.fn()}
      sessions={mockSessions}
      currentSessionId="1"
      onNewChat={jest.fn()}
      onSelectSession={jest.fn()}
      onDeleteSession={jest.fn()}
      onRenameSession={jest.fn()}
      onTogglePin={jest.fn()}
      searchTerm=""
      onSearchChange={jest.fn()}
      filterType="all"
      onFilterChange={jest.fn()}
      sortType="newest"
      onSortChange={jest.fn()}
      sidebarWidth={320}
      onStartResize={jest.fn()}
      {...props}
    />
  );
};

describe("Unit Tests - Sidebar", () => {
  test("renders New chat button", () => {
    setup();
    expect(screen.getByText("New chat")).toBeInTheDocument();
  });

  test("calls onNewChat when New chat is clicked", () => {
    const onNewChat = jest.fn();
    setup({ onNewChat });

    fireEvent.click(screen.getByText("New chat"));

    expect(onNewChat).toHaveBeenCalled();
  });

  test("calls toggleSidebar when collapse button is clicked", () => {
    const toggleSidebar = jest.fn();
    const { container } = setup({ toggleSidebar });

    fireEvent.click(container.querySelector(".sidebar_toggle"));

    expect(toggleSidebar).toHaveBeenCalled();
  });

  test("calls onSearchChange when searching", () => {
    const onSearchChange = jest.fn();
    setup({ onSearchChange });

    fireEvent.change(screen.getByPlaceholderText("Search conversations..."), {
      target: { value: "school" }
    });

    expect(onSearchChange).toHaveBeenCalledWith("school");
  });

  test("renders sessions", () => {
    setup();

    expect(screen.getByText("School Project")).toBeInTheDocument();
    expect(screen.getByText("Work Notes")).toBeInTheDocument();
  });

  test("calls onSelectSession when a chat is clicked", () => {
    const onSelectSession = jest.fn();
    setup({ onSelectSession });

    fireEvent.click(screen.getByText("Work Notes"));

    expect(onSelectSession).toHaveBeenCalledWith("2");
  });

  test("opens filter menu and selects pinned filter", () => {
    const onFilterChange = jest.fn();
    setup({ onFilterChange });

    fireEvent.click(screen.getByLabelText("All conversations"));
    fireEvent.click(screen.getByText("Pinned"));

    expect(onFilterChange).toHaveBeenCalledWith("pinned");
  });

  test("opens sort menu and selects A to Z", () => {
    const onSortChange = jest.fn();
    setup({ onSortChange });

    fireEvent.click(screen.getByLabelText("Newest first"));
    fireEvent.click(screen.getByText("A to Z"));

    expect(onSortChange).toHaveBeenCalledWith("az");
  });

  test("calls resize handler when resize handle is pressed", () => {
    const onStartResize = jest.fn();
    const { container } = setup({ onStartResize });

    fireEvent.mouseDown(container.querySelector(".sidebar_resize_handle"));

    expect(onStartResize).toHaveBeenCalled();
  });

  test("does not show search when sidebar is closed", () => {
    setup({ sidebarOpen: false });

    expect(screen.queryByPlaceholderText("Search conversations...")).not.toBeInTheDocument();
  });
});
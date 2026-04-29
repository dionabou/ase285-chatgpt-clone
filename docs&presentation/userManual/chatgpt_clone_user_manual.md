---
marp: true
paginate: true
theme: default
---

# ChatGPT Clone

## User Manual

------------------------------------------------------------------------

# Overview

A full-stack ChatGPT-style application that allows users to: - Create
and manage chat sessions\
- Send messages and receive AI responses\
- Upload files for AI processing\
- View persistent chat history

------------------------------------------------------------------------

# Before Opening the App (Localhost Setup)

Make sure the following are ready:

-   Node.js and npm installed\
-   Docker installed and running (if using Docker)\
-   Internet connection (for AI responses)

### Run the application:

**Option 1: Without Docker**

``` bash
npm install
npm start
```

**Option 2: With Docker**

``` bash
docker compose up --build
```

------------------------------------------------------------------------

# Access the App

Open your browser and go to:

http://localhost:3000

------------------------------------------------------------------------

# Features

-   Real-time messaging (Socket.IO)\
-   User authentication (signup/login/logout)\
-   Persistent chat sessions (MongoDB)\
-   File upload with AI processing\
-   Search, filter, and sort conversations\
-   Docker-based deployment

------------------------------------------------------------------------

# Getting Started

1.  Open the application\
2.  Sign up or log in\
3.  Access the dashboard

------------------------------------------------------------------------

# Authentication

-   **Sign Up:** Create a new account\
-   **Login:** Enter username and password\
-   **Logout:** Profile icon → Logout

------------------------------------------------------------------------

# Chat Sessions

-   Click **New Chat** to start\
-   Select chats from sidebar\
-   Sessions are saved automatically

------------------------------------------------------------------------

# Managing Chats

Users can: - Rename chats\
- Delete chats\
- Pin/unpin chats\
- Search conversations\
- Filter (All / Pinned / Unpinned)\
- Sort (Newest / Oldest / A--Z)

------------------------------------------------------------------------

# Sending Messages

-   Type in input box\
-   Press **Enter** or click send\
-   AI responds in real time\
-   Thinking indicator shows while waiting

------------------------------------------------------------------------

# File Upload

-   Click 📎 icon\
-   Upload file (PDF, TXT, DOCX, XLSX, image)\
-   File shows as preview in chat\
-   AI processes file internally

------------------------------------------------------------------------

# Chat History

-   Conversations are saved automatically\
-   Reloading keeps chat history\
-   Each user sees only their chats

------------------------------------------------------------------------

# Sidebar Features

-   Collapse/expand sidebar\
-   Resize sidebar width\
-   Search chats\
-   Filter and sort conversations

------------------------------------------------------------------------

# System Behavior

-   Real-time updates using WebSockets\
-   Handles disconnect/reconnect automatically\
-   Fast and responsive UI

------------------------------------------------------------------------

# Requirements (Sprint-Based)

-   Backend persistence for conversations\
-   Search, filter, and sort chats\
-   Real-time AI messaging with thinking indicator\
-   User authentication\
-   File attachment with preview\
-   Testing and Docker deployment

------------------------------------------------------------------------

# Testing

-   Unit Tests\
-   Integration Tests\
-   Regression Tests\
-   Acceptance Tests

------------------------------------------------------------------------

# Troubleshooting

-   Ensure Docker is running\
-   Check internet connection\
-   Restart backend if needed\
-   Refresh page if connection issues occur

------------------------------------------------------------------------

# Conclusion

This app provides: - Real-time AI chat\
- Persistent conversations\
- File upload support\
- User-specific sessions\
- Docker-based deployment

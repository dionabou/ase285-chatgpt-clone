# ChatGPT Clone (Individual Project Prototype)
## Overview
A full-stack chat application that replicates the core ChatGPT experience: users can create chat sessions, send messages, and receive AI-generated responses. Built with a React frontend and a Node/Express backend using WebSockets, with OpenAI API integration and session history support.

---

## 1) Project title and description
**Title:** ChatGPT Clone (Individual Project Prototype)  
**Description:** A full-stack chat application that replicates the core ChatGPT experience: users can create chat sessions, send messages, and receive AI-generated responses. Built with a React frontend and a Node/Express backend using WebSockets, with OpenAI API integration and session history support.

---

## 2) Problem domain and motivation (what is the problem and why it matters)
**Problem:** Using AI through raw APIs or command line tools is not convenient for typical users, and basic chat demos often don’t support session history or real-time interactions.  
**Why it matters:** This project provides an accessible chat UI while practicing real software engineering skills: real-time communication, session persistence, API integration, scalable architecture, and deployment.

---

## 3) Features and requirements (what is our solution to the problem)

### Features (based on the prototype steps)
**Sprint 1**
- React chat UI (chat screen + input + sidebar)
- WebSocket connection between client and server
- Session management (create session + load history + persist session)
- End-to-end messaging (send message → update conversation → display results)

**Sprint 2**
- OpenAI integration (server calls OpenAI, returns AI message)
- Conversation management (delete/clear conversations)
- Deployment (build + run in deployed environment)
- Standalone mode (remove Express; client calls OpenAI directly with async logic)

### Requirements
- Users can start a new chat session and switch sessions
- Users can send messages and see AI responses
- Conversation history persists across refresh
- System handles disconnect/reconnect gracefully
- App is deployable and runnable outside localhost

---

## 4) Data model and architecture (overall structure and design)
**Architecture:** React client ↔ WebSocket (Socket.IO) ↔ Express/Node server ↔ OpenAI API  
**Storage:** session ID + conversation history persisted on client (IndexedDB/local storage); server manages sessions/conversations during the server-based steps.

**Data model:**
- **Session:** sessionId, conversations[]
- **Conversation:** conversationId, title, messages[]
- **Message:** messageId, sender(user/ai), content, timestamp

---

## 5) Tests (how we ensure quality)
- **Manual tests:** new session creation, message send/receive, AI response display, switching sessions, history persistence after refresh.  
- **Integration tests (planned/optional):** WebSocket event flows (session-history, conversation-message, conversation-delete), OpenAI call success/failure handling.  
- **Performance checks:** basic responsiveness and load checks (e.g., Lighthouse).

---

## 6) Team members and roles
**Individual project (solo):**
planning, UI/frontend development, backend/WebSocket logic, OpenAI integration, testing, and deployment.

---

## 7) Links to code, tests, documentation, and presentations
- **Code (repo):** https://github.com/dionabou/ase285-chatgpt-clone
- **Tests:** [add link/path if you have a tests folder or test report]  
- **Presentation:** slides link + demo video link (if required)

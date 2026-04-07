const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let sessions = [
  {
    id: 1,
    title: "New Chat",
    pinned: false,
    messages: []
  }
];

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("get_sessions", () => {
    socket.emit("sessions_data", sessions);
  });

  socket.on("new_session", () => {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      pinned: false,
      messages: []
    };

    sessions.unshift(newSession);
    socket.emit("new_session_created", newSession.id);
    io.emit("sessions_data", sessions);
  });

  socket.on("delete_session", (id) => {
    sessions = sessions.filter((session) => session.id !== id);

    if (!sessions.length) {
      sessions = [
        {
          id: Date.now(),
          title: "New Chat",
          pinned: false,
          messages: []
        }
      ];
    }

    io.emit("sessions_data", sessions);
  });

  socket.on("rename_session", ({ id, title }) => {
    sessions = sessions.map((session) =>
      session.id === id
        ? { ...session, title: title?.trim() || "New Chat" }
        : session
    );

    io.emit("sessions_data", sessions);
  });

  socket.on("toggle_pin", (id) => {
    sessions = sessions.map((session) =>
      session.id === id
        ? { ...session, pinned: !session.pinned }
        : session
    );

    io.emit("sessions_data", sessions);
  });

  socket.on("send_message", async (payload) => {
    try {
      console.log("Received message:", payload);

      const session = sessions.find((s) => s.id === payload.sessionId);
      if (!session) return;

      const isFirstUserMessage = session.messages.length === 0;

      session.messages.push(payload);

      if (session.title === "New Chat" && isFirstUserMessage) {
        session.title = payload.content.slice(0, 30) || "New Chat";
      }

      io.emit("sessions_data", sessions);

      const response = await client.responses.create({
        model: "gpt-5.2",
        input: [
          {
            role: "system",
            content: "AI assistant."
          },
          {
            role: "user",
            content: payload.content
          }
        ]
      });

      const reply = {
        sessionId: payload.sessionId,
        id: Date.now() + 1,
        sender: "assistant",
        content: response.output_text || "Could not generate a response."
      };

      session.messages.push(reply);
      io.emit("sessions_data", sessions);
    } catch (error) {
      console.error("OpenAI error:", error);

      const session = sessions.find((s) => s.id === payload.sessionId);
      if (!session) return;

      const fallbackReply = {
        sessionId: payload.sessionId,
        id: Date.now() + 1,
        sender: "assistant",
        content: "Sorry, there was an issue getting an AI response."
      };

      session.messages.push(fallbackReply);
      io.emit("sessions_data", sessions);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Socket server is running");
});

server.listen(5000, () => {
  console.log("Server listening on http://localhost:5000");
});
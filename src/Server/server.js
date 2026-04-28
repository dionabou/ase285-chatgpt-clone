const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

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

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

let users = [];

let sessions = [
  {
    id: 1,
    title: "New Chat",
    pinned: false,
    messages: []
  }
];

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Signup failed." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful.",
      token,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
});

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
      socket.emit("message_received");
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
      socket.emit("message_received");
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
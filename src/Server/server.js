const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const OpenAI = require("openai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

mongoose
  .connect(process.env.MONGO_URI || "mongodb://mongo:27017/chatgpt_clone")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: { type: String, default: "New Chat" },
    pinned: { type: Boolean, default: false },
    messages: [
     {
  id: Number,
  sender: String,
  content: String,
  attachmentName: String,
  attachmentType: String
}
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Session = mongoose.model("Session", sessionSchema);

const upload = multer({ dest: "uploads/" });

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "Account created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      username: user.username
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    let content = "";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (file.mimetype === "text/plain") {
      content = fs.readFileSync(file.path, "utf8");
    } else if (file.mimetype === "application/pdf") {
      const data = new Uint8Array(fs.readFileSync(file.path));
      const pdf = await pdfjsLib.getDocument({ data }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        content += textContent.items.map((item) => item.str).join(" ");
      }
    } else if (file.originalname.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: file.path });
      content = result.value;
    } else if (
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".csv")
    ) {
      const workbook = XLSX.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      content = JSON.stringify(XLSX.utils.sheet_to_json(sheet));
    } else if (file.mimetype.startsWith("image/")) {
      const image = fs.readFileSync(file.path);
      content = `data:${file.mimetype};base64,${image.toString("base64")}`;
    } else {
      content = "Unsupported file type";
    }

    fs.unlinkSync(file.path);

    res.json({
  content,
  filename: file.originalname,
  mimetype: file.mimetype
});
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    socket.userId = decoded.id;
    socket.username = decoded.username;

    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, "User:", socket.username);

  const sendUserSessions = async () => {
    const sessions = await Session.find({ userId: socket.userId }).sort({
      pinned: -1,
      updatedAt: -1
    });

    socket.emit("sessions_data", sessions);
  };

  socket.on("get_sessions", async () => {
    try {
      await sendUserSessions();
    } catch (err) {
      console.error("Get sessions error:", err);
    }
  });

  socket.on("new_session", async () => {
    try {
      const newSession = new Session({
        userId: socket.userId,
        title: "New Chat",
        pinned: false,
        messages: []
      });

      await newSession.save();

      socket.emit("new_session_created", newSession._id);
      await sendUserSessions();
    } catch (err) {
      console.error("New session error:", err);
    }
  });

  socket.on("delete_session", async (id) => {
    try {
      await Session.findOneAndDelete({
        _id: id,
        userId: socket.userId
      });

      await sendUserSessions();
    } catch (err) {
      console.error("Delete session error:", err);
    }
  });

  socket.on("rename_session", async ({ id, title }) => {
    try {
      await Session.findOneAndUpdate(
        {
          _id: id,
          userId: socket.userId
        },
        {
          title: title.trim() || "New Chat"
        }
      );

      await sendUserSessions();
    } catch (err) {
      console.error("Rename session error:", err);
    }
  });

  socket.on("toggle_pin", async (id) => {
    try {
      const session = await Session.findOne({
        _id: id,
        userId: socket.userId
      });

      if (!session) return;

      session.pinned = !session.pinned;
      await session.save();

      await sendUserSessions();
    } catch (err) {
      console.error("Toggle pin error:", err);
    }
  });

  socket.on("send_message", async (payload) => {
    try {
      const session = await Session.findOne({
        _id: payload.sessionId,
        userId: socket.userId
      });

      if (!session) return;

  

      const userMessage = {
  id: payload.id || Date.now(),
  sender: "user",
  content: payload.content,
  attachmentName: payload.attachmentName,
  attachmentType: payload.attachmentType
};

      session.messages.push(userMessage);

      if (session.title === "New Chat" && session.messages.length === 1) {
        session.title = payload.content.slice(0, 30);
      }

      await session.save();
      await sendUserSessions();

   const aiInput = payload.fileContent || payload.content;

const response = await client.responses.create({
  model: "gpt-5.2",
  input: [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: aiInput }
  ]
});

      const reply = {
        id: Date.now(),
        sender: "assistant",
        content: response.output_text || "No response"
      };

      session.messages.push(reply);
      await session.save();

      await sendUserSessions();

      socket.emit("message_received");
    } catch (err) {
      console.error("Send message error:", err);

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
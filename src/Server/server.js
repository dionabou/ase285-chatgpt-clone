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

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("send_message", async (payload) => {
    try {
      console.log("Received message:", payload);

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

      socket.emit("receive_message", reply);
    } catch (error) {
      console.error("OpenAI error:", error);

      socket.emit("receive_message", {
        sessionId: payload.sessionId,
        id: Date.now() + 1,
        sender: "assistant",
        content: "Sorry, there was an issue getting an AI response."
      });
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
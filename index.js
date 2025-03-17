const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed for production
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("WebSocket server is running 🤔 ");
});

const userSockets = {}; // Store user IDs and their socket IDs
const userMessages = {}; // Store messages for each user

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUserId", (userId) => {
    userSockets[userId] = socket.id;
    userMessages[userId] = userMessages[userId] || []; // Initialize message array
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Send any pending messages to the user upon connection
    if (userMessages[userId].length > 0) {
      userMessages[userId].forEach((message) => {
        socket.emit("message", message);
      });
      userMessages[userId] = []; // Clear the messages after sending
    }
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

    const receiverSocketId = userSockets[receiverId];

    if (receiverSocketId) {
      // Receiver is online, send the message directly
      io.to(receiverSocketId).emit("message", { senderId, message });
    } else {
      // Receiver is offline, store the message
      userMessages[receiverId] = userMessages[receiverId] || [];
      userMessages[receiverId].push({ senderId, message });
    }
  });

  socket.on("disconnect", () => {
    // Remove the user's socket ID when they disconnect
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
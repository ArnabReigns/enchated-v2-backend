const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

var rooms = [];

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  io.sockets.emit("rooms", rooms);

  // Join a specific chat room
  socket.on("join-room", (room) => {
    socket.join(room);
    rooms = Array.from(new Set([...rooms, room]));
    io.sockets.emit("rooms", rooms);
    console.log(`User joined room ${room}`);
  });

  socket.on("which-room", () => {
    console.log(socket.rooms);
  });

  // Leave a specific chat room
  socket.on("leave-room", (room) => {
    socket.leave(room);
    console.log(`User left room ${room}`);
  });

  // Listen for chat messages in a specific room
  socket.on("chat-message", ({ sender, room, message }) => {
    console.log(socket, room, message);
    io.to(room).emit("chat-message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => res.send("Enchated v2 Backend"));

http.listen(3000, () => {
  console.log("listening on *:3000");
});

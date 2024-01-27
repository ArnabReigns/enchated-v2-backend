const express = require("express");
const app = express();
require("./db");
const User = require("./models/user_model");
const Room = require("./models/room_model");
const http = require("http").createServer(app);
const cors = require("cors");
const { userInfo } = require("os");
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  // io.sockets.emit("rooms", rooms);

  // // Join a specific chat room
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  // socket.on("which-room", () => {
  //   console.log(socket.rooms);
  // });

  // // Leave a specific chat room
  // socket.on("leave-room", (room) => {
  //   socket.leave(room);
  //   console.log(`User left room ${room}`);
  // });

  // Listen for chat messages in a specific room
  socket.on("chat-message", ({ sender, room, message }) => {
    Room.findOne({ name: room }).then((r) => {
      r.chats.push({ name: sender, message: message, timestamp: Date.now() });
      r.save();
      io.to(room).emit(`chat-message-${room}`, {
        name: sender,
        message: message,
        timestamp: Date.now(),
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => res.send("Enchated v2 Backend"));

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }).then((user) => {
    console.log(user);
    if (user == null) {
      new User({
        username,
        password,
      })
        .save()
        .then((u) =>
          res.json({
            created: true,
            loggedin: true,
            user: {
              username: u.username,
              password: u.password,
            },
          })
        );
    } else {
      if (password == user.password)
        res.json({
          found: true,
          loggedin: true,
          user: {
            username: user.username,
            password: user.password,
          },
        });
      else {
        res.json({
          loggedin: false,
          error: "Wrong Credentials",
        });
      }
    }
  });
});

app.post("/rooms", (req, res) => {
  console.log(req.body);
  User.findOne({ username: req.body.username })
    .then((u) => {
      console.log(u);
      res.json({
        rooms: u.rooms ?? [],
      });
    })
    .catch((err) => {
      res.status(400).json({
        msg: "can't find user",
      });
    });
});

app.post("/create-room", (req, res) => {
  const {
    user,
    room: { name, password },
  } = req.body;

  Room.findOne({ name: name }).then((room) => {
    if (!room) {
      new Room({
        name: name,
        creator: user,
        password: password,
        chats: [],
      })
        .save()
        .then((r) => {
          User.findOne({
            username: user,
          }).then((user) => {
            user.rooms.push(name);
            user.save().then(() => {
              res.send({
                success: true,
                msg: "Room Created",
              });
            });
          });
        });
    } else {
      res.send({
        success: false,
        msg: "Room Already Exist",
      });
    }
  });
});

app.post("/add-room", (req, res) => {
  const {
    user,
    room: { name, password },
  } = req.body;

  Room.findOne({ name: name }).then((room) => {
    if (room) {
      if (room.password == password) {
        User.findOne({
          username: user,
        }).then((user) => {
          user.rooms.push(name);
          user.save().then(() => {
            res.send({
              success: true,
              msg: "Room Added",
            });
          });
        });
      } else {
        res.send({
          success: false,
          msg: "Wrong Credentials",
        });
      }
    } else {
      res.send({
        success: false,
        msg: "Can't find room",
      });
    }
  });
});

app.post("/chats", (req, res) => {
  const room = req.body.room;

  Room.findOne({ name: room }).then((r) => {
    if (r) {
      res.json({ chats: r.chats });
    } else {
      res.status(400).json({
        msg: "can't find room",
      });
    }
  });
});
http.listen(3000, () => {
  console.log("listening on *:3000");
});

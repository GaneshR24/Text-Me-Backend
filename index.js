require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./db/connect");
const usersRoute = require("./routes/usersRoute");
const chatsRoute = require("./routes/chatsRoute");
const messagesRoute = require("./routes/messagesRoute");

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(cors({ origin: "https://textmeapplication.netlify.app" }));
db();

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "https://textmeapplication.netlify.app",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];
io.on("connection", (socket) => {
  // socket events will be here
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });

  // send message to clients (who are present in members array)
  socket.on("send-message", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);
  });

  // clear unread messages
  socket.on("clear-unread-messages", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("unread-messages-cleared", data);
  });

  // typing event
  socket.on("typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
  });

  // online users

  socket.on("came-online", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }

    io.emit("online-users-updated", onlineUsers);
  });

  socket.on("went-offline", (userId) => {
    onlineUsers = onlineUsers.filter((user) => user !== userId);
    io.emit("online-users-updated", onlineUsers);
  });
});

app.use("/api/users", usersRoute);
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);

app.get("/", (req, res) => {
  res.send("Welcome to our Text Me Application!");
});

const PORT = process.env.PORT || 26001;

server.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http"); // Import the HTTP module
const socketIO = require("socket.io");
const mongoDB_init = require("./config/init_db");
const chats = require("./data/data");
const InitRoutes = require("./routes/index");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app); // Create an HTTP server instance
// const io = socketIO(server);  // Attach Socket.IO to the HTTP server
const { Server } = require("socket.io");

require("dotenv").config();
app.use(cors());

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

InitRoutes(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
// Socket.IO event handling

let users = [];
let rooms = [];

io.on("connection", (socket) => {
  console.log("A user connected ", socket.id);

  // Example: Broadcast a message to all connected clients
  socket.on("addUser", (userId) => {
    const userExist = users?.find((user) => user.userId == userId);

    // console.log("userExist ", userExist,users);
    if (!userExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
    }
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ message }) => {
    const receiver = users.find((user) => user.userId == message.receiver);
    const sender = users.find((user) => user.userId == message.sender);
    console.log("message ", message);
    console.log("type ", typeof message.receiver);
    const customId = uuidv4();


    const updatedMessage = {
      _id: customId,
      sender: { _id: message.sender },
      receiver: { _id: message.receiver },
      content: message.content,
      chatId: message.chatId,
      senderName:message.senderName
    };


    if (message.isGroupChat) {
      console.log("broadcast ", message);

      io.to(message.chatId).emit("receivegroupChat",updatedMessage);
      return;
    }

    console.log("check for group chat ",message.isGroupChat)

   

    io.to(receiver?.socketId)
      .to(sender?.socketId)
      .emit("getMessage", updatedMessage);
  });

  socket.on("joinroom", (data) => {
    console.log("join room ", data);

    socket.join(data.room);

    // Add the user to the collection for the room
    if (!rooms[data.room]) {
      rooms[data.room] = [];
    }

    const userExist = rooms[data.room].find(
      (user) => user.userId === data.user
    );

    if (!userExist) {
      const user = {
        userId: data.user,
        socketId: socket.id,
      };

      rooms[data.room].push(user);

      console.log("User joined room:", user);
      console.log("rooms ", rooms);
    } else {
      console.log("User already exists in the room:", userExist);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected ", socket.id);
    users = users.filter((user) => user.socketId != socket.id);
    io.emit("getUsers", users);
  });
});

// Endpoint to serve chat data
app.get("/api/chats", (req, res) => {
  res.send(chats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

mongoDB_init();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

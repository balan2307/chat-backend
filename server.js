const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');  // Import the HTTP module
const socketIO = require('socket.io');
const mongoDB_init = require('./config/init_db');
const chats = require('./data/data');
const InitRoutes = require('./routes/index');

const app = express();
const server = http.createServer(app);  // Create an HTTP server instance
// const io = socketIO(server);  // Attach Socket.IO to the HTTP server
const {Server}=require("socket.io")

require('dotenv').config();
app.use(cors());

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

InitRoutes(app);

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3001",
        methods:["GET","POST"]
    }
})
// Socket.IO event handling
io.on('connection', (socket) => {
    console.log('A user connected ',socket.id);

    // Example: Broadcast a message to all connected clients
    socket.on('message', (data) => {
        console.log('Message from client:', data);
        io.emit('message', 'Server received your message: ' + data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Endpoint to serve chat data
app.get('/api/chats', (req, res) => {
    res.send(chats);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

mongoDB_init();

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoDB_init = require('./config/init_db');
const chats = require('./data/data');
const InitRoutes = require('./routes/index');

const app = express();

require("dotenv").config();
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

InitRoutes(app);

app.get('/api/chats', (req, res) => {
    res.send(chats);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

mongoDB_init();

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

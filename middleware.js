const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const configureMiddlewares = (app) => {
    app.use(cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        credentials: true,
    }));
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
    });
};

module.exports = configureMiddlewares;

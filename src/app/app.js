require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('../middlewares/errorHandler'); // adjust path

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler); // must be LAST, after all routes

module.exports = app;

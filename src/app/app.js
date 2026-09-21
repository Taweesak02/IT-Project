require('dotenv/config');
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const routes = require('./routes');
const openapi = require('../docs/openapi');
const errorHandler = require('../middlewares/errorHandler'); // adjust path

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/api-docs.json', (_req, res) => res.json(openapi));

app.use('/api', routes);

app.use(errorHandler); // must be LAST, after all routes

module.exports = app;

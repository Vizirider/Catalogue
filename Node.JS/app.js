'use strict';

import catalogueRoutes from './src/routes/catalogue-routes';
import { config } from './config';
import errorRoutes from './src/routes/error-routes';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import userRoutes from './src/routes/user-routes';

// SERVER CONFIGURATION
const app = express();
const device = require('express-device');
app.use(device.capture());
app.use(json());
app.use(urlencoded({ extended: true }));

// SETTING CORS-POLICY (FOR DEVELOPMENT)
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

// PREFIXING ROUTES
const router = express.Router();
userRoutes(router);
catalogueRoutes(router);
errorRoutes(router);
app.use(config.appVersion, router);

// START APPLICATION
app.listen(config.dbPort, () => {
    console.log(`ITSH Restful API Running on Port ${config.dbPort}...`);
});

// DATABASE CONNECTION
const mysql = require(config.dbDriver);
export const conn = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
});
conn.connect(function(err) {
    if (err) {
        console.log('Database connection error! Error: ' + err.erno);
    } else {
        console.log(`Connection to '${config.dbName}' database successful!`);
    }
});

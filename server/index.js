require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 8005;
const socketport = process.env.SOCKET_PORT || 7005;
const cookieparser = require('cookie-parser');
const helmet = require('helmet');
var cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
app.use(helmet()); // Basic security headers
const path = require('path');
const db = require('./config/mongoose');
const { startWeatherCron } = require('./utils/weather.cron');

// Initialize Cron Jobs
startWeatherCron();




app.use(express.json());
app.use(express.urlencoded({ extended: true }));// always write first as a middle ware
app.use(cors());
app.use(cookieparser());// this both middleware is needed to run before router

// socket

const server = require('http').createServer(app);

const chatSockets = require('./config/chat_sockets').chatSockets(server);

server.listen(socketport, function (err) {
    if (err) {
        console.log("Error to start socket!!!");
        return;
    }

    console.log("socket is running on the port: ", socketport);
})

app.use('/', require('./routes/index_route'));
app.use(express.static('static'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));
// app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', './views');


app.listen(port, function (err) {
    if (err) {
        console.log("Error to start server!!!");
        return;
    }

    console.log("Server is running on the port: ", port);
})
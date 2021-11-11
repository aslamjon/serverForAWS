const express = require('express');
const app = express();
const cors = require('cors');
const { controller } = require('./controllers/controller');

// const path = require("path");

app.use(cors());
require("dotenv").config();
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ extended: true })) // if json come backend then it convert to obj in req.body


app.use('/server/onlineBook', controller)


// Error handle
app.use(function (err, req, res, next) {
    console.log("[Global error middleware]", err.message);
    res.status(500).send({
        message: err.message
    })
    next();
})


const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => console.log("server is running on", PORT));
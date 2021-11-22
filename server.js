const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const multer  = require('multer');
// const upload = require('express-fileupload')
const { controller } = require('./controllers/controller');

// const path = require("path");


app.use(cors());
require("dotenv").config();
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ extended: true })) // if json come backend then it convert to obj in req.body

// Middleware function
function addDateTime(name) {
    const newDate = new Date();
    const orginalNameArr = name.split(".");
    const fileType = orginalNameArr.pop();
    const getDate = newDate.toLocaleDateString().split('/').join('_');
    const getTime = newDate.toLocaleTimeString().split(' ')[0].split(':').join('_');
    const milliseconds = newDate.getMilliseconds();
    orginalNameArr.push(`__${getDate}_${getTime}_${milliseconds}`);
    orginalNameArr.push(`.${fileType}`);
    return orginalNameArr.join('');
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, `./data/images`))
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, `${addDateTime(originalname)}`)
    }
})
// const upload = multer({ dest: path.join(__dirname, `./data/cache`) });
const upload = multer({ storage });
const nameOfFileFromFrontend = upload.any();


app.use('/server/onlineBook', nameOfFileFromFrontend, controller)


// Error handle
// app.use(function (err, req, res, next) {
//     console.log("[Global error middleware]", err.message);
//     res.status(500).send({
//         message: err.message
//     })
//     next();
// })


const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => console.log("server is running on", PORT));
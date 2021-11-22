const fetch = require('node-fetch');
const path = require("path");
const fs = require('fs');
const FormData = require('form-data');
const data = require('../data/data.json');
const { saveImg } = require('../utilities');


async function controller(req, res) {
    // console.log(req.get('host'));
    let api = req.originalUrl.replace(req.url, '');
    let port = data[api];

    main(req, res, port);
}

function main(req, res, port) {
    const { url, method, headers, body } = req;
    let bodyData = Object.keys(body).length ? JSON.stringify(body) : null;
    let options = {
        method,
        body: {},
        headers
    };
    const formData = new FormData();
    
    Object.keys(body).forEach(value => {
        formData.append(value, body[value]);
    })
    
    if (req.files){
        req.files.forEach(value => {
            formData.append(value.fieldname, fs.createReadStream(value.path), {
                contentType: value.mimetype,
                name: value.fieldname,
                filename: value.filename,
            });
            // console.log(value.fieldname, value.path)
            // formData.append(value.fieldname, fs.readFileSync(value.path));
            // formData.append(value.fieldname, fs.readFileSync(value.path, 'utf8'));
            // let data = fs.readFileSync(value.path);
            // console.log(data)
        });
    }

    // console.log(formData)
    options.body = formData;
    // console.log(options.body)

    let status = {};
    fetch(`http://localhost:${port}${url}`, options)
        .then(res => {
            status.status = res.status;
            status.statusText = res.statusText;
            return res.json();
        })
        .then(json => res.status(status.status).send(json))
        .catch(e => res.status(500).send({ message: e.message }));
}

module.exports = {
    controller
}
const fetch = require('node-fetch');
const path = require("path");
const data = require('../data/data.json');
const { encodingBase64, decodingBase64, unlink, addDateTime } = require('../utilities');


async function controller(req, res) {
    // console.log(req.get('host'));
    let api = req.originalUrl.replace(req.url, '');
    // console.log(api)
    let port = data[api].port;
    let fileUrl = data[api].files
    req.configData = {
        fileUrl,
        port
    };    

    if (req.url.includes(fileUrl)) {
        fetchForFile(req, res)
    } else main(req, res);
}

async function safeParseJSON(response) {
    const body = await response.text();
    try {
        return JSON.parse(body);
    } catch (err) {
        console.error("Error:", err);
        console.error("Response body:", body);
        // throw err;
        // return new Error(err.message, 500);
        return { Error: err.message, body };
    }
}

function main(req, res) {
    const { port } = req.configData;
    const { url, method, headers, body } = req;
    headers['content-type'] = "application/json"
    delete headers['content-length']
    
    let options = { method, headers };
    // encodingFile to Base64
    let tempFilePath = [];
    if (req.files) {
        req.files.length && req.files.forEach(({ fieldname, filename, path}) => {
            body[fieldname] = {
                filename,
                [fieldname+'File']: encodingBase64(path),
            };
            tempFilePath.push(path);
        })
    }
    // Convert body to json
    let bodyData = Object.keys(body).length ? JSON.stringify(body) : null;

    bodyData ? options.body = bodyData : null;
    // console.log(options)
    let status = {};
    
    fetch(`http://localhost:${port}${url}`, options)
        .then(res => {
            status.status = res.status;
            status.statusText = res.statusText;
            return safeParseJSON(res);
        })
        .then(json => {
            res.status(status.status).send(json);
            return json
        })
        .catch(e => {
            let message = e.message.replace(`http://localhost:${port}`, "") + `
            
            Please check request and try again. Or talk it to Developers. 
            
            Website: https://aslamjon.github.io
            Telegram: @i_am_anonim`;
            res.status(500).send({ message});
        });
    
    tempFilePath.forEach(value => { unlink(value) });
}

function fetchForFile(req, res) {
    const { port, fileUrl } = req.configData;
    const [, second, third] = req.url.split('/');
    if (fileUrl == `/${second}/${third}`) {
        const { url, method, headers } = req;
        let options = { method, headers };
        let status = {};
        fetch(`http://localhost:${port}${url}`, options)
            .then(res => {
                status.status = res.status;
                status.statusText = res.statusText;
                return res.json();
            })
            .then(json => {
                if (status.status == 404) {
                    res.status(status.status).send(json);
                } else {
                    filePath = path.join(__dirname, `./../data/files/${json.fileName}`);
                    decodingBase64(json.file, filePath);
                    res.status(status.status).sendFile(filePath);
                    setTimeout(() => unlink(filePath), 2000);
                }
                return json
            })
            .catch(e => res.status(500).send({ message: e.message }));
    } 
}

module.exports = {
    controller
}
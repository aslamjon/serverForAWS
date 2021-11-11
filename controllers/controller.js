const fetch = require('node-fetch');
const data = require('../data/data.json');

function controller(req, res) {
    // console.log(req.get('host'));
    let api = req.originalUrl.replace(req.url, '');
    let port = data[api];
    main(req, res, port);
}

function main(req, res, port) {
    const {url, method, headers, body} = req;
    
    const options = {
        method,
        body: Object.keys(body).length ? JSON.stringify(body) : null,
        headers
    };
    
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
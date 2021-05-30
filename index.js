// Environment Variables
// require('dotenv').config();

const { corsAndBodyParser, corsOptions, isBuffer } = require('mr365-utils');
// const syncViaFtp = require('sync-via-ftp');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const express = require('express');
const md5 = require('md5');
const port = 5000;
const debug = 0;

function sizeOf(s) {
    return (s + '').length;
}

/**
 * Run a cluster of 1 master / 1 worker, which can die and restart
 */
if (cluster.isMaster) {
    let threadCount = 1;

    for (let i = 0; i < threadCount; i++) { cluster.fork() }

    cluster.on('exit',  (worker) => {
        console.log('Worker %d died, restarting', worker.id);
        cluster.fork();
    });

} else {
    let app = express();
    require('simple-logger-api-monitor')(app);
    corsAndBodyParser(app);
    app.use(corsOptions);
    global.present = {};

    app.get('/presence/:id/:page/:x/:y', (req, res) => {
        let { id, page, x, y } = req.params;
        let { clicking, message } = req.query;

        if (sizeOf(id) > 20 || sizeOf(page) > 20 || sizeOf(clicking) > 1 || sizeOf(message) > 128 || sizeOf(x) > 100 || sizeOf(y) > 100) return res.send('no');

        if (!present[page]) present[page] = {};
        if (!present[page][id]) present[page][id] = {};

        x = parseFloat(x);
        y = parseFloat(y);

        present[page][id] = { ts: +new Date(), c: parseInt(clicking), m: message, x: x, y: y };

        res.send('ok');
    });

    app.get('/visitors/:page', (req, res) => {
        let { page } = req.params;

        if (present[page]) {
            let oneMinuteAgo = +new Date() - (5 * 1000);

            for (var k in present[page]) {
                if (present[page][k] && present[page][k].ts < oneMinuteAgo)
                    delete present[page][k];
            }
        }

        let result = JSON.parse(JSON.stringify(present[page] || {}));

        for (var k in result) {
            delete result[k].ts;
        }

        res.json(result);
    });

    app.use(express.static('public'));
    app.listen(port, function () { console.log('App listening on port', port) });
}

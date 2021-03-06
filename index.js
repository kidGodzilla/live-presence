const { corsAndBodyParser, corsOptions, isBuffer } = require('mr365-utils');
const port = process.env.PORT || 5000;
const cluster = require('cluster');
const express = require('express');

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
        let { c, m } = req.query;

        // console.log(page, id, x, y, c, m);

        if (sizeOf(id) > 20 || sizeOf(page) > 20 || sizeOf(c) > 1 || sizeOf(m) > 200 || sizeOf(x) > 100 || sizeOf(y) > 100) return res.send('no');

        if (!present[page]) present[page] = {};
        if (!present[page][id]) present[page][id] = {};

        present[page][id] = { ts: +new Date(), c: parseInt(c), m: m, x: parseFloat(x), y: parseFloat(y) };

        res.send('ok');
    });

    app.get('/visitors/:page', (req, res) => {
        let { page } = req.params;

        if (present[page]) {
            let oneMinuteAgo = +new Date() - (9 * 1000);

            for (const k in present[page]) {
                if (present[page][k] && present[page][k].ts < oneMinuteAgo)
                    delete present[page][k];
            }
        }

        let result = JSON.parse(JSON.stringify(present[page] || {}));

        for (const k in result) {
            delete result[k].ts;
        }

        res.json(result);
    });

    app.get('/dump', (req, res) => {
        res.json(present);
    });

    app.use(express.static('public'));
    app.listen(port, function () { console.log('App listening on port', port) });
}

import http from 'http';
import { buildWithMandates } from './build.js';
import serveFile from './serve-logic/serve-file.js';
import supervise from './serve-logic/supervisor.js';
import PartyMandates from '../config/party-mandates.js';

const DEFAULT_PORT = 3000;

export default function serve({port}) {
    port = port || DEFAULT_PORT;
    PartyMandates.mandates
        .then(mandates => {
            preBuild(mandates);

            const server = http.createServer((req, res) => {
                serveFile(req, res, mandates);
            });
            server.listen(port);
            console.log(`Server is running on http://localhost:${port}`);

            supervise(mandates);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function preBuild(mandates) {
    console.log('Building...');
    buildWithMandates(mandates);
    console.log('Done.\n');
}

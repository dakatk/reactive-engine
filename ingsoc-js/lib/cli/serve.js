import http from 'http';
import serveFile from './serve-logic/serve-file.js';
import PartyMandates from '../config/party-mandates.js';

const DEFAULT_PORT = 3000;

export default function serve({port}) {
    PartyMandates.mandates
        .then(mandates => {
            const server = http.createServer((req, res) => {
                serveFile(req, res, mandates);
            });
            server.listen(port || DEFAULT_PORT);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

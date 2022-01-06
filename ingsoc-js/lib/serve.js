import http from 'http';
import { Server } from 'node-static';
import PartyMandates from './config/party-mandates.js';

const DEFAULT_PORT = 3000;

export default function serve({port}) {
    PartyMandates.mandates
        .then(mandates => {
            const file = new Server(mandates.outputDirectory);
            const server = http.createServer((req, res) => {
                file.serve(req, res);
            });
            server.listen(port || DEFAULT_PORT);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        })
}
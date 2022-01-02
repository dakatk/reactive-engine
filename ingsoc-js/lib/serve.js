import http from 'http';
import path from 'path';
import { Server } from 'node-static';

const DEFAULT_PORT = 3000;

export default function serve({port}) {
    const file = new Server(path.resolve(process.cwd(), 'public'));
    const server = http.createServer((req, res) => {
        file.serve(req, res);
    });

    console.log(port);
    server.listen(port || DEFAULT_PORT);
}

export default serve;
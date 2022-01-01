import http from 'http';
import path from 'path';
import { Server } from 'node-static';

const file = new Server(path.resolve(process.cwd(), 'public'));
const server = http.createServer((req, res) => {
    file.serve(req, res);
});

server.listen(process.env.PORT || 3000);
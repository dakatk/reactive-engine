import http from 'http';
import { Server } from 'node-static';

const file = new Server(__dirname + '/public');

const server = http.createServer((req, res) => {
    file.serve(req, res);
});

server.listen(process.env.PORT || 3000);
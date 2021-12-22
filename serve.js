import http from 'http';
import { Server } from 'node-static';

const file = new Server(__dirname + '/public');

const server = http.createServer((req, res) => {
    file.serve(req, res);
    // console.log(req);
    // console.log('===========');
    // res.writeHead(200, { 'Content-Type': 'text/html' });
    // fs.createReadStream('public/index.html').pipe(res);
});

server.listen(process.env.PORT || 3000);
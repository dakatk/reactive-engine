import fs from 'fs';
import http from 'http';
import path from 'path';
import PartyMandates from './config/party-mandates.js';

const DEFAULT_PORT = 3000;
const CONTENT_TYPE = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon'
};

export default function serve({port}) {
    PartyMandates.mandates
        .then(mandates => {
            const outputDirectory = mandates.outputDirectory;
            const server = http.createServer((req, res) => {
                serveFile(req, res, outputDirectory);
            });
            server.listen(port || DEFAULT_PORT);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function serveFile({url}, res, outputDirectory) {
    if (url === '/') {
        url = 'index.html';
    }
    if (url.charAt(0) === '/') {
        url = url.substring(1);
    }
    const extName = path.extname(url);
    const contentType = CONTENT_TYPE[extName];
    if (!contentType) {
        handleError(res, 403, extName);
    }
    fs.readFile(path.resolve(outputDirectory, url), (err, content) => {
        if (err) {
            const code = err.code === 'ENOENT' ? 404 : 500;
            const details = err.message;
            handleError(res, code, url, details);
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
}

const ERROR_MESSAGE = {
    403: 'File extension not allowed:',
    404: 'File not found:',
    500: 'Error loading file:'
};

function handleError(res, code, cause, details) {
    const message = `${ERROR_MESSAGE[code]} "${cause}`;
    
    res.writeHead(code);
    res.end({ message, details }, 'utf-8');
    res.end();

    throw new Error(message);
}
import handleError from './handle-error.js';
import path from 'path';
import fs from 'fs';

const CONTENT_TYPE = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon'
};

export default function serveFile({url}, res, directory) {
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
    fs.readFile(path.resolve(directory, url), (err, content) => {
        if (err) {
            const code = err.code === 'ENOENT' ? 404 : 500;
            const details = err.message;
            handleError(res, code, url, details);
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
}
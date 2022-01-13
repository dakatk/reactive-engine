import handleError from './handle-error.js';
import mimetypes from './mimetypes.js';
import path from 'path';
import fs from 'fs';

const PUBLIC_FILES = ['index.html', 'bundle.js', 'style.css'];

export default function serveFile({url}, res, {outputDirectory, staticDirectory}) {
    const file = toFileName(url);
    const directory = PUBLIC_FILES.includes(file) ?
        outputDirectory :
        staticDirectory;

    const extName = path.extname(file);
    const contentType = mimetypes[extName];
    if (!contentType) {
        handleError(res, 403, extName);
    }
    fs.readFile(path.resolve(directory, file), (err, content) => {
        if (err) {
            const code = err.code === 'ENOENT' ? 404 : 500;
            const details = err.message;
            handleError(res, code, url, details);
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
}

function toFileName(url) {
    if (url === '/') {
        return 'index.html';
    }
    if (url.charAt(0) === '/') {
        url = url.substring(1);
    }
    return url;
}
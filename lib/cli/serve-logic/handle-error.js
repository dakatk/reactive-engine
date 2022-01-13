const ERROR_MESSAGE = {
    403: 'File extension not allowed:',
    404: 'File not found:',
    500: 'Error loading file:'
};

export default function handleError(res, code, cause, details) {
    const message = `${ERROR_MESSAGE[code]} "${cause}"`;

    res.writeHead(code);
    res.end({ message, details }, 'utf-8');
    res.end();

    throw new Error(message);
}
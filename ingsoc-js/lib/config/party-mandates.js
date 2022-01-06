import path from 'path';
import fs from 'fs';

const MANDATES_FILE = 'mandates.js';
const OPTIONS = {
    rootDirectory: {
        type: 'string',
        subtype: 'a directory',
        validate: isDirectory
    },
    devMode: {
        default: true,
        type: 'boolean',
        subtype: 'a boolean',
        validate: isBooleanValue
    },
    entryModuleName: {
        default: 'IndexModule',
        type: 'string',
        subtype: 'an esm export',
        validate: isVarName
    },
    entryModulePath: {
        default: 'index.js',
        type: 'string',
        subtype: 'a javascript source file',
        addRoot: true,
        validate: (fileName, root) => isFileWithExtension(fileName, root, ['.js', '.mjs'])
    },
    entryTemplatePath: {
        default: 'index.html',
        type: 'string',
        subtype: 'an html file',
        addRoot: true,
        validate: (fileName, root) => isFileWithExtension(fileName, root, ['.html'])
    },
    entryStylePath: {
        default: 'index.css',
        type: 'string',
        subtype: 'a css file',
        addRoot: true,
        validate: (fileName, root) => isFileWithExtension(fileName, root, ['.css'])
    },
    appDirectory: {
        default: 'app',
        type: 'string',
        subtype: 'a non-root directory',
        addRoot: true,
        validate: isDirectory
    },
    outputDirectory: {
        default: 'public',
        type: 'string',
        subtype: 'a non-root directory',
        addRoot: true,
        validate: isDirectory
    },
};

const VAR_NAME_REG = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
const RESERVED_KEYWORDS = [
    'do','if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else',
    'enum', 'eval', 'null', 'this', 'true', 'void', 'with', 'await', 'break',
    'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield',
    'async', 'await', 'delete', 'export', 'import', 'public', 'return', 'static',
    'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
    'continue', 'debugger', 'function', 'arguments', 'interface', 'protected',
    'implements', 'instanceof'
];

function isBooleanValue(value) {
    return value === true || value === false;
}

function isVarName(varName) {
    if (varName.match(VAR_NAME_REG) !== null) {
        return !RESERVED_KEYWORDS.includes(varName);
    }
}

function isFileWithExtension(fileName, root, exts) {
    const extName = path.extname(fileName);
    if (!extName || !exts.includes(extName)) {
        return false;
    }
    const fullFile = path.resolve(root, fileName);
    return fs.existsSync(fullFile);
}

function isDirectory(dirName, root) {
    if (root !== undefined) {
        if (dirName.trim() === '') {
            return false;
        }
        dirName = path.resolve(root, dirName);
    }
    return fs.existsSync(dirName);
}

async function partyMandates() {
    const mandatesPath = path.resolve(process.cwd(), MANDATES_FILE);
    const { default: mandates } = await import(mandatesPath);

    if (!mandates) {
        throw new Error(`Mandates file ("${MANDATES_FILE}") missing from project root directory`);
    }
    return sanitize(mandates);
}

function sanitize(mandates) {
    validateTypes(mandates);
    for (const [key, value] of Object.entries(OPTIONS)) {
        const required = !('default' in value);
        const absent = !(key in mandates);

        if (required && absent) {
            throw new Error(`Missing required mandate: "${key}"`);
        }
        else if (absent) {
            mandates[key] = value.default;
        }
        if (value.addRoot) {
            const normalizedRoot = path.normalize(mandates.rootDirectory);
            mandates[key] = path.resolve(normalizedRoot, mandates[key]);
        }
    }
    return mandates;
}

function validateTypes(mandates) {
    for (const [key, value] of Object.entries(mandates)) {
        if (!(key in OPTIONS)) {
            continue;
        }
        const mandate = OPTIONS[key];
        const root = key === 'rootDirectory' ? undefined : mandates.rootDirectory;

        if (typeof(value) !== mandate.type) {
            throw new Error(`Incorrect type for mandate "${key}": expected ${mandate.type}, got ${typeof(value)}`);
        }
        else if (mandate.validate && !mandate.validate(value, root)) {
            throw new Error(`Mandate "${key}" couldn't be validated as ${mandate.subtype}`);
        }
    }

    if (mandates.outputDirectory === mandates.appDirectory) {
        throw new Error('"outputDirectory" cannot have the same value as "appDirectory"');
    }
}

const PartyMandates = {
    get mandates () {
        return partyMandates();
    }
}

export default PartyMandates;
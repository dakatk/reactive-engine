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
        validate: isJsFile
    },
    entryTemplatePath: {
        default: 'index.html',
        type: 'string',
        subtype: 'an html file',
        addRoot: true,
        validate: isHtmlFile
    },
    entryStylePath: {
        default: 'index.css',
        type: 'string',
        subtype: 'a css file',
        addRoot: true,
        validate: isCssFile
    },
    appDirectory: {
        default: 'app',
        type: 'string',
        subtype: 'a directory',
        addRoot: true,
        validate: isDirectory
    },
    outputDirectory: {
        default: 'public',
        type: 'string',
        subtype: 'a directory',
        addRoot: true,
        validate: isDirectory
    },
};
// FIXME check for key words
const VAR_NAME_REG = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

function isBooleanValue(value) {
    return value === true || value === false;
}

function isVarName(varName) {
    return varName.match(VAR_NAME_REG) !== null;
}

function isJsFile(fileName, root) {
    if (!fileName.endsWith('.js') && !fileName.endsWith('.jsm')) {
        return false;
    }
    const fullFile = path.resolve(root, fileName);
    return fs.existsSync(fullFile);
}

function isHtmlFile(fileName, root) {
    if (!fileName.endsWith('.html')) {
        return false;
    } 
    const fullFile = path.resolve(root, fileName);
    return fs.existsSync(fullFile);
}

function isCssFile(fileName, root) {
    if (!fileName.endsWith('.css')) {
        return false;
    } 
    const fullFile = path.resolve(root, fileName);
    return fs.existsSync(fullFile);
}

function isDirectory(dirName, root) {
    const fullPath = root === undefined ? dirName : path.resolve(root, dirName);
    return fs.existsSync(fullPath);
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
            mandates[key] = path.resolve(mandates.rootDirectory, mandates[key]);
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
}

const PartyMandates = {
    get mandates () {
        return partyMandates();
    }
}

export default PartyMandates;
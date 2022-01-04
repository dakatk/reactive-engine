import path from 'path';

const MANDATES_FILE = 'mandates.js';
const OPTIONS = {
    defaults: {
        devMode: false,
        entryModuleName: 'IndexModule'
    },
    required: [
        'entryModulePath',
        'entryTemplatePath',
        'entryStylePath',
        'appDirectory',
        'outputDirectory'
    ]
};
const TYPE_VALIDATION = {
    devMode: {
        type: 'boolean',
        subtype: 'a boolean',
        callback: isBooleanObject
    },
    entryModuleName: {
        type: 'string',
        subtype: 'an esm export',
        callback: isVarName
    },
    entryModulePath: {
        type: 'string',
        subtype: 'a js file path',
        callback: isJsFilePath
    },
    entryTemplatePath: {
        type: 'string',
        subtype: 'a html file path',
        callback: isHtmlFilePath
    },
    entryStylePath: {
        type: 'string',
        subtype: 'a css file path',
        callback: isCssFilePath
    },
    appDirectory: {
        type: 'string',
        subtype: 'a directory',
        callback: isDirectory
    },
    outputDirectory: {
        type: 'string',
        subtype: 'a directory',
        callback: isDirectory
    },
};

function isBooleanObject(obj) {

}

function isVarName(name) {
    // TODO
    return true;
}

function isJsFilePath(path) {
    // TODO
    return true;
}

function isHtmlFilePath(path) {
    // TODO
    return true;
}

function isCssFilePath(path) {
    // TODO
    return true;
}

function isDirectory(path) {
    // TODO
    return true;
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
    for (const required of OPTIONS.required) {
        if (!(required in mandates)) {
            throw new Error(`Missing required mandate: ${required}`);
        }
    }
    //validateTypes(mandates);
    
    const defaultMandates = OPTIONS.defaults;
    return {
        ...defaultMandates,
        ...mandates
    };
}

function validateTypes(mandates) {
    for (const [key, value] in Object.entries(mandates)) {
        if (!(key in TYPE_VALIDATION)) {
            continue;
        }
        const validation = TYPE_VALIDATION[key];
        if (typeof(value) !== validation.type) {
            throw new Error(`Incorrect type for mandate "${key}": expected ${validation.type}, got ${typeof(value)}`);
        }
        else if (validation.callback && validation.callback(value)) {
            throw new Error(`Mandate "${key} couldn't be validated as ${validation.subtype}`);
        }
    }
}

const PartyMandates = {
    get mandates () {
        return partyMandates();
    }
}

export default PartyMandates;
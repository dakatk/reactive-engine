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
        'appDirectory',
        'outputDirectory'
    ]
};

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
    const defaultMandates = OPTIONS.defaults;
    return {
        ...defaultMandates,
        ...mandates
    };
}

const PartyMandates = {
    get mandates () {
        return partyMandates();
    }
}

export default PartyMandates;
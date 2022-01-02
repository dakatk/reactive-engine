import path from 'path';
import options from './mandates-options.json';

const MANDATES_FILE = 'mandates.js';

async function partyMandates() {
    const mandatesPath = path.resolve(process.cwd(), MANDATES_FILE);
    const { default: mandates } = await import(mandatesPath);

    if (!mandates) {
        throw new Error(`Mandates file ("${MANDATES_FILE}") missing from project root directory`);
    }
    return sanitize(mandates);
}

function sanitize(mandates) {
    for (const required of options.required) {
        if (!(required in mandates)) {
            throw new Error(`Missing required mandate: ${required}`);
        }
    }
    const defaultMandates = options.defaults;
    return {
        ...defaultMandates,
        ...mandates
    };
}

const PartyMandates = {
    async get mandates () {
        return await partyMandates();
    }
}

export default PartyMandates;
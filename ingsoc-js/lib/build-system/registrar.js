import cheerio from "cheerio";
import fs from 'fs';

const registry = {};

function registerPartyMember(partyMember) {
    const templateFile = partyMember.template;
    partyMember.template = loadTemplateFromFile(templateFile);
    
    const id = partyMember.id;
    registry[id] = partyMember;
}

function loadTemplateFromFile(file) {
    const contents = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
    if (!contents) {
        throw new Error(`Couldn't read file ${file}`);
    }
    return cheerio.load(contents, null, false);
}

const Registrar = {
    registerPartyMember,
    get registry() {
        return registry;
    }
}

export default Registrar;
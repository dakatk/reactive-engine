import cloneDeep from "clone-deep";
import cheerio from "cheerio";
import fs from 'fs';

function PartyMember (id, watchers, listeners, templateFile, debug) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.template = loadTemplate(templateFile);
    this.debug = !!debug;

    function loadTemplate(file) {
        const contents = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
        if (!contents) {
            console.error(`Couldn't read file ${file}`);
            return undefined;
        }
        return cheerio.load(contents, null, false);
    }
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return new PartyMember(this.id, clonedWatchers, this.listeners, this.template, this.debug);
}

export default PartyMember;

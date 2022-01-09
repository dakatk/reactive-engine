import cheerio from 'cheerio';
import format from 'html-format';
import fs from 'fs';

const MAX_UUID = Number.MAX_SAFE_INTEGER - 1;
const MAX_DEPTH = 1000;
const HEADER = '<meta charset="UTF-8">\n\
                <link rel="stylesheet" href="style.css">\n\
                <script src="bundle.js" defer></script>';

export default class ExpandTemplate {
    constructor(file, registry, debug) {
        this.file = file;
        this.partyMembersByUUID = {};
        this.registry = registry;
        this.debug = debug;
        this.uuid = 0;
    }

    async expandToHTML() {
        return new Promise(resolve => {
            fs.readFile(this.file, {encoding: 'utf8', flag: 'r'}, (err, template) => {
                if (err) {
                    throw new Error(err);
                }
                const html = this.loadTemplate(template);
                const partyMembersByUUID = this.partyMembersByUUID;

                resolve({html, partyMembersByUUID});
            })
        });
    }

    loadTemplate(template) {
        this.$ = cheerio.load(template);
        const body = this.$('body')[0];
        const head = this.$('head');

        head.append(HEADER);
        this.loadRecursiveNodesWithParent(body);

        return format(this.$.html(), ' '.repeat(4));
    }

    loadRecursiveNodesWithParent(parentNode, depth=0, parentUUID) {
        if (!this.$ || depth >= MAX_DEPTH) { 
            return; 
        }
        const children = parentNode.children.filter(el => el.type === 'tag');
        for (const child of children) {
            const id = child.name;
            if (this.isExistingParent(id, parentUUID)) {
                if (this.debug) {
                    console.error(
                        `Warning: "${parentNode.name}" creates infinite recursion in "${id}"`
                    );
                }
                continue;
            }
            const childEl = this.$(child);
            const UUID = this.nextUUID();
            childEl.attr('uuid', UUID);
    
            if (!(child.name in this.registry)) {
                if (parentUUID !== undefined) {
                    this.partyMembersByUUID[parentUUID].nodes.push(UUID);
                }
                continue;
            }
            const template = this.registry[id];
            const debug = this.debug;
            childEl.html(template.html());

            this.partyMembersByUUID[UUID] = { 
                id,
                parentUUID,
                debug,
                nodes: []
            };
            this.loadRecursiveNodesWithParent(child, depth + 1, UUID);
        }
    }

    isExistingParent(id, parentUUID) {
        if (parentUUID === undefined) {
            return false;
        }
        const firstParent = this.partyMembersByUUID[parentUUID];
        for (let parent = firstParent; parentUUID !== undefined; parent = this.partyMembersByUUID[parentUUID]) {
            if (id === parent.id) {
                return true;
            }
            parentUUID = parent.parentUUID;
        }
        return false;
    }

    nextUUID() {
        this.uuid ++;
        if (this.uuid > MAX_UUID) {
            throw new Error('UUID limit reached');
        }
        return this.uuid;
    }
}

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

    loadRecursiveNodesWithParent(parentNode, depth=0, stack=[], parentUUID) {
        if (!this.$ || depth >= MAX_DEPTH) { 
            return; 
        }
        const children = parentNode.children.filter(el => el.type === 'tag');
        for (const child of children) {
            const id = child.name;
            if (stack.includes(id)) {
                console.error(`Infinite recursion found at ${id}, aborting generation for ${parentNode.name}`);
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
            childEl.html(template.html());

            this.partyMembersByUUID[UUID] = { 
                id,
                debug: this.debug,
                nodes: []
            };
            // TODO Passing a new stack like this could get very expensive very fast...
            this.loadRecursiveNodesWithParent(child, depth + 1, stack.concat([id]), UUID);
        }
    }

    nextUUID() {
        this.uuid ++;
        if (this.uuid > MAX_UUID) {
            throw new Error('UUID limit reached');
        }
        return this.uuid;
    }
}

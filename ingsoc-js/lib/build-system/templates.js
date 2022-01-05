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
            const childEl = this.$(child);
            const UUID = this.nextUUID();
    
            childEl.attr('uuid', UUID);
    
            if (!(child.name in this.registry)) {
                if (parentUUID !== undefined) {
                    this.partyMembersByUUID[parentUUID].nodes.push(UUID);
                }
                continue;
            }
            const id = child.name;
            const template = this.registry[id];
    
            childEl.html(template.html());
            this.partyMembersByUUID[UUID] = { id, debug: this.debug, nodes: [] };
    
            this.loadRecursiveNodesWithParent(child, depth + 1, stack, UUID);
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

// const partyMembersByUUID = {};
// var $, UUID = 0;

// export default function generateHtmlFromTemplate(template, registry, debug) {
//     $ = cheerio.load(template);
//     const body = $('body')[0];
//     const head = $('head');

//     head.append(HEADER);
//     loadRecursiveNodesWithParent(body, registry, debug);

//     const outputHtml = format($.html(), ' '.repeat(4));
//     return [outputHtml, partyMembersByUUID];
// }

// // TODO solve infinite recursion (stack?)
// function loadRecursiveNodesWithParent(parentNode, registry, debug, depth=0, parentUUID) {
//     if (!$ || depth >= MAX_DEPTH) { 
//         return; 
//     }
//     const children = parentNode.children.filter(el => el.type === 'tag');
//     for (const child of children) {
//         const childEl = $(child);
//         const UUID = nextUUID();

//         childEl.attr('uuid', UUID);

//         if (!(child.name in registry)) {
//             if (parentUUID !== undefined) {
//                 partyMembersByUUID[parentUUID].nodes.push(UUID);
//             }
//             continue;
//         }
//         const id = child.name;
//         const template = registry[id];

//         childEl.html(template.html());
//         partyMembersByUUID[UUID] = { id, debug, nodes: [] };

//         loadRecursiveNodesWithParent(child, registry, debug, depth + 1, UUID);
//     }
// }

// function nextUUID() {
//     UUID ++;
//     if (UUID > MAX_UUID) {
//         throw new Error('UUID limit reached');
//     }
//     return UUID;
// }
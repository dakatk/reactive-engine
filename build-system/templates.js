import Registrar from './registrar';
import cheerio from 'cheerio';

const componentsByUUID = {};

let $;
export default function generateHtmlFromTemplate (template, debug) {
    $ = cheerio.load(template);
    loadRecursiveNodesWithParent($('body')[0], debug);
    return $.html();
}

function loadRecursiveNodesWithParent(parentNode, debug) {
    if (!$) { return; }

    const children = parentNode.children.filter(el => el.type === 'tag');
    const registry = Registrar.registry;

    for (const child of children) {
        if (!(child.name in registry)) {
            continue;
        }
        const component = registry[child.name];
        const template = component.template;
        const childEl = $(child);
        const UUID = nextUUID();

        componentsByUUID[UUID] = component.id;

        childEl.html(template.html());
        childEl.attr('uuid', UUID);

        loadRecursiveNodesWithParent(child, child.debug);
    }
}

let UUID = 0;
const maxUUID = 10000;

function nextUUID() {
    UUID ++;
    if (UUID > maxUUID) {
        throw new Error('UUID limit reached');
    }
    return UUID;
}
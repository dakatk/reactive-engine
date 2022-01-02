import Registrar from './registrar';
import cheerio from 'cheerio';

const MAX_UUID = Number.MAX_SAFE_INTEGER - 1;
const MAX_DEPTH = 1000;

const componentsByUUID = {};
let $, UUID = 0;

export default function generateHtmlFromTemplate(template, debug) {
    $ = cheerio.load(template);
    const body = $('body')[0];
    const head = $('head');

    head.append('<script src="bundle.js" defer></script>');
    loadRecursiveNodesWithParent(body, debug);

    return [$.html(), componentsByUUID];
}


function loadRecursiveNodesWithParent(parentNode, debug, depth=0, parentUUID) {
    if (!$ || depth >= MAX_DEPTH) { 
        return; 
    }
    const children = parentNode.children.filter(el => el.type === 'tag');
    const registry = Registrar.registry;

    for (const child of children) {
        const childEl = $(child);
        const UUID = nextUUID();

        childEl.attr('uuid', UUID);

        if (!(child.name in registry)) {
            if (parentUUID !== undefined) {
                componentsByUUID[parentUUID].nodes.push(UUID);
            }
            continue;
        }
        const component = registry[child.name];
        const template = component.template;

        const id = component.id;
        componentsByUUID[UUID] = { id, debug, nodes: [] };

        childEl.html(template.html());

        loadRecursiveNodesWithParent(child, debug, depth + 1, UUID);
    }
}

function nextUUID() {
    UUID ++;
    if (UUID > MAX_UUID) {
        throw new Error('UUID limit reached');
    }
    return UUID;
}
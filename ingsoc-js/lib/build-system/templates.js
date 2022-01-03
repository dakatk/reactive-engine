import cheerio from 'cheerio';

const MAX_UUID = Number.MAX_SAFE_INTEGER - 1;
const MAX_DEPTH = 1000;

const componentsByUUID = {};
let $, UUID = 0;

export default function generateHtmlFromTemplate(template, registry, debug) {
    $ = cheerio.load(template);
    const body = $('body')[0];
    const head = $('head');

    head.append('<script src="bundle.js" defer></script>');
    loadRecursiveNodesWithParent(body, registry, debug);

    return [$.html(), componentsByUUID];
}

function loadRecursiveNodesWithParent(parentNode, registry, debug, depth=0, parentUUID) {
    if (!$ || depth >= MAX_DEPTH) { 
        return; 
    }
    const children = parentNode.children.filter(el => el.type === 'tag');

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
        const id = child.name;
        const template = registry[id];

        childEl.html(template.html());
        componentsByUUID[UUID] = { id, debug, nodes: [] };

        loadRecursiveNodesWithParent(child, registry, debug, depth + 1, UUID);
    }
}

function nextUUID() {
    UUID ++;
    if (UUID > MAX_UUID) {
        throw new Error('UUID limit reached');
    }
    return UUID;
}
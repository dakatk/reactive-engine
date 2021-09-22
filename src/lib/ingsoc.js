import Watcher from "./watcher";

const registry = {};
const templatesById = {};
const watchersByName = {
    children: {}
};

function registerPartyMember(partyMember) {
    const id = partyMember.id;
    registry[id] = partyMember;
    templatesById[id] = document.getElementById(id);
}

function isWatching(debug) {
    loadRecursiveNodesWithParent(document, watchersByName, !debug);

    if (!debug) {
        for (const id in templatesById) {
            const template = templatesById[id];
            template.parentNode.removeChild(template);
        }
    }
}

// TODO transpilation step?
function loadRecursiveNodesWithParent(parentNode, parentObj, cleanDOM) {
    for (const id in registry) {
        const childNodes = parentNode.getElementsByTagName(id);
        const partyMember = registry[id];
        const template = templatesById[id];

        for (const node of childNodes) {
            if (node.childElementCount > 0) {
                continue;
            }

            const watcherName = node.attributes['watcher-name'];
            const watcher = new Watcher(partyMember, parentObj);
            const clonedTemplate = template.content.cloneNode(true);
            
            node.appendChild(clonedTemplate);
            watcher.setup(node);

            if (watcherName !== undefined) {
                parentObj.children[watcherName.value] = watcher.personnelDetails();
            }
            if (cleanDOM) {
                node.removeAttribute('watcher-name');
            }
            loadRecursiveNodesWithParent(node, watcher.personnelDetails(), watcher.cleanDOM);
        }
    }
}

const BigBrother = {
    registerPartyMember,
    isWatching,
    get partyMembers() {
        return watchersByName.children;
    }
}

export default BigBrother;
import Watcher from "./watcher";

const registry = {};

function registerPartyMember(partyMember) {
    registry[partyMember.id] = partyMember;
}

function isWatching() {
    for (const id in registry) {
        const template = document.getElementById(id);
        const componentNodes = document.getElementsByTagName(id);
        const partyMember = registry[id];

        for (const node of componentNodes) {
            const watcher = new Watcher(partyMember);
            const clonedTemplate = template.content.cloneNode(true);
            
            node.appendChild(clonedTemplate);
            watcher.setup(node);
        }
    }
}

const BigBrother = {
    registerPartyMember,
    isWatching
}

export default BigBrother;
import cloneDeep from "clone-deep";

// TODO 'watchers' and 'listeners' should be optional 
function PartyMember (id, watchers, listeners, templateFile) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.template = templateFile;
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return { 
        watchers: clonedWatchers, 
        listeners: this.listeners
    };
}

export default PartyMember;

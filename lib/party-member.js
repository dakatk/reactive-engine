import cloneDeep from "clone-deep";

function PartyMember (id, watchers, listeners, templateFile) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.template = templateFile;
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return new PartyMember(this.id, clonedWatchers, this.listeners, this.template);
}

export default PartyMember;

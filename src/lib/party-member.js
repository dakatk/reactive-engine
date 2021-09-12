import cloneDeep from "clone-deep";

function PartyMember (id, watchers, listeners, cleanDOM) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.cleanDOM = cleanDOM;
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return new PartyMember(this.id, clonedWatchers, this.listeners, this.cleanDOM);
}

export default PartyMember;

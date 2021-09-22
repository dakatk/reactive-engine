import cloneDeep from "clone-deep";

function PartyMember (id, watchers, listeners, debug) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.debug = debug ?? false;
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return new PartyMember(this.id, clonedWatchers, this.listeners, this.debug);
}

export default PartyMember;

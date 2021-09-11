function PartyMember (id, watchers, listeners, cleanDOM) {
    this.id = id;
    this.watchers = watchers;
    this.listeners = listeners;
    this.cleanDOM = cleanDOM;
}

PartyMember.prototype.clone = function () {
    let clonedWatchers = deepCopy(this.watchers);
    let clonedListeners = {...this.listeners};
    
    return new PartyMember(this.id, clonedWatchers, clonedListeners, this.cleanDOM);
}

function deepCopy(obj) {
    let copy = {};
    for (const key in obj) {
        let child = obj[key];
        if (child instanceof Object) {
            child = deepCopy(child);
        }
        copy[key] = child;
    }
    return copy;
}

export default PartyMember;

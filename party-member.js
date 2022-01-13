import cloneDeep from 'clone-deep';

// TODO Lifetime functions?
export default function PartyMember(id, watchers, listeners) {
    this.id = id;
    this.watchers = watchers || {};
    this.listeners = listeners || {};
}

PartyMember.prototype.clone = function () {
    const clonedWatchers = cloneDeep(this.watchers);
    return { 
        watchers: clonedWatchers, 
        listeners: this.listeners
    };
}

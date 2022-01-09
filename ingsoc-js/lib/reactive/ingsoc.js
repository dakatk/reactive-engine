import ThoughtPolice from './thinkpol.js';

function bigBrotherIsWatching(module, partyMembers) {
    if (!Array.isArray(module)) {
        throw new Error("Entry Module doesn't export array of Party Members");
    }
    for (const [uuid, data] of Object.entries(partyMembers)) {
        const node = document.querySelector(`${data.id}[uuid="${uuid}"]`);
        const partyMember = module.filter(value => value.id === data.id)[0];
        const thinkpol = new ThoughtPolice(partyMember, !data.debug);

        thinkpol.setup(node, data.nodes);
        data.inst = thinkpol;
    }

    for (const partyMember of Object.values(partyMembers)) {
        const parentUUID = partyMember.parentUUID;
        if (!parentUUID) {
            continue;
        }
        const parent = partyMembers[parentUUID];
        partyMember.inst.parent = parent.inst;
    }
}

bigBrotherIsWatching(partyMemberTypes, partyMembersByUUID);
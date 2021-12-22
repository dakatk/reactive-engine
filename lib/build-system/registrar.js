const registry = {};

function registerPartyMember(partyMember) {
    const id = partyMember.id;
    registry[id] = partyMember;
}

const Registrar = {
    registerPartyMember,
    get registry() {
        return registry;
    }
}

export default Registrar;
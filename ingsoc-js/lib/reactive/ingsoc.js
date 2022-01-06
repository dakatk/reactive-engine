import Observer from './observer';

function bigBrotherIsWatching(module, components) {
    if (!Array.isArray(module)) {
        throw new Error("Entry Module doesn't export array of components");
    }
    for (const [uuid, component] of Object.entries(components)) {
        const componentNode = document.querySelector(`${component.id}[uuid="${uuid}"]`);
        const partyMember = module.filter(value => value.id === component.id)[0];
        const observer = new Observer(partyMember, !component.debug);

        observer.setup(componentNode, component.nodes);
    }
}

bigBrotherIsWatching(partyMemberTypes, partyMembersByUUID);
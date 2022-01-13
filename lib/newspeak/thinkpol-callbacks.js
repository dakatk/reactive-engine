const callbacks = {
    interpolateForNode: function(thinkpol, observable, observedProperty, node) {
        const parent = node.parentNode;
        const observedObject = observable[observedProperty];
    
        const keyRegex = /\$\{key\}/g;
        const valueRegex = /\$\{value\}/g;
    
        for (const key in observedObject) {
            const value = observedObject[key];
            const newNode = node.cloneNode(true);
    
            for (const nodeAttr of node.attributes) {
                const nodeName = nodeAttr.nodeName;
                const nodeValue = nodeAttr.nodeValue.replace(keyRegex, key).replace(valueRegex, value);
    
                newNode.attributes[nodeName].nodeValue = nodeValue;
            }
            parent.insertBefore(newNode, node);
    
            if (thinkpol.cleanDOM) {
                newNode.removeAttribute('interpolate-for');
            }
        }
        parent.removeChild(node);
    },
    viewIfNode: function(thinkpol, observable, observedProperty, node, _, watchKey) {
        thinkpol.unperson(observable, observedProperty, node);
        thinkpol.watch(watchKey, () => thinkpol.unperson(observable, observedProperty, node));
    },
    watchNode: function(thinkpol, observable, observedProperty, node, nodeProperty, watchKey) {
        node[nodeProperty] = observable[observedProperty];
        thinkpol.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
    },
    listenToNode: function(thinkpol, observable, observedProperty, node, eventName) {
        node.addEventListener(eventName, event => {
            if (observable.listeners[observedProperty] === undefined) {
                observable.watchers[observedProperty] = event.target.value;
            }
            else {
                // TODO nothing actually, just watch for this particular line to break...
                observable.listeners[observedProperty].call(thinkpol.personnelDetails(), event);
            }
        }, true);
    }
}

export default callbacks;
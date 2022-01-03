const callbacks = {
    interpolateForNode: function(observer, observable, observedProperty, node) {
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
    
            if (observer.cleanDOM) {
                newNode.removeAttribute('interpolate-for');
            }
        }
        parent.removeChild(node);
    },
    viewIfNode: function(observer, observable, observedProperty, node, _, watchKey) {
        observer.remove(observable, observedProperty, node);
        observer.watch(watchKey, () => observer.remove(observable, observedProperty, node));
    },
    watchNode: function(observer, observable, observedProperty, node, nodeProperty, watchKey) {
        node[nodeProperty] = observable[observedProperty];
        observer.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
    },
    listenToNode: function(_, observable, observedProperty, node, eventName) {
        node.addEventListener(eventName, event => {
            if (observable.listeners[observedProperty] === undefined) {
                observable.watchers[observedProperty] = event.target.value;
            }
            else {
                observable.listeners[observedProperty].call(observable, event);
            }
        }, true);
    }
}

export default callbacks;
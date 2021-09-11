
function interpolateForNode (observable, observedProperty, node) {
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

        if (this.cleanDOM) {
            newNode.removeAttribute('interpolate-for');
        }
    }
    parent.removeChild(node);
}

function viewIfNode (observable, observedProperty, node, _, watchKey) {
    this.remove(observable, observedProperty, node);
    this.watch(watchKey, () => this.remove(observable, observedProperty, node));
}

function watchNode (observable, observedProperty, node, nodeProperty, watchKey) {
    node[nodeProperty] = observable[observedProperty];
    this.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
}

function listenToNode (observable, observedProperty, node, eventName) {
    node.addEventListener(eventName, event => {
        if (observable.listeners[observedProperty] === undefined) {
            observable.watchers[observedProperty] = event.target.value;
        }
        else {
            observable.listeners[observedProperty].call(observable, event);
        }
    }, true);
}

export default {
    interpolateForNode,
    viewIfNode,
    watchNode,
    listenToNode
}
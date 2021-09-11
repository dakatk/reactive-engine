import customProps from './customProps.json';
import callbacks from './callbacks';

function Watcher (partyMember) {
    this.id = partyMember.id;
    this.cleanDOM = partyMember.cleanDOM;
    this.data = partyMember.clone();

    this.signals = {};
    this.removed = {};
}

Watcher.prototype.setup = function (el) {
    this.connectWatchers(this.data.watchers);
    this.parseDOM(el, this.data);
}

Watcher.prototype.watch = function (property, signalHandler) {
    if (!this.signals[property]) {
        this.signals[property] = [];
    }
    this.signals[property].push(signalHandler);
}

Watcher.prototype.notify = function (signal) {
    if (!this.signals[signal] || this.signals[signal].length < 1) {
        return;
    }
    this.signals[signal].forEach((signalHandler) => signalHandler.call());
}

Watcher.prototype.remove = function (observable, observedProperty, node) {
    if (!observable[observedProperty]) {
        const parent = node.parentNode;
        const index = Array.from(parent.children).indexOf(node);

        this.removed[node] = {index, parent};
        parent.removeChild(node);
    } 
    else {
        const removedNode = this.removed[node];

        if (removedNode === undefined) {
            return;
        }
        const parent = removedNode.parent;
        const sibling = parent.childNodes[removedNode.index];
        
        parent.insertBefore(node, sibling);
    }
}

Watcher.prototype.connectWatchers = function (obj, prefix) {
    const self = this;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let val = obj[key];
            const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

            if (val instanceof Object && prefix === undefined) {
                this.connectWatchers(val, keyPrefix);
                continue;
            }
            Object.defineProperty(obj, key, {
                get () {
                    return val;
                },
                set (newVal) {
                    val = newVal;
                    self.notify(keyPrefix);
                }
            });
        }
    }
}

Watcher.prototype.observeNodeAttr = function (el, selector, nodeProperty, observable, callback) {
    const nodes = el.querySelectorAll(`[${selector}]`);

    for (const node of nodes) {
        const nodeValue = node.attributes[selector].value;
        const subProperties = nodeValue.split('.');

        if (this.cleanDOM) {
            node.removeAttribute(selector);
        }

        if (subProperties.length === 1) {
            callback.call(this, observable, nodeValue, node, nodeProperty, nodeValue);
            continue;
        }
        let observedProperty = subProperties.shift();
        let observedObject = Object.assign({}, observable);

        for (const subProperty of subProperties) {
            observedObject = observedObject[observedProperty];
            observedProperty = subProperty;
        }
        callback.call(this, observedObject, observedProperty, node, nodeProperty, nodeValue);
    }
}

Watcher.prototype.parseDOM = function (el, data) {
    for (const propName in customProps) {
        const propData = customProps[propName];
        const callback = callbacks[propData.callback];

        const childName = propData.child;
        const childObj = childName !== undefined ? data[childName] : data;

        if (Array.isArray(propData.existingProperty)) {
            for (const existingProp of propData.existingProperty) {
                this.observeNodeAttr(el, propName, existingProp, childObj, callback);
            }
            continue;
        }
        this.observeNodeAttr(el, propName, propData.existingProperty, childObj, callback);
    }
}

export default Watcher;

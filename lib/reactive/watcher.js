import customProps from './custom-props.json';
import callbacks from './watcher-callbacks';
import { modulePath } from '../cli/args';

function Watcher (partyMember, parent) {
    this.id = partyMember.id;
    this.cleanDOM = !partyMember.debug;
    this.data = partyMember.clone();
    this.parent = parent;
    
    this.children = {};
    this.signals = {};
    this.removed = {};
    this.el = undefined;
}

Watcher.prototype.setup = function () {
    if (!this.el) {
        return;
    }
    connectWatchers.call(this, this.data.watchers);
    parseDOM.call(this, this.el, this.personnelDetails());
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

Watcher.prototype.personnelDetails = function () {
    return {
        id: this.id,
        watchers: this.data.watchers,
        listeners: this.data.listeners,
        parent: this.parent,
        children: this.children
    };
}

function connectWatchers (obj, prefix) {
    const self = this;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let val = obj[key];
            const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

            if (val instanceof Object && prefix === undefined) {
                connectWatchers.call(self, val, keyPrefix);
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

function parseDOM (parentEl, data) {
    for (const propName in customProps) {
        const propData = customProps[propName];
        const callback = callbacks[propData.callback];

        const childName = propData.child;
        const childObj = childName !== undefined ? data[childName] : data;

        if (Array.isArray(propData.existingProperty)) {
            for (const existingProp of propData.existingProperty) {
                observeNodeAttr.call(this, parentEl, propName, existingProp, childObj, callback);
            }
            continue;
        }
        observeNodeAttr.call(this, parentEl, propName, propData.existingProperty, childObj, callback);
    }
}

function observeNodeAttr (parentEl, selector, nodeProperty, observable, callback) {
    const nodes = parentEl.querySelectorAll(`[${selector}]`);

    for (const node of nodes) {
        const nodeValue = node.attributes[selector].value;
        const subProperties = nodeValue.split('.');

        if (this.cleanDOM) {
            node.removeAttribute(selector);
        }

        if (subProperties.length === 1) {
            callback(this, observable, nodeValue, node, nodeProperty, nodeValue);
            continue;
        }
        let observedProperty = subProperties.shift();
        let observedObject = Object.assign({}, observable);

        for (const subProperty of subProperties) {
            observedObject = observedObject[observedProperty];
            observedProperty = subProperty;
        }
        callback(this, observedObject, observedProperty, node, nodeProperty, nodeValue);
    }
}

function verifyAndRunModule (module) {
    if (!module || !module.length) {
        throw new Error("Entry module doesn't export array of components");
    }
    // TODO DOM surfing time
}

const argPath = modulePath();
if (!argPath) {
    throw new Error('Module path not specified');
}
const importPath = argPath;
import(importPath)
    .then(module => verifyAndRunModule(module))
    .catch(reason => { throw new Error(reason) });
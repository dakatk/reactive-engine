import customProps from './custom-props.json';
import callbacks from './watcher-callbacks';

function Watcher(partyMember, cleanDOM) {
    this.id = partyMember.id;
    this.cleanDOM = cleanDOM;
    this.data = partyMember.clone();
    
    this.signals = {};
    this.removed = {};
}

Watcher.prototype.setup = function(parentEl, childUUIDs) {
    connectWatchers.call(this, this.data.watchers);
    parseDOM.call(this, parentEl, childUUIDs, this.personnelDetails());
}

Watcher.prototype.watch = function(property, signalHandler) {
    if (!this.signals[property]) {
        this.signals[property] = [];
    }
    this.signals[property].push(signalHandler);
}

Watcher.prototype.notify = function(signal) {
    if (!this.signals[signal] || this.signals[signal].length < 1) {
        return;
    }
    this.signals[signal].forEach((signalHandler) => signalHandler.call());
}

Watcher.prototype.remove = function(observable, observedProperty, node) {
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

Watcher.prototype.personnelDetails = function() {
    return {
        id: this.id,
        watchers: this.data.watchers,
        listeners: this.data.listeners
    };
}

function connectWatchers(obj, prefix) {
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

function parseDOM(parentEl, childUUIDs, data) {
    for (const propName in customProps) {
        const propData = customProps[propName];
        const callback = callbacks[propData.callback];

        const childName = propData.child;
        const childObj = childName !== undefined ? data[childName] : data;

        const childSelector = childUUIDs
            .map(value => `[${propName}][uuid=${value}]`)
            .join(',');

        if (Array.isArray(propData.existingProperty)) {
            for (const existingProp of propData.existingProperty) {
                observeNodeAttr.call(this, parentEl, childSelector, propName, existingProp, childObj, callback);
            }
            continue;
        }
        observeNodeAttr.call(this, parentEl, childSelector, propName, propData.existingProperty, childObj, callback);
    }
}

var ignoreComponentNames = '';

function observeNodeAttr(parentEl, selector, propName, nodeProperty, observable, callback) {
    const nodes = parentEl.querySelectorAll(selector);

    for (const node of nodes) {
        const nodeValue = node.attributes[propName].value;
        const subProperties = nodeValue.split('.');

        if (this.cleanDOM) {
            node.removeAttribute(propName);
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

function verifyAndRunModule(module, components) {
    if (!Array.isArray(module)) {
        throw new Error("Entry Module doesn't export array of components");
    }
    ignoreComponentNames = module
        .map(value => `:not(${value.id})`)
        .join('');

    for (const [uuid, component] of Object.entries(components)) {
        const componentNode = document.querySelector(`${component.id}[uuid="${uuid}"]`);
        const partyMember = module.filter(value => value.id === component.id)[0];
        const watcher = new Watcher(partyMember, true);

        watcher.setup(componentNode, component.nodes);
    }
}

verifyAndRunModule(EntryModule, componentsByUUID);
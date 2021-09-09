import customProps from './custom-props.json';

const callbacks = {
    interpolateForNode: function (observable, observedProperty, node) {
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
    },
    viewIfNode: function (observable, observedProperty, node, _, watchKey) {
        this.remove(observable, observedProperty, node);
        this.watch(watchKey, () => this.remove(observable, observedProperty, node));
    },
    watchNode: function (observable, observedProperty, node, nodeProperty, watchKey) {
        node[nodeProperty] = observable[observedProperty];
        this.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
    },
    listenToNode: function (observable, observedProperty, node, eventName) {
        node.addEventListener(eventName, event => {
            if (observable.listeners[observedProperty] === undefined) {
                observable.watchers[observedProperty] = event.target.value;
            }
            else {
                observable.listeners[observedProperty].call(observable, event);
            }
        }, true);
    }
};

function BigBrother (dataObj, cleanDOM) {
    const parentEl = document.getElementById(dataObj.id);
    this.el = parentEl || document.body;

    this.cleanDOM = cleanDOM;
    this.data = dataObj;

    this.signals = {};
    this.removed = {};
}

BigBrother.prototype.load = function () {
    this.setupWatchers(this.data.watchers);
    this.parseDOM(this.data);
}

BigBrother.prototype.watch = function (property, signalHandler) {
    if (!this.signals[property]) {
        this.signals[property] = [];
    }
    this.signals[property].push(signalHandler);
}

BigBrother.prototype.notify = function (signal) {
    if (!this.signals[signal] || this.signals[signal].length < 1) {
        return;
    }
    this.signals[signal].forEach((signalHandler) => signalHandler.call());
}

BigBrother.prototype.remove = function (observable, observedProperty, node) {
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

BigBrother.prototype.setupWatchers = function (obj, prefix) {
    const self = this;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let val = obj[key];
            const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

            if (val instanceof Object && prefix === undefined) {
                this.setupWatchers(val, keyPrefix);
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

BigBrother.prototype.observeNodeAttr = function (selector, nodeProperty, observable, callback) {
    const nodes = this.el.querySelectorAll(`[${selector}]`);

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

BigBrother.prototype.parseDOM = function (data) {
    for (const propName in customProps) {
        const propData = customProps[propName];
        const callback = callbacks[propData.callback];

        const childName = propData.child;
        const childObj = childName !== undefined ? data[childName] : data;

        if (Array.isArray(propData.existingProperty)) {
            for (const existingProp of propData.existingProperty) {
                this.observeNodeAttr(propName, existingProp, childObj, callback);
            }
            continue;
        }
        this.observeNodeAttr(propName, propData.existingProperty, childObj, callback);
    }
    // for (const propName in props) {
    //     const propData = props[propName];
    //     const callback = callbacks[propData.callback];

    //     const childName = propData.child;
    //     const childObj = childName !== undefined ? data[childName] : data;
        
    //     if (Array.isArray(propData.existingProperty)) {
    //         for (const existingProp of propData.existingProperty) {
    //             this.observeNodeAttr(propName, existingProp, childObj, callback);
    //         }
    //         continue;
    //     }
    //     this.observeNodeAttr(propName, propData.existingProperty, childObj, callback);
    // }
    // this.observeNodeAttr('interpolate-for', null, data.watchers, callbacks.interpolateForNode);
    // this.observeNodeAttr('view-if', null, data.watchers, callbacks.viewIfNode);

    // this.observeNodeAttr('watch-text', 'textContent', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-text', 'innerText', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-value', 'value', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-html', 'innerHTML', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-class', 'className', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-id', 'id', data.watchers, callbacks.watchNode);
    // this.observeNodeAttr('watch-name', 'name', data.watchers, callbacks.watchNode);

    // this.observeNodeAttr('listen-input', 'input', data, callbacks.listenToNode);
    // this.observeNodeAttr('listen-click', 'click', data, callbacks.listenToNode);
    // this.observeNodeAttr('listen-change', 'change', data, callbacks.listenToNode);
}

export default BigBrother;
    // function load () {
    //     watchData(dataObj.watchers);
    //     parseDOM(dataObj);
    // }

    // return {
    //     el: parentEl,
    //     data: dataObj,
    //     load
    // };

    // function watch (property, signalHandler) {
    //     if (!signals[property]) {
    //         signals[property] = [];
    //     }
    //     signals[property].push(signalHandler);
    // }

    // function notify (signal) {
    //     if (!signals[signal] || signals[signal].length < 1) {
    //         return;
    //     }
    //     signals[signal].forEach((signalHandler) => signalHandler.call());
    // }

    // function watchData (obj, prefix) {
    //     for (const key in obj) {
    //         if (obj.hasOwnProperty(key)) {
    //             let val = obj[key];
    //             const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

    //             if (val instanceof Object && prefix === undefined) {
    //                 watchData(val, keyPrefix);
    //                 continue;
    //             }
    //             Object.defineProperty(obj, key, {
    //                 get () {
    //                     return val;
    //                 },
    //                 set (newVal) {
    //                     val = newVal;
    //                     notify(keyPrefix);
    //                 }
    //             });
    //         }
    //     }
    // }

    // function observeNodeAttr (selector, nodeProperty, observable, callback) {
    //     const nodes = parentEl.querySelectorAll(`[${selector}]`);

    //     for (const node of nodes) {
    //         let nodeValue = node.attributes[selector].value;
    //         let subProperties = nodeValue.split('.');

    //         if (cleanDOM) {
    //             node.removeAttribute(selector);
    //         }

    //         if (subProperties.length === 1) {
    //             callback.call(this, observable, nodeValue, node, nodeProperty, nodeValue);
    //             continue;
    //         }
    //         let observedProperty = subProperties.shift();
    //         let observedObject = Object.assign({}, observable);

    //         for (const subProperty of subProperties) {
    //             observedObject = observedObject[observedProperty];
    //             observedProperty = subProperty;
    //         }
    //         callback(observedObject, observedProperty, node, nodeProperty, nodeValue);
    //     }
    // }
    
    // function parseDOM (observable) {
    //     for (const propName in props) {
    //         const propData = props[propName];
    //         const observableChildName = propData.observableChild;
    //         const observableChild = observableChildName !== undefined ? observable[observableChildName] : observable;
    //         const callback = callbacks[propData.callback];

    //         if (Array.isArray(propData.existingProperty)) {
    //             for (const existingProp of propData.existingProperty) {
    //                 observeNodeAttr(propName, existingProp, observableChild, callback);
    //             }
    //         }
    //         else {
    //             observeNodeAttr(propName, propData.existingProperty, observableChild, callback);
    //         }
    //     }

    //     // observeNodeAttr('interpolate-for', null, observable.watchers, interpolateForNode);
    //     // observeNodeAttr('view-if', null, observable.watchers, viewIfNode);

    //     // observeNodeAttr('watch-text', 'textContent', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-text', 'innerText', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-value', 'value', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-html', 'innerHTML', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-class', 'className', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-id', 'id', observable.watchers, watchNode);
    //     // observeNodeAttr('watch-name', 'name', observable.watchers, watchNode);

    //     // observeNodeAttr('listen-input', 'input', observable, listenToNode);
    //     // observeNodeAttr('listen-click', 'click', observable, listenToNode);
    //     // observeNodeAttr('listen-change', 'change', observable, listenToNode);
    // }
// }
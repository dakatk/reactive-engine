/* jshint globalstrict: true */
'use strict';

export default class BigBrother {
    constructor (dataObj) {
        this._signals = {};
        this._removed = {};

        this.data = dataObj;
        this.el = document.getElementById(this.data.id) || document.body;

        watchData(this, this.data.watchers);
        parseDOM(this, this.data);
    }

    watch (property, signalHandler) {
        if (!this._signals[property]) {
            this._signals[property] = [];
        }
        this._signals[property].push(signalHandler);
    }

    notify (signal) {
        if (!this._signals[signal] || this._signals[signal].length < 1) {
            return;
        }
        this._signals[signal].forEach((signalHandler) => signalHandler.call());
    }
}

function watchData (bigBrother, obj, prefix) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let val = obj[key];
            const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

            if (val instanceof Object && prefix === undefined) {
                watchData(bigBrother, val, keyPrefix);
            }
            /* jshint ignore:start */
            Object.defineProperty(obj, key, {
                get () {
                    return val;
                },
                set (newVal) {
                    val = newVal;
                    bigBrother.notify(keyPrefix);
                }
            });
            /* jshint ignore:end */
        }
    }
}

function observeNodeAttr (bigBrother, selector, nodeProperty, observable, callback) {
    const nodes = bigBrother.el.querySelectorAll(`[${selector}]`);

    for (const node of nodes) {
        let nodeValue = node.attributes[selector].value;
        let subProperties = nodeValue.split('.');

        node.removeAttribute(selector);

        if (subProperties.length === 1) {
            callback(bigBrother, observable, nodeValue, node, nodeProperty, nodeValue);
            continue;
        }
        let observedProperty = subProperties.shift();
        let observedObject = {...observable};

        for (const subProperty of subProperties) {
            observedObject = observedObject[observedProperty];
            observedProperty = subProperty;
        }
        callback(bigBrother, observedObject, observedProperty, node, nodeProperty, nodeValue);
    }
}

function interpolateForNode (_, observable, observedProperty, node) {
    const parent = node.parentNode;
    const observedObject = observable[observedProperty];

    const keyRegex = /\$\{key\}/g;
    const valueRegex = /\$\{value\}/g;

    for (const key in observedObject) {
        let value = observedObject[key];
        let newNode = node.cloneNode(true);

        for (let nodeAttr of node.attributes) {
            const nodeName = nodeAttr.nodeName;
            const nodeValue = nodeAttr.nodeValue.replace(keyRegex, key).replace(valueRegex, value);

            newNode.attributes[nodeName].nodeValue = nodeValue;
        }
        parent.insertBefore(newNode, node);
        newNode.removeAttribute('interpolate-for');
    }
    parent.removeChild(node);
}

function viewIfNode (bigBrother, observable, observedProperty, node, _, watchKey) {
    checkToRemoveNode(bigBrother, observable, observedProperty, node);
    bigBrother.watch(watchKey, () => checkToRemoveNode(bigBrother, observable, observedProperty, node));
}

function checkToRemoveNode (bigBrother, observable, property, node) {
    if (!observable[property]) {
        const parent = node.parentNode;
        const index = Array.from(parent.children).indexOf(node);

        bigBrother._removed[node] = {index, parent};
        parent.removeChild(node);
    }
    else {
        const removedNode = bigBrother._removed[node];

        if (removedNode === undefined) {
            return;
        }
        const parent = removedNode.parent;
        const sibling = parent.childNodes[removedNode.index];
        
        parent.insertBefore(node, sibling);
    }
}

function watchNode (bigBrother, observable, observedProperty, node, nodeProperty, watchKey) {
    node[nodeProperty] = observable[observedProperty];
    bigBrother.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
}

function listenToNode (_, observable, observedProperty, node, eventName) {
    node.addEventListener(eventName, event => {
        listenToEvent(observable, observedProperty, event);
    }, true);
}

function listenToEvent (observable, property, event) {
    if (observable.listeners[property] === undefined) {
        observable.watchers[property] = event.target.value;
    }
    else {
        observable.listeners[property].call(observable, event);
    }
}

function parseDOM (bigBrother, observable) {
    observeNodeAttr(bigBrother, 'interpolate-for', null, observable.watchers, interpolateForNode);
    observeNodeAttr(bigBrother, 'view-if', null, observable.watchers, viewIfNode);

    observeNodeAttr(bigBrother, 'watch-text', 'textContent', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-text', 'innerText', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-value', 'value', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-html', 'innerHTML', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-class', 'className', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-id', 'id', observable.watchers, watchNode);
    observeNodeAttr(bigBrother, 'watch-name', 'name', observable.watchers, watchNode);

    observeNodeAttr(bigBrother, 'listen-input', 'input', observable, listenToNode);
    observeNodeAttr(bigBrother, 'listen-click', 'click', observable, listenToNode);
    observeNodeAttr(bigBrother, 'listen-change', 'change', observable, listenToNode);
}
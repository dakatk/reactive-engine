export default function BigBrother (dataObj, cleanDOM) {
    let signals = {};
    let removed = {};

    let parentEl = document.getElementById(dataObj.id);
    parentEl = parentEl || document.body;

    function load () {
        watchData(dataObj.watchers);
        parseDOM(dataObj);
    }

    return {
        el: parentEl,
        data: dataObj,
        load
    };

    function watch (property, signalHandler) {
        if (!signals[property]) {
            signals[property] = [];
        }
        signals[property].push(signalHandler);
    }

    function notify (signal) {
        if (!signals[signal] || signals[signal].length < 1) {
            return;
        }
        signals[signal].forEach((signalHandler) => signalHandler.call());
    }

    function watchData (obj, prefix) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let val = obj[key];
                const keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

                if (val instanceof Object && prefix === undefined) {
                    watchData(val, keyPrefix);
                    continue;
                }
                Object.defineProperty(obj, key, {
                    get () {
                        return val;
                    },
                    set (newVal) {
                        val = newVal;
                        notify(keyPrefix);
                    }
                });
            }
        }
    }

    function observeNodeAttr (selector, nodeProperty, observable, callback) {
        const nodes = parentEl.querySelectorAll(`[${selector}]`);

        for (const node of nodes) {
            let nodeValue = node.attributes[selector].value;
            let subProperties = nodeValue.split('.');

            if (cleanDOM) {
                node.removeAttribute(selector);
            }

            if (subProperties.length === 1) {
                callback(observable, nodeValue, node, nodeProperty, nodeValue);
                continue;
            }
            let observedProperty = subProperties.shift();
            let observedObject = Object.assign({}, observable);

            for (const subProperty of subProperties) {
                observedObject = observedObject[observedProperty];
                observedProperty = subProperty;
            }
            callback(observedObject, observedProperty, node, nodeProperty, nodeValue);
        }
    }

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

            if (cleanDOM) {
                newNode.removeAttribute('interpolate-for');
            }
        }
        parent.removeChild(node);
    }

    function viewIfNode (observable, observedProperty, node, _, watchKey) {
        checkToRemoveNode(observable, observedProperty, node);
        watch(watchKey, () => checkToRemoveNode(observable, observedProperty, node));
    }

    function checkToRemoveNode (observable, property, node) {
        if (!observable[property]) {
            const parent = node.parentNode;
            const index = Array.from(parent.children).indexOf(node);

            removed[node] = {index, parent};
            parent.removeChild(node);
        } 
        else {
            const removedNode = removed[node];

            if (removedNode === undefined) {
                return;
            }
            const parent = removedNode.parent;
            const sibling = parent.childNodes[removedNode.index];
            
            parent.insertBefore(node, sibling);
        }
    }

    function watchNode (observable, observedProperty, node, nodeProperty, watchKey) {
        node[nodeProperty] = observable[observedProperty];
        watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
    }

    function listenToNode (observable, observedProperty, node, eventName) {
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
    
    function parseDOM (observable) {
        observeNodeAttr('interpolate-for', null, observable.watchers, interpolateForNode);
        observeNodeAttr('view-if', null, observable.watchers, viewIfNode);

        observeNodeAttr('watch-text', 'textContent', observable.watchers, watchNode);
        observeNodeAttr('watch-text', 'innerText', observable.watchers, watchNode);
        observeNodeAttr('watch-value', 'value', observable.watchers, watchNode);
        observeNodeAttr('watch-html', 'innerHTML', observable.watchers, watchNode);
        observeNodeAttr('watch-class', 'className', observable.watchers, watchNode);
        observeNodeAttr('watch-id', 'id', observable.watchers, watchNode);
        observeNodeAttr('watch-name', 'name', observable.watchers, watchNode);

        observeNodeAttr('listen-input', 'input', observable, listenToNode);
        observeNodeAttr('listen-click', 'click', observable, listenToNode);
        observeNodeAttr('listen-change', 'change', observable, listenToNode);
    }
}
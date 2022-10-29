"use strict";

const BigBrother = (() => {
    const registry = {};
    const templatesById = {};
    const customProps = {
        "interpolate-for": {
            "existingProperty": null,
            "child": "watchers",
            "callback": "interpolateForNode"
        },
        "view-if": {
            "existingProperty": null,
            "child": "watchers",
            "callback": "viewIfNode"
        },
        "watch-text": {
            "existingProperty": ["textContent", "innerText"],
            "child": "watchers",
            "callback": "watchNode"
        },
        "watch-value": {
            "existingProperty": "value",
            "child": "watchers",
            "callback": "watchNode"
        },
        "watch-html": {
            "existingProperty": "innerHTML",
            "child": "watchers",
            "callback": "watchNode"
        },
        "watch-class": {
            "existingProperty": "className",
            "child": "watchers",
            "callback": "watchNode"
        },
        "watch-id": {
            "existingProperty": "id",
            "child": "watchers",
            "callback": "watchNode"
        },
        "watch-name": {
            "existingProperty": "name",
            "child": "watchers",
            "callback": "watchNode"
        },
        "listen-input": {
            "existingProperty": "input",
            "callback": "listenToNode"
        },
        "listen-click": {
            "existingProperty": "click",
            "callback": "listenToNode"
        },
        "listen-change": {
            "existingProperty": "change",
            "callback": "listenToNode"
        }
    };

    const callbacks = {
        interpolateForNode: ({thinkpol, observable, observedProperty, node}) => {
            const parentNode = node.parentNode;
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
                parentNode.insertBefore(newNode, node);
        
                if (thinkpol.cleanDOM) {
                    newNode.removeAttribute("interpolate-for");
                }
            }
            parentNode.removeChild(node);
        },
        viewIfNode: ({thinkpol, observable, observedProperty, node, watchKey}) => {
            thinkpol.unperson(observable, observedProperty, node);
            thinkpol.watch(watchKey, () => thinkpol.unperson(observable, observedProperty, node));
        },
        watchNode: ({thinkpol, observable, observedProperty, node, nodeProperty, watchKey}) => {
            node[nodeProperty] = observable[observedProperty];
            thinkpol.watch(watchKey, () => node[nodeProperty] = observable[observedProperty]);
        },
        listenToNode: ({thinkpol, observable, observedProperty, node, nodeProperty}) => {
            node.addEventListener(nodeProperty, (event) => {
                if (observable.listeners[observedProperty] === undefined) {
                    observable.watchers[observedProperty] = event.target.value;
                } else {
                    observable.listeners[observedProperty].call(thinkpol.personnelDetails(), event);
                }
            }, true);
        }
    };

    const objectClone = (obj) => {
        const newObj = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (value instanceof Object && 
                !(value instanceof Function) && value !== null) {
                    newObj[key] = objectClone(value);
            } else {
                newObj[key] = value;
            }
        }
        return newObj;
    };

    class ThoughtPolice {
        constructor(partyMember, cleanDOM) {
            this.id = partyMember.id;
            this.cleanDOM = cleanDOM;
            this.data = {
                id: partyMember.id,
                listeners: partyMember.listeners,
                watchers: objectClone(partyMember.watchers)
            };

            this.signals = {};
            this.removed = {};
            this.children = {};
            this.parent = undefined;
        }

        setup(parentEl, nodeUUIDs, childUUIDs) {
            this.connectObservableProperties(this.data.watchers);
            this.collectNamedChildren(childUUIDs);
            this.parseDOM(parentEl, nodeUUIDs, this.personnelDetails());
        }

        watch(property, signalHandler) {
            if (!this.signals[property]) {
                this.signals[property] = [];
            }
            this.signals[property].push(signalHandler);
        }

        notify(signal) {
            if (!this.signals[signal] || this.signals[signal].length < 1) {
                return;
            }
            this.signals[signal].forEach(function (signalHandler) {
                signalHandler.call();
            });
        }

        unperson(observable, observedProperty, node) {
            if (!observable[observedProperty]) {
                const parentNode = node.parentNode;
                const index = Array.from(parentNode.children).indexOf(node);

                this.removed[node] = {
                    parent: parentNode,
                    index
                };
                parentNode.removeChild(node);
            } else if (node in this.removed) {
                const removedNode = this.removed[node];
                const parentNode = removedNode.parent;
                const sibling = parentNode.childNodes[removedNode.index];

                parentNode.insertBefore(node, sibling);
            }
        }

        personnelDetails(includeHierarchy = true) {
            const detailsObj = {
                id: this.id,
                watchers: this.data.watchers,
                listeners: this.data.listeners
            };
            if (includeHierarchy) {
                detailsObj.parent = this.parent;
                detailsObj.children = this.children;
            }
            return detailsObj;
        }

        connectObservableProperties(obj, prefix) {
            const self = this;
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let value = obj[key];
                    let keyPrefix = (prefix === undefined ? key : `${prefix}.${key}`);

                    if (value instanceof Object && prefix === undefined) {
                        self.connectObservableProperties(value, keyPrefix);
                        continue;
                    }
                    Object.defineProperty(obj, key, {
                        get() {
                            return value;
                        },
                        set(newValue) {
                            value = newValue;
                            self.notify(keyPrefix);
                        }
                    });
                }
            }
        }

        collectNamedChildren(childUUIDs) {
            const childNameSelector = childUUIDs
                .map((value) => `[designation][uuid="${value}"]`)
                .join(",");

            if (childNameSelector === "") {
                return;
            }

            for (const childNode of document.querySelectorAll(childNameSelector)) {
                const childName = childNode.attributes["designation"].value;
                const childUUID = childNode.attributes["uuid"].value;

                if (this.cleanDOM) {
                    childNode.removeAttribute("designation");
                }
                this.children[childName] = childUUID;
            }
        }

        parseDOM(parentEl, nodeUUIDs, data) {
            for (const propName in customProps) {
                const propData = customProps[propName];
                const callback = callbacks[propData.callback];

                const childName = propData.child;
                const childObj = childName !== undefined ? data[childName] : data;

                const childSelector = nodeUUIDs
                    .map((value) => `[${propName}][uuid="${value}"]`)
                    .join(",");

                if (Array.isArray(propData.existingProperty)) {
                    for (const existingProp of propData.existingProperty) {
                        this.observeNodeAttr(parentEl, childSelector, propName, existingProp, childObj, callback);
                    }
                    continue;
                }
                this.observeNodeAttr(parentEl, childSelector, propName, propData.existingProperty, childObj, callback);
            }
        }

        observeNodeAttr(parentEl, selector, propName, nodeProperty, observable, callback) {
            if (!selector) {
                return;
            }

            for (const node of parentEl.querySelectorAll(selector)) {
                const watchKey = node.attributes[propName].value;
                const subProperties = watchKey.split(".");
                const callbackArgs = {
                    thinkpol: this,
                    observable,
                    observedProperty: watchKey,
                    node,
                    nodeProperty,
                    watchKey
                };

                if (this.cleanDOM) {
                    node.removeAttribute(propName);
                }

                if (subProperties.length === 1) {
                    callback(callbackArgs);
                    continue;
                }
                let observedProperty = subProperties.shift();
                let observedObject = Object.assign({}, observable);

                for (const subProperty of subProperties) {
                    observedObject = observedObject[observedProperty];
                    observedProperty = subProperty;
                }
                callbackArgs.observable = observedObject;
                callbackArgs.observedProperty = observedProperty;

                callback(callbackArgs);
            }
        }
    }

    class LoadPartyMembers {
        constructor(debug) {
            this.partyMembersByUUID = {};
            this.maxUUID = Number.MAX_SAFE_INTEGER - 1;
            this.uuid = 0;
            this.debug = debug;
        }

        load() {
            this.loadRecursiveNodesWithParent(document.body);
            for (const id in templatesById) {
                const template = templatesById[id];
                template.parentNode.removeChild(template);
            }
            return this.partyMembersByUUID;
        }

        loadRecursiveNodesWithParent(parentNode, depth = 0, parentUUID) {
            if (depth >= 1000) {
                return;
            }
            let children = Array.from(parentNode.childNodes);
            children = children.filter((el) => el.nodeType === 1 && el.localName !== "template");

            for (const child of children) {
                const id = child.localName;
                if (this.isExistingParent(id, parentUUID)) {
                    const parentId = parentNode.localName;
                    console.error(
                        `Warning: "${parentId}" creates infinite recursion in "${id}"`
                    );
                    continue;
                }
                const currentUUID = this.nextUUID();
                child.setAttribute("uuid", currentUUID);

                if (parentUUID !== undefined) {
                    if (registry[id] === undefined) {
                        this.partyMembersByUUID[parentUUID].nodes.push(currentUUID);
                        continue;
                    } else {
                        this.partyMembersByUUID[parentUUID].children.push(currentUUID);
                    }
                }
                child.innerHTML = templatesById[id].innerHTML;

                this.partyMembersByUUID[currentUUID] = {
                    id,
                    parentUUID,
                    debug: this.debug,
                    nodes: [],
                    children: []
                };
                this.loadRecursiveNodesWithParent(child, depth + 1, currentUUID);
            }
        }

        isExistingParent(id, parentUUID) {
            if (parentUUID === undefined) {
                return false;
            }

            const firstParent = this.partyMembersByUUID[parentUUID];
            for (let parentObj = firstParent; parentUUID !== undefined; parentObj = this.partyMembersByUUID[parentUUID]) {
                if (id === parentObj.id) {
                    return true;
                }
                parentUUID = parentObj.parentUUID;
            }
            return false;
        }

        nextUUID() {
            this.uuid++;
            if (this.uuid > this.maxUUID) {
                throw new Error("UUID limit reached");
            }
            return this.uuid;
        }
    }

    return {
        registerPartyMember: ({id, watchers, listeners}) => {
            registry[id] = {
                id,
                watchers: watchers || {},
                listeners: listeners || {}
            };
            templatesById[id] = `template[party-member="${id}"]`;
        }, 
        beginWatching: (debug=false) => {
            for (const [id, query] of Object.entries(templatesById)) {
                templatesById[id] = document.querySelector(query);
            }
            const partyMembersByUUID = new LoadPartyMembers(debug).load();
    
            for (const [uuid, data] of Object.entries(partyMembersByUUID)) {
                const node = document.querySelector(`${data.id}[uuid="${uuid}"]`);
                const partyMember = registry[data.id];
                const thinkpol = new ThoughtPolice(partyMember, !data.debug);
    
                thinkpol.setup(node, data.nodes, data.children);
                data.inst = thinkpol;
            }
    
            for (const partyMemberObj of Object.values(partyMembersByUUID)) {
                const parentUUID = partyMemberObj.parentUUID;
                if (!parentUUID) {
                    continue;
                }
                const parent = partyMembersByUUID[parentUUID];
                const children = partyMemberObj.inst.children;
                partyMemberObj.inst.parent = parent.inst.personnelDetails(false);

                for (const [childName, childUUID] of Object.entries(children)) {
                    const child = partyMembersByUUID[childUUID];
                    children[childName] = child.inst.personnelDetails(false);
                }
            }
        }
    };
})();
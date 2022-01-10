export default {
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
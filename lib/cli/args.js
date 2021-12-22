import minimist from "minimist";
import defaults from './default-args.json';

const argv = minimist(process.argv.slice(2));

function getArgValueByName (argName) {
    if (argName in argv) {
        return argv[argName];
    }
    return defaults[argName];
}

export function debugFlag() {
    return getArgValueByName('debug').toLowerCase();
}

export function modulePath() {
    const path = getArgValueByName('module');
    if (path === null) {
        throw new Error('Module path argument not provided');
    }
    return path;
}
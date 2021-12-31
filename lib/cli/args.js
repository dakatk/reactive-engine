import minimist from "minimist";
import defaults from './default-args.json';

const argv = minimist(process.argv.slice(2));
const args = {};

function getArgValueByName (argName) {
    if (argName in argv) {
        return argv[argName];
    }
    return defaults[argName];
}

function loadArgsOrDefault() {
    for (const argName of Object.keys(defaults)) {
        const argValue = getArgValueByName(argName);
        Object.defineProperty(args, argName, {
            get () {
                return argValue;
            }
        });
    }
}
loadArgsOrDefault();

export default args;
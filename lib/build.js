import fs from 'fs';
import { EntryModule } from '../index.module';
import Registrar from './build-system/registrar';
import generateHtmlFromTemplate from './build-system/templates';
import bundleJsModulesWithWatcher from './build-system/bundler';
import { debugFlag } from './cli/args';

function build(module, template, debug) {
    for (const partyMember of module) {
        Registrar.registerPartyMember(partyMember);
    }
    const [html, componentsByUUID] = generateHtmlFromTemplate(template, debug);
    fs.writeFile('public/index.html', html, (err) => {
        if (err) throw err;
    });
    bundleJsModulesWithWatcher(!debug, componentsByUUID);
}

fs.readFile('index.html', (err, template) => {
    if (err) {
        throw err;
    }
    const debug = debugFlag() === 'true';
    build(EntryModule, template, debug);
});
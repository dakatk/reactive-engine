import fs from 'fs';
import module from './index.module';
import Registrar from './build-system/registrar';
import generateHtmlFromTemplate from './build-system/templates';
import bundleJsModulesWithWatcher from './build-system/mini-bundle';

function build(module, template, debug) {
    for (const partyMember of module) {
        Registrar.registerPartyMember(partyMember);
    }

    const html = generateHtmlFromTemplate(template, debug);
    fs.writeFile('public/index.html', html, (err) => {
        if (err) throw err;
    });

    bundleJsModulesWithWatcher(!debug);
}

fs.readFile('index.html', (err, template) => {
    if (err) {
        throw err;
    }
    build(module, template, true);
});
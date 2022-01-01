import fs from 'fs';
import path from 'path';
import Registrar from './build-system/registrar';
import generateHtmlFromTemplate from './build-system/templates';
import bundleJsModulesWithWatcher from './build-system/bundler';
import args from './cli/args';

function build(module, template, debug) {
    for (const partyMember of module) {
        Registrar.registerPartyMember(partyMember);
    }
    const [html, componentsByUUID] = generateHtmlFromTemplate(template, debug);
    const htmlFilePath = path.resolve(process.cwd(), 'public/index.html');

    fs.writeFile(htmlFilePath, html, (err) => {
        if (err) throw err;
    });
    const entryModuleName = args['module-name'];
    bundleJsModulesWithWatcher(!debug, entryModuleName, componentsByUUID);
}

function loadEntryFilesAndBuild() {
    const entryFullPath = path.resolve(process.cwd(), args['entry-path']);
    fs.readFile(entryFullPath, (err, template) => {
        if (err) {
            throw err;
        }
        const debug = args['debug'] === 'true';
        const moduleExportName = args['module-name'];
        const moduleFullPath = path.resolve(process.cwd(), args['module-path']);

        import(moduleFullPath)
            .then(module => {
                const entryModule = module[moduleExportName];
                build(entryModule, template, debug);
            })
            .catch(err => {
                console.error(err);
                process.exit(1)
            });
    });
}
loadEntryFilesAndBuild();
import fs from 'fs';
import path from 'path';
import Registrar from './build-system/registrar';
import generateHtmlFromTemplate from './build-system/templates';
import bundleJsModulesWithWatcher from './build-system/bundler';
import PartyMandates from './config/mandates';

export default function build() {
    PartyMandates.mandates()
        .then(mandates => {
            const entryTemplatePath = mandates.entryTemplatePath;
            fs.readFile(entryTemplatePath, 'utf8', (err, template) => {
                if (err) {
                    throw new Error(err);
                }
                loadAndBuildWithMandates(mandates, template)
            });
        })
        .catch(() => process.exit(1));
}

function loadAndBuildWithMandates(mandates, template) {
    const moduleFullPath = mandates.entryModulePath;
    const moduleExportName = mandates.entryModuleName;
    const debug = mandates.devMode;

    import(moduleFullPath)
        .then(module => {
            const entryModule = module[moduleExportName];
            const outputDirectory = mandates.outputDirectory;
            generateFiles(entryModule, template, debug, moduleFullPath, moduleExportName, outputDirectory);
        })
        .catch(err => {
            console.error(err);
            process.exit(1)
        });
}

function generateFiles(module, template, debug, entryModulePath, entryModuleName, outputDirectory) {
    for (const partyMember of module) {
        Registrar.registerPartyMember(partyMember);
    }
    const [html, componentsByUUID] = generateHtmlFromTemplate(template, debug);
    const htmlFilePath = path.resolve(outputDirectory, 'index.html');

    fs.writeFile(htmlFilePath, html, (err) => {
        if (err) {
            throw new Error(err);
        }
    });
    bundleJsModulesWithWatcher(!debug, componentsByUUID, entryModulePath, entryModuleName, outputDirectory);
}
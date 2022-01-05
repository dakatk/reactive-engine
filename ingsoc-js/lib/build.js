import createRegistry from './build-system/registrar.js';
import Bundler from './build-system/bundler.js';
import PartyMandates from './config/party-mandates.js';

export default function build() {
    PartyMandates.mandates
        .then(mandates => {
            createRegistry(mandates.appDirectory, registry => {
                generatePublicFiles(registry, mandates);
            })
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function generatePublicFiles(registry, {devMode, entryModulePath, entryStylePath, entryTemplatePath, entryModuleName, outputDirectory}) {
    Bundler.bundleTemplateToHtml(devMode, registry, entryTemplatePath, outputDirectory)
        .then(partyMembersByUUID => {
            Bundler.bundleJsModules(!devMode, partyMembersByUUID, entryModulePath, entryModuleName, outputDirectory);
            Bundler.bundleStyleSheets(entryStylePath, outputDirectory);
        });
}
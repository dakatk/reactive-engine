import createRegistry from './build-system/registrar.js';
import Bundler from './build-system/bundler.js';
import PartyMandates from './config/party-mandates.js';

const onError = err => {
    console.error(err.toString());
    process.exit(1);
}

export default function build() {
    PartyMandates.mandates
        .then(mandates => {
            createRegistry(mandates.appDirectory, registry => {
                generatePublicFiles(registry, mandates)
                    .catch(onError)
            })
        })
        .catch(onError);
}

async function generatePublicFiles(registry, {devMode, entryModulePath, entryStylePath, entryTemplatePath, entryModuleName, rootDirectory, outputDirectory}) {
    const partyMembersByUUID = await Bundler.bundleTemplateToHtml(devMode, registry, entryTemplatePath, outputDirectory);
    await Bundler.bundleJsModules(!devMode, partyMembersByUUID, entryModulePath, entryModuleName, outputDirectory);
    await Bundler.bundleStyleSheets(!devMode, entryStylePath, rootDirectory, outputDirectory);
}
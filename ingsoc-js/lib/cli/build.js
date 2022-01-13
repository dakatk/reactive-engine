import createRegistry from './build-logic/registrar.js';
import Bundler from './build-logic/bundler.js';
import PartyMandates from '../config/party-mandates.js';

const onError = err => {
    console.error(err.toString());
    process.exit(1);
}

export function build() {
    PartyMandates.mandates
        .then(buildWithMandates)
        .catch(onError);
}

export function buildWithMandates(mandates) {
    createRegistry(mandates.appDirectory, registry => {
        generatePublicFiles(registry, mandates)
            .catch(onError);
    });
}

async function generatePublicFiles(registry, mandates) {
    const partyMembersByUUID = await Bundler.bundleTemplateToHtml(registry, mandates);
    await Bundler.bundleJsModules(partyMembersByUUID, mandates);
    await Bundler.bundleStyleSheets(mandates);
}
import fs from 'fs';
import path from 'path';
import createRegistry from './build-system/registrar.js';
import generateHtmlFromTemplate from './build-system/templates.js';
import bundleJsModulesWithWatcher from './build-system/bundler.js';
import PartyMandates from './config/party-mandates.js';

export default function build() {
    PartyMandates.mandates
        .then(mandates => {
            const entryTemplatePath = mandates.entryTemplatePath;
            fs.readFile(entryTemplatePath, 'utf8', (err, template) => {
                if (err) {
                    throw new Error(err);
                }
                createRegistry(mandates.appDirectory, registry => {
                    generatePublicFiles(template, registry, mandates);
                });
            });
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

function generatePublicFiles(template, registry, {devMode, entryModulePath, entryModuleName, outputDirectory}) {
    const [html, componentsByUUID] = generateHtmlFromTemplate(template, registry, devMode);
    const htmlFilePath = path.resolve(outputDirectory, 'index.html');

    fs.writeFile(htmlFilePath, html, (err) => {
        if (err) {
            throw new Error(err);
        }
    });
    //bundleJsModulesWithWatcher(!devMode, componentsByUUID, entryModulePath, entryModuleName, outputDirectory);
}
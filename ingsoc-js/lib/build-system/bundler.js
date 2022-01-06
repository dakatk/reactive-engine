import { build } from 'esbuild';
import CSSCombine from './styles.js';
import ExpandTemplate from './templates.js';
import path from 'path';
import fs from 'fs';

const esbuildOptions = (minify, partyMembersByUUID, entryModulePath, entryModuleName, outfile) => {
    return {
        entryPoints: ['ingsoc-js/lib/reactive/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'partyMembersByUUID': JSON.stringify(partyMembersByUUID),
            'partyMemberTypes': entryModuleName
        },
        bundle: true,
        platform: 'node',
        outfile,
        minify
    };
}

const templateResolveFn = ({html, partyMembersByUUID}, outfile) => {
    fs.writeFile(outfile, html, err => {
        if (err) {
            throw new Error(err);
        }
    });
    return partyMembersByUUID;
}

function bundleJsModules(minify, partyMembersByUUID, entryModulePath, entryModuleName, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'bundle.js');
    build(esbuildOptions(minify, partyMembersByUUID, entryModulePath, entryModuleName, outfile))
        .catch(() => process.exit(1));
}

function bundleStyleSheets(entryStylePath, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'style.css');
    const combine = new CSSCombine(entryStylePath);
    combine.pipe(fs.createWriteStream(outfile));
}

async function bundleTemplateToHtml(debug, registry, entryTemplatePath, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'index.html');
    const template = new ExpandTemplate(entryTemplatePath, registry, debug);
    return await template.expandToHTML()
        .then(value => templateResolveFn(value, outfile));
}

const Bundler = {
    bundleJsModules,
    bundleStyleSheets,
    bundleTemplateToHtml
};

export default Bundler;
import esbuild from 'esbuild';
import CSSCombine from './styles.js';
import jsTokens from 'js-tokens';
import ExpandTemplate from './templates.js';
import path from 'path';
import fs from 'fs';

// const plugin = (options = {}) => ({
//     name: 'back-to-var',
//     setup(build) {
//         const { filter = /.*/, namespace = '' } = options;
//         build.onLoad({ filter, namespace }, async args => {
//             const contents = await fs.promises.readFile(args.path, 'utf8');
//             return new Promise(resolve => {
//                 console.log(Array.from(jsTokens(contents)));
//                 resolve({ contents });
//             });
//         });
//     }
// });

const esbuildOptions = (minify, partyMembersByUUID, entryModulePath, entryModuleName, outfile) => {
    return {
        entryPoints: ['ingsoc-js/lib/newspeak/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'partyMembersByUUID': JSON.stringify(partyMembersByUUID),
            'partyMemberTypes': entryModuleName
        },
        bundle: true,
        platform: 'node',
        target: 'es6',
        // plugins: [plugin()],
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

async function bundleJsModules(partyMembersByUUID, {devMode, entryModulePath, entryModuleName, outputDirectory}) {
    const outfile = path.resolve(outputDirectory, 'bundle.js');
    await esbuild.build(
        esbuildOptions(!devMode, partyMembersByUUID, entryModulePath, entryModuleName, outfile)
    );
}

async function bundleStyleSheets({entryStylePath, devMode, rootDirectory, outputDirectory}) {
    const outfile = path.resolve(outputDirectory, 'style.css');
    const combine = new CSSCombine(entryStylePath, !devMode, rootDirectory);
    await combine.writeToStream(fs.createWriteStream(outfile));
}

async function bundleTemplateToHtml(registry, {entryTemplatePath, devMode, outputDirectory}) {
    const outfile = path.resolve(outputDirectory, 'index.html');
    const template = new ExpandTemplate(entryTemplatePath, registry, devMode);
    return await template.expandToHTML()
        .then(value => templateResolveFn(value, outfile));
}

const Bundler = {
    bundleJsModules,
    bundleStyleSheets,
    bundleTemplateToHtml
};

export default Bundler;
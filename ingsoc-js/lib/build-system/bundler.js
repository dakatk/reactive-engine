import { build } from 'esbuild';
import combine from 'css-combine';
import path from 'path';
import fs from 'fs';

export function bundleJsModules(minify, componentsByUUID, entryModulePath, entryModuleName, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'bundle.js');
    build({
        entryPoints: ['ingsoc-js/lib/reactive/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'partyMembersByUUID': JSON.stringify(componentsByUUID),
            'partyMemberTypes': entryModuleName
        },
        bundle: true,
        platform: 'node',
        outfile,
        minify,
    })
    .catch(() => {
        process.exit(1);
    });
}

export function bundleStyleSheets(entryCssPath, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'style.css');
    combine(entryCssPath).pipe(
        fs.createWriteStream(outfile)
    );
}
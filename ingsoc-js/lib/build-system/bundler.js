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

export function bundleStyleSheets(entryStylePath, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'style.css');
    // TODO should be possible to remove this dependency by writing my own logic
    combine(entryStylePath).pipe(
        fs.createWriteStream(outfile)
    );
}
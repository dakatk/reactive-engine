import { build } from 'esbuild';
import path from 'path';

export default function bundleJsModulesWithWatcher(minify, componentsByUUID, entryModulePath, entryModuleName, outputDirectory) {
    const outfile = path.resolve(outputDirectory, 'bundle.js');
    build({
        entryPoints: ['./lib/reactive/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'componentsByUUID': JSON.stringify(componentsByUUID),
            'IndexModule': entryModuleName
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
import { build } from 'esbuild';
import args from '../cli/args';
import path from 'path';

export default function bundleJsModulesWithWatcher(minify, entryModuleName, componentsByUUID) {
    const entryModulePath = path.resolve(process.cwd(), args['module-path']);
    build({
        entryPoints: ['lib/reactive/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'componentsByUUID': JSON.stringify(componentsByUUID),
            'IndexModule': entryModuleName
        },
        outfile: 'public/bundle.js',
        bundle: true,
        platform: 'node',
        minify,
    })
    .catch(() => {
        process.exit(1);
    });
}
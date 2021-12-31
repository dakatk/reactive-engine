import { build } from 'esbuild';
import { modulePath } from '../cli/args';
import path from 'path';

export default function bundleJsModulesWithWatcher(minify, componentsByUUID) {
    const entryModulePath = path.resolve(process.cwd(), modulePath());
    build({
        entryPoints: ['lib/reactive/ingsoc.js'],
        inject: [entryModulePath],
        define: {
            'componentsByUUID': JSON.stringify(componentsByUUID)
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
import { build } from 'esbuild';

export default function bundleJsModulesWithWatcher(minify) {
    build({
        entryPoints: ['lib/reactive/watcher.js'],
        outfile: 'public/bundle.js',
        bundle: true,
        minify: minify,
        platform: 'node'
    })
    .catch(() => {
        process.exit(1);
    });
}
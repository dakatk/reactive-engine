import { build } from 'esbuild';

export default function bundleJsModulesWithWatcher(minify) {
    build({
        entryPoints: ['reactive/watcher.js'],
        bundle: true,
        outfile: 'public/bundle.js',
        minify: minify,
        platform: 'node'
    })
    .catch(() => {
        process.exit(1);
    });
}
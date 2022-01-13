import chokidar from 'chokidar';
import { buildWithMandates } from '../build.js';

export default function supervise(mandates) {
    const watcher = chokidar.watch(mandates.appDirectory, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });
    watcher.on('ready', () => watchFiles(watcher, mandates));
}

function watchFiles(watcher, mandates) {
    watcher
        .on('add', () => rebuild(mandates))
        .on('change', () => rebuild(mandates))
        .on('unlink', () => rebuild(mandates));
}

function rebuild(mandates) {
    console.log('\nRebuilding...');
    buildWithMandates(mandates);
    console.log('Done.');
}

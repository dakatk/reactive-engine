#! /usr/bin/env node

import { program } from 'commander';
import build from './lib/build.js';
import serve from './lib/serve.js';

program.version('0.0.1');

program.command('build')
    .description('Build')
    .action(build);

program.command('serve')
    .option('-p, --port <number>', 'Port number')
    .description('Serve')
    .action(serve);

program.parse();
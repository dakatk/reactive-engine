#! /usr/bin/env node

import { program } from 'commander';
import build from './lib/build';
import serve from './lib/serve';

program.version('0.0.1');

program.command('build')
    .description('Build')
    .action(build);

program.command('serve')
    .option('-p, --port', 'Port number')
    .description('Serve')
    .action(serve);

program.parse();
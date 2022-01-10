#! /usr/bin/env node
import { program } from 'commander';
import build from './lib/cli//build.js';
import serve from './lib/cli/serve.js';

program.version('1.0.0');

program.command('build')
    .description('Build')
    .action(build);

program.command('serve')
    .option('-p, --port <number>', 'Port number')
    .description('Serve')
    .action(serve);

program.parse();
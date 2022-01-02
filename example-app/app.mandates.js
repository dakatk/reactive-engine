import path from 'path';

const entryModulePath = path.resolve(__dirname, 'index.module.js');
const entryTemplatePath = path.resolve(__dirname, 'index.html');
const entryModuleName = 'IndexModule';
const appDirectory = path.resolve(__dirname, 'app');
const outputDirectory = path.resolve(__dirname, 'public');

export default {
    devMode: true,
    entryModuleName,
    entryModulePath,
    entryTemplatePath,
    appDirectory,
    outputDirectory
}
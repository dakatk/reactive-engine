const path = require('path');

const entryModuleName = 'IndexModule';
const entryModulePath = path.resolve(__dirname, 'index-module.js');
const entryTemplatePath = path.resolve(__dirname, 'index.html');
const entryStylePath = path.resolve(__dirname, 'style.css');
const appDirectory = path.resolve(__dirname, 'app');
const outputDirectory = path.resolve(__dirname, 'public');

module.exports = {
    devMode: true,
    entryModuleName,
    entryModulePath,
    entryStylePath,
    entryTemplatePath,
    appDirectory,
    outputDirectory
}
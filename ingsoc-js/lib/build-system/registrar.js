import cheerio from "cheerio";
import fs from 'fs';
import path from 'path';
import glob from 'glob';

export default function createRegistry(appDirectory, callback) {
    const htmlPaths = path.resolve(appDirectory, '**/*.html');
    const registry = {};

    glob(htmlPaths, {}, (err, files) => {
        if (err) {
            throw new Error(err);
        }
        for (const templateFile of files) {
            const split = templateFile.split('/');
            const id = split[split.length - 1].split('.')[0];

            registry[id] = loadTemplateFromFile(templateFile);
        }
        callback(registry);
    });
}

function loadTemplateFromFile(file) {
    const contents = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
    if (!contents) {
        throw new Error(`Couldn't read file ${file}`);
    }
    return cheerio.load(contents, null, false);
}
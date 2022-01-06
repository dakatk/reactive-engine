import hyperquest from 'hyperquest';
import concat from 'concat-stream';
import css from 'css';
import { Readable } from 'stream';
import isURL from 'is-url';
import path from 'path';
import fs from 'fs';

/**
 * Couresy of https://github.com/michaelrhodes/css-combine, but I decided
 * to translate it into an ES6 class and clean up some things
 */
// TODO solve infinite recursion
// Idea: fill array with filenames, check if filename in array when expanding
export default class CSSCombine extends Readable {
    constructor(file) {
        super();
        Readable.call(this);

        this.file = path.normalize(file);
        this.busy = false;
    }

    _read() {
        const self = this;
        if (self.busy) {
            return;
        }
        self.busy = true;

        const entrypoint = path.resolve(self.file);
        read(entrypoint)
            .on('error', error => self.emit(error.message))
            .pipe(concat(content => {
                parse(entrypoint, content, () => self.push(null));
            }));

        function parse(filename, content, callback, stack=[]) {
            if (!content) {
                callback();
                return;
            }
            const rules = css.parse(content.toString())
                .stylesheet
                .rules;

            const len = rules.length;
            if (!len) {
                callback();
                return;
            }
            let i = 0;

            (function loop() {
                const rule = rules[i];
                if (rule.type == 'import') {
                    const separatorReg = /^[^\/\\]/;
                    let file = extract(rule.import);

                    if (!isURL(file) && separatorReg.test(file)) {
                        const dir = path.dirname(filename);
                        file = path.normalize(path.resolve(dir, file));
                    }
                    else if (separatorReg.test(file)) {
                        file = path.normalize(path.join(process.cwd(), file));
                    }
                    if (!path.extname(file)) {
                        file += '.css';
                    }
                    if (stack.includes(file)) {
                        console.error(`Infinite recursion found for file "${file}"`);
                    }
                    read(file)
                        .on('error', error => self.emit(error.message))
                        .pipe(concat(content => {
                            parse(file, content, next, [...stack, file]);
                        }));
                }
                else if (rule.declarations && !rule.declarations.length) {
                    self.push(rule.selectors.join(',\n') + ' {}\n');
                    next();
                }
                else {
                    const cssText = css.stringify({
                        stylesheet: {
                            rules: [rule]
                        }
                    });
                    self.push(cssText.trim() + '\n');
                    next();
                }

                function next() {
                    (++i < len) ? loop() : callback()
                }
            })();
        }
    }
}

function extract(rule) {
  return rule
    .replace(/^url\(/, '')
    .replace(/'|"/g, '')
    .replace(/\)\s*$/, '');
}

function read(file) {
  return !isURL(file) ?
    fs.createReadStream(file) :
    hyperquest(file);
}

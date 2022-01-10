import concat from 'concat-stream';
import css from 'css';
import { Readable } from 'stream';
import isURL from 'is-url';
import path from 'path';
import fs from 'fs';

/**
 * Couresy of https://github.com/michaelrhodes/css-combine, but I decided
 * to translate it for ES6 and clean up some things
 */
export default class CSSCombine extends Readable {
    constructor(file, minify, rootDirectory) {
        super();
        Readable.call(this);

        this.rootDirectory = rootDirectory;
        this.minify = minify;
        this.file = file;
        this.busy = false;

        this.stringifyOptions = {
            selectorSeparator: minify ? ',' : ',\n',
            cssStringifyOptions: minify ? { 
                indent: '',
                compress: true
            } : undefined
        };
    }

    async writeToStream(stream) {
        return new Promise(resolve => {
            this.pipe(stream);
            resolve();
        });
    }

    _read() {
        if (this.busy) {
            return;
        }
        this.busy = true;

        const entryPoint = path.resolve(this.file);
        fs.createReadStream(entryPoint)
            .on('error', error => this.emit(error.message))
            .pipe(concat(content => {
                parse(entryPoint, content, () => super.push(null));
            }));

        const self = this;
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
                if (rule.type === 'import') {
                    const separatorReg = /^[^\/\\]/;
                    let file = extract(rule.import);

                    if (isURL(file)) {
                        self.push(self.stringify(rule));
                        next();
                    }
                    else {
                        if (separatorReg.test(file)) {
                            const dir = path.dirname(filename);
                            file = path.resolve(dir, file);
                        }
                        else {
                            file = path.resolve(self.rootDirectory, file.substring(1));
                        }
                        if (!path.extname(file)) {
                            file += '.css';
                        }
                        if (stack.includes(file)) {
                            console.error(`Infinite recursion found for file "${file}"`);
                        }
                        fs.createReadStream(file)
                            .on('error', error => self.emit(error.message))
                            .pipe(concat(content => {
                                parse(file, content, next, [...stack, file]);
                            }));
                    }
                }
                else {
                    self.push(self.stringify(rule));
                    next();
                }

                function next() {
                    (++i < len) ? loop() : callback();
                }
            })();
        }
    }

    stringify(rule) {
        if (rule.declarations && !rule.declarations.length) {
            return rule.selectors.join(
                this.stringifyOptions.selectorSeparator
            ) + '{}';
        }
        else {
            return css.stringify({
                stylesheet: {
                    rules: [rule]
                }
            }, 
            this.stringifyOptions.cssStringifyOptions)
            .trim();
        }
    }

    push(text) {
        if (!this.minify) {
            text += '\n';
        }
        super.push(text);
    }
}

function extract(rule) {
    return rule
        .replace(/^url\(/, '')
        .replace(/'|"/g, '')
        .replace(/\)\s*$/, '');
}

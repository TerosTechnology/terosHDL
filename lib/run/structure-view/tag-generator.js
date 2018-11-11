'use babel';
// MIT License
// Copyright (c) 2017 Alibaba Group Holding Limited and other contributors.
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in the
// Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import fs from 'fs';
import path from 'path';

export default class TagGenerator {
  constructor(path1, scopeName) {
    this.path = path1;
    this.scopeName = scopeName;
  }

  getLanguage() {
    let needle;
    if (typeof this.path === 'string' && (needle = path.extname(this.path), ['.cson', '.gyp'].includes(needle))) {
      return 'Cson';
    }

    return {
      'source.vhdl': 'vhd'
    }[this.scopeName];
  }

  async generate() {
    if (!this.lang) this.lang = this.getLanguage();
    if (!fs.statSync(this.path).isFile()) return {};

    let Gen;
    try {
      Gen = require(`./tag-generators/${this.lang}`);
    } catch (e) {
      Gen = require('./tag-generators/universal');
    }

    const ctx = {
      file: this.path,
      content: fs.readFileSync(this.path, 'utf8'),
      lang: this.lang
    };
    let tags = await Gen.parseFile(ctx); // tags contains list and tree data structure

    // For inline script in HTML
    if (tags.scriptNode && tags.scriptNode.length) await this.inlineScriptHandler(tags.scriptNode, ctx);
    return tags;
  }

  async inlineScriptHandler(nodes, ctx) {
    let parser = require('./tag-generators/javascript');
    for (let i in nodes) {
      let parent = nodes[i];
      let tags = await parser.parseFile({
                  content: parent.content,
                  file: ctx.file
                });
      if (tags.tree && Object.keys(tags.tree).length) {
        parent.child = tags.tree;
        this.fixLineno(parent);
      }
      // If JS error exists, jsctags would work
      else if (tags.list) {
        if (!parent.child) parent.child = {};
        for (let j in tags.list) {
          let item = tags.list[j];
          parent.child[item.id] = item;
        }
        this.fixLineno(parent);
      }
    }
  }

  fixLineno(parent, baseLineno) {
    // Line number of root node is the base number
    if (!baseLineno) baseLineno = parent.lineno;
    for (let i in parent.child) {
      let child = parent.child[i];
      child.lineno += baseLineno - 1;
      if (child.child) this.fixLineno(child, baseLineno);
    }
  }
}

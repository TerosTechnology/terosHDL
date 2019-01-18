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
import path from 'path';
import { BufferedProcess } from 'atom';

let parent
let archID

export default {
  parseFile(ctx) {

    const command = path.resolve(__dirname, '..', 'vendor', `universal-ctags-${process.platform}`),
      defaultCtagsFile = require.resolve('./.ctags'),
      self = this;
    let tags = [],
      args = [`--options=${defaultCtagsFile}`, '--fields=KsS'];

    // Not used
    // if (atom.config.get('structure-view.useEditorGrammarAsCtagsLanguage') && ctx.lang) {
    //   args.push(`--language-force=${ctx.lang}`);
    // }
    args.push('-nf', '-', ctx.file);

    return new Promise(resolve => {
      return new BufferedProcess({
        command: command,
        args: args,
        stdout(lines) {
          return (() => {
            let result = [];
            for (let line of Array.from(lines.split('\n'))) {
              let tag = self.parseTagLine(line.trim(), ctx.lang);
              if (tag) result.push(tags.push(tag));
              else result.push(undefined);
            }
            return result;
          })();
        },
        // Ctags config file may has something wrong that lead to error info
        // TODO: error notification for better UX
        stderr(e) {
          console.error(e);
        },
        exit() {
          tags.sort(compare);

          tags2 = []

          let libraries = []
          let entitys = []
          let architectures = []
          let types = []
          let constants = []
          let signals = []
          let processs = []

          for (let i in tags) {
            if (tags[i].type == "libraries"){
              libraries.push(tags[i])
            }
            else if (tags[i].type == "entity"){
              entitys.push(tags[i])
            }
            else if (tags[i].type == "architecture"){
              architectures.push(tags[i])
            }
            else if (tags[i].type == "type"){
              types.push(tags[i])
            }
            else if (tags[i].type == "constant"){
              constants.push(tags[i])
            }
            else if (tags[i].type == "signal"){
              signals.push(tags[i])
            }
            else if (tags[i].type == "process"){
              processs.push(tags[i])
            }
          }

          /////////////////////////////////////////////////////////////////////
          let tagType = {
            name: "Types",
            kind: "title",
            type: "title",
            lineno: parseInt(10),
            parent: null
          }
          let tagConstant = {
            name: "Constants",
            kind: "title",
            type: "title",
            lineno: parseInt(10),
            parent: null
          }
          let tagSignal = {
            name: "Signals",
            kind: "title",
            type: "title",
            lineno: parseInt(10),
            parent: null
          }
          let tagProcess = {
            name: "Process",
            kind: "title",
            type: "title",
            lineno: parseInt(10),
            parent: null
          }
          /////////////////////////////////////////////////////////////////////


          let parent = 0
          let parentCore = 0
          //libraries
          for (let i in libraries) {
            tags2.push(libraries[i])
          }
          //entitys
          for (let i in entitys) {
            tags2.push(entitys[i])
          }
          //architectures
          for (let i in architectures) {
            tags2.push(architectures[i])
          }
          parentCore = tags2.length-1
          //types
          tagType.parent = parentCore
          tags2.push(tagType)
          parent = tags2.length-1
          for (let i in types) {
            types[i].parent = parent
            tags2.push(types[i])
          }
          // constants
          tagConstant.parent = parentCore
          tags2.push(tagConstant)
          parent = tags2.length-1
          for (let i in constants) {
            constants[i].parent = parent
            tags2.push(constants[i])
          }
          //signals
          tagSignal.parent = parentCore
          tags2.push(tagSignal)
          parent = tags2.length-1
          for (let i in signals) {
            signals[i].parent = parent
            tags2.push(signals[i])
          }
          //processs
          tagProcess.parent = parentCore
          tags2.push(tagProcess)
          parent = tags2.length-1
          for (let i in processs) {
            processs[i].parent = parent
            tags2.push(processs[i])
          }

          // Tag properties: name, kind, type, lineno, parent, id
          let count = 0;
          for (let i in tags2) {
            tags2[i].id = count;
            count++;
          }

          resolve({
            list: tags2,
            tree: null
          });
        }
      });
    });
  },
  parseTagLine(line, lang) {
    let sections = line.split('\t');
    if (sections.length > 3) {
      let tag = {
        name: sections[0],
        kind: sections[3],
        type: sections[3],
        lineno: parseInt(sections[2]),
        parent: null
      };
      // Not work for HTML at least
      if ((lang === 'Python') && (tag.type === 'member')) {
        tag.type = 'function';
      }
      return tag;
    } else {
      return null;
    }
  }

};


function compare(a,b) {
  if (a.lineno < b.lineno)
    return -1;
  if (a.lineno > b.lineno)
    return 1;
  return 0;
}

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

import TagGenerator from './tag-generator';
import $ from 'jquery';

let dispose = null;

function debounce(func = () => {}, duration = 50) {
  let timer = null;
  return function debounced (...args) {
    const context = this; //eslint-disable-line
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, duration);
  };
}

async function change(event) {
  if (atom.config.get('TerosHDL.general.type-analyzer')==false) return;
  if (dispose) dispose = dispose.dispose();

  const { cursor } = event;
  const Editor = atom.workspace.getActiveTextEditor();
  let scopeName = Editor.getGrammar().scopeName;

  if (scopeName!="source.vhdl") return;
  if (!Editor) return;

  const followCursor = atom.config.get('px-rem-tooltip.followCursor');
  const View = atom.views.getView(Editor);
  const selector = followCursor ? '.cursors .cursor' : '.cursor-line .syntax--source';
  const Node = View.querySelector(selector);
  const placement = followCursor ? 'auto bottom' : 'auto right';
  const ToolTipOptions = {
    placement: 'top',
    trigger: 'manual'
  };

  if (!(Node)) return;
  const multiplier = atom.config.get('px-rem-tooltip.fontSize');
  const numbers = [];

  let filePath = Editor.getPath();
  let tags = await new TagGenerator(filePath, scopeName).generate();
  let tagsList = tags.list

  selection = Editor.getWordUnderCursor()
  for (let i in tagsList) {
    if (tagsList[i].name==selection && tagsList[i].type=="signal"){
      lineS = Editor.lineTextForBufferRow(tagsList[i].lineno-1)
      typeS = lineS.substring(
                  lineS.lastIndexOf(":") + 1,
                  lineS.lastIndexOf(";")
              )
      ToolTipOptions.title = typeS
    }
  }
  dispose = atom.tooltips.add(Node, ToolTipOptions);
}

export function showType() {
    const { workspace } = atom;
    const { paneContainer } = workspace.getCenter();

    paneContainer.observeActivePaneItem(editor => {
      if (dispose) {
        dispose = dispose.dispose();

        return;
      }
      if (!editor || !('getCursors' in editor)) return;
      const [ cursor ] = editor.getCursors();
      return change({ cursor });
    });

    workspace.observeTextEditors(editor => {
      editor.observeCursors(cursor => cursor.onDidChangePosition(debounce(change)));
    });
}

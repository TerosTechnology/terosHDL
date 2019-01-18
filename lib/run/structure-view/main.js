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

import { CompositeDisposable } from 'atom';
import $ from 'jquery';
import StructureView from './structure-view';
import Util from './util';
import TagGenerator from './tag-generator';

let lastLine = [0,0]

export async function goto (stat) {
    let editor = atom.workspace.getActiveTextEditor();
    let filePath = editor.getPath();
    let scopeName = editor.getGrammar().scopeName;
    let tags = await new TagGenerator(filePath, scopeName).generate();
    let tagsList = tags.list

    lastLine = editor.getCursorBufferPosition()

    selection = editor.getWordUnderCursor()
    for (let i in tagsList) {
      if (tagsList[i].name==selection && tagsList[i].type=="signal"){
        editor.setCursorScreenPosition([tagsList[i].lineno-1,1])
      }
    }
}

export function back() {
  let editor = atom.workspace.getActiveTextEditor();
  editor.setCursorScreenPosition(lastLine)
}


export function showStructure (stat) {

  let editors = atom.workspace.getTextEditors();
  if (editors.length < 1 ||
    (editors.length === 1 && !editors[0].getPath())) return Util.alert('WARN', 'No file is opened!');

  if (!this.structureView) this.structureView = new StructureView();

  const rightDock = atom.workspace.getRightDock();
  try {
    // Whatever do these first for performance
    rightDock.getPanes()[0].addItem(this.structureView);
    rightDock.getPanes()[0].activateItem(this.structureView);
  } catch (e) {
    if (e.message.includes('can only contain one instance of item')) {
      this.handleOneInstanceError();
    }
  }

  // Sometimes dock title is hidden for somehow,
  // so force recalculate here to redraw
  $('ul.list-inline.tab-bar.inset-panel').height();

  if (!stat) {
    rightDock.toggle();
    this.structureView.vm.viewShow = !this.structureView.vm.viewShow;
  } else if ('on' === stat) {
    rightDock.show();
    this.structureView.vm.viewShow = true;
  } else if ('off' === stat) {
    rightDock.hide();
    this.structureView.vm.viewShow = false;
  }
  if (rightDock.isVisible()) this.structureView.initialize();
}

export function handleOneInstanceError() {
  let activePane = null;
  const rightDock = atom.workspace.getRightDock();
  atom.workspace.getPanes().forEach(pane => {
    pane.getItems().forEach(item => {
      if (item === this.structureView) activePane = pane;
    });
  });
  if (activePane) {
    activePane.destroyItem(this.structureView, true);
    this.structureView.destroy();
  }

  rightDock.getPanes()[0].addItem(this.structureView);
  rightDock.getPanes()[0].activateItem(this.structureView);
}

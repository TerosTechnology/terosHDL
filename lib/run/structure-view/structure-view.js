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


import Vue from 'vue';
import $ from 'jquery';
import fs from 'fs';
import path from 'path';
import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import TagGenerator from './tag-generator';
import TagParser from './tag-parser';
import Util from './util';

export default class StructureView {

  constructor() {
    const htmlString = fs.readFileSync(path.join(__dirname, 'templates', 'structure-view.html'), {
      encoding: 'utf-8'
    });
    this.element = $(htmlString).get(0);
    this.viewType = 'structureView';
    this.vm = new Vue({
      el: this.element,
      data: {
        treeNodeId: null,
        nodeSet: {},
        cursorListener: null,
        textEditorListener: null,
        editorSaveListener: {},
        viewLoading: true,
        noTagHint: null,
        lastFile: null,
        viewShow: false,
        CONFIG_DBLCLICK_TO_FOLD_TREE: true,
        CONFIG_SHOW_VARIABLES: true,
        CONFIG_SHOW_PROPERTIES: true
      },
      methods: {
        onToggleTreeNode(evt) {
          if (this.CONFIG_DBLCLICK_TO_FOLD_TREE) {
            Util.selectTreeNode($(evt.target), this, {
              toggle: true
            });
          }
        },
        onSelectTreeNode(evt) {
          // If double click is not enable, tree should be toggled by single click
          if (this.CONFIG_DBLCLICK_TO_FOLD_TREE) {
            Util.selectTreeNode($(evt.target), this, {
              toggle: false
            });
          } else {
            Util.selectTreeNode($(evt.target), this, {
              toggle: true
            });
          }
        },
        onToggleWholeTree(evt) {
          let val = evt.target.value;
          if (val === 'expand') {
            $('div.structure-view>div.tree-panel>ol>li').removeClass('collapsed');
          } else {
            $('div.structure-view>div.tree-panel>ol>li').addClass('collapsed');
          }
        },
        onClickGuide() {
          atom.workspace.open('atom://config/packages/structure-view').then(() => {
            document.getElementById('usage').scrollIntoView();
          });
        },
        onOpenSettingsTab() {
          atom.workspace.open('atom://config/packages/structure-view').then(() => {
            document.getElementsByClassName('section-heading icon-gear')[0].scrollIntoView()
          });
        }
      },
      created() {
        atom.config.onDidChange('structure-view.DoubleClickToFoldTreeView', ret => {
          this.CONFIG_DBLCLICK_TO_FOLD_TREE = true;
        });
        atom.config.onDidChange('structure-view.ShowVariables', ret => {
          this.CONFIG_SHOW_VARIABLES = true;
        });
        atom.config.onDidChange('structure-view.ShowProperties', ret => {
          this.CONFIG_SHOW_PROPERTIES = true;
        });
      },
      watch: {
        treeNodeId(val) {
          if (!this.lastFile) return;
          let position = this.nodeSet[val].position,
            // getActiveTextEditor can not get editor after click left tree when on windows before v1.8.0
            editor = atom.workspace.getTextEditors().find(i => {
              return i.getPath() === this.lastFile;
            });
          if (editor) {
            let row = position.row;
            // Blocks of code could be folded
            if (editor.isFoldedAtBufferRow(row)) editor.unfoldBufferRow(row);
            // Lines can be soft-wrapped
            if (editor.isSoftWrapped()) {
              editor.setCursorBufferPosition(position);
            } else {
              editor.setCursorScreenPosition(position);
            }
            editor.scrollToCursorPosition();
          }
        },
        viewLoading(val) {
          $(this.$el).find('.mask')[val ? 'show' : 'hide']();
        }
      }
    });
  }

  initialize() {
    this.vm.viewLoading = true;
    this.render();
    if (atom.config.get('structure-view.SelectTagWhenCursorChanged')) {
      this.listenOnCursorPositionChange();
    }
    this.listenOnTextEditorChange();
    this.listenOnTextEditorSave(atom.workspace.getActiveTextEditor());
  }

  async render(filePath) {
    let editor = atom.workspace.getActiveTextEditor();
    if (!filePath && editor) {
      filePath = editor.getPath();
    }
    if (filePath) {
      let scopeName = editor.getGrammar().scopeName;
      let tags = await new TagGenerator(filePath, scopeName).generate();
      if (tags.err) {
        this.vm.noTagHint = tags.err;
      } else {
        (new TagParser(tags, 'javascript')).parser();

        if (tags.list && Object.keys(tags.list).length > 0) {
          this.renderTree(tags.tree);
          this.vm.nodeSet = tags.list;
          this.vm.noTagHint = null;
        } else {
          this.vm.noTagHint = 'No tag in the file.';
        }
      }
      this.vm.lastFile = filePath;
    }
    else {
      this.vm.noTagHint = 'No file is opened.';
    }
    this.vm.viewLoading = false;
  }

  renderTree(nodes) {
    let html = this.treeGenerator(nodes);
    $('div.structure-view>div>ol').html(html);
  }

  listenOnCursorPositionChange() {
    const self = this,
      activeEditor = atom.workspace.getActiveTextEditor();
    if (activeEditor) {
      this.vm.cursorListener = activeEditor.onDidChangeCursorPosition(e => {
        let nRow = e.newScreenPosition.row;
        if (nRow !== e.oldScreenPosition.row) {
          let tag = _find(self.vm.nodeSet, item => {
            return item.position.row === nRow;
          });
          // Same node would not change view
          if (tag && tag.id !== self.treeNodeId) {
            let $tag = $(this.element).find(`li[node-id="${tag.id}"]`);
            if ($tag.length > 0) {
              // {top: 0, left: 0} means node is hidden
              // TODO: expand parent tree node
              if ($tag.offset().top === 0 && $tag.offset().left === 0) return;

              Util.selectTreeNode($tag, this);
              let ret = Util.getScrollDistance($tag, $(this.element));
              if (ret.needScroll) $(this.element).scrollTop(ret.distance);
            }
          }
        }
      });
    }
  }

  listenOnTextEditorChange() {
    if (this.vm.textEditorListener) return;

    const self = this;
    // ::onDidChangeActiveTextEditor API is only supported after 1.18.0
    const rightDock = atom.workspace.getRightDock();
    if (atom.appVersion >= '1.18') {
      this.vm.textEditorListener = atom.workspace.onDidChangeActiveTextEditor(editor => {
        if (
          self.vm.viewShow &&
          editor &&
          editor.element &&
          'ATOM-TEXT-EDITOR' === editor.element.nodeName
        ) {
          // Do not show view when view is hidden by user
          if (!rightDock.isVisible() && !self.vm.lastFile) rightDock.show();

          // For changed file
          self.render(editor.getPath());

          // Add save event listener
          self.listenOnTextEditorSave(editor);
        } else {
          rightDock.hide();
          self.vm.lastFile = '';
        }
      });
    } else {
      this.vm.textEditorListener = atom.workspace.onDidChangeActivePaneItem(editor => {
        // Ensure pane item is an edior
        if (
          self.vm.viewShow &&
          editor &&
          editor.element &&
          'ATOM-TEXT-EDITOR' === editor.element.nodeName
        ) {
          if (!rightDock.isVisible() && !self.vm.lastFile) rightDock.show();

          // Skip render if file is not changed and view has content
          if (self.vm.lastFile === editor.getPath() && !self.vm.noTagHint) return;

          self.render(editor.getPath());
          // Add save event listener
          self.listenOnTextEditorSave(editor);
        }
        // Do nothing if click SV itself
        else if (editor && 'structureView' === editor.viewType);
        // Do not close right dock if other item exists
        else if (rightDock.getPaneItems().length > 1) {
          self.render();
        } else {
          rightDock.hide();
          self.vm.lastFile = '';
        }
      });
    }
  }

  listenOnTextEditorSave(editor) {
    if (editor) {
      const listener = this.vm.editorSaveListener,
        self = this;
      if (!listener[editor.id]) listener[editor.id] = editor.onDidSave(i => {
        self.render(i.path);
      });
    }
  }

  treeGenerator(data) {
    const self = this;
    let array = [],
      letter;

    _forEach(data, item => {
      switch (item.type) {
        case 'architecture':   // VHDL
          letter = 'A';
          break;
        case 'sel':       // CSS
        case 'selector':  // LESS, SASS
          letter = 'S';
          break;
        case 'prop':      // CSS
          if (self.vm.CONFIG_SHOW_PROPERTIES) {
            letter = 'P';
          } else {
            return;
          }
          break;
        case 'elem':      // HTML
          letter = '';
          break;

        case 'constant':  // VHDL
        case 'class':     // JS
        case 'context':   // Ruby
          letter = 'C';
          break;
        case 'describe':  // Ruby
          letter = 'D';
          break;
        case 'entity':  // VHDL
          letter = 'E';
          break;
        case 'import':    // JS
          letter = 'I';
          break;
        case 'function':  // JS, C
          letter = 'F';
          break;
        case 'libraries': // VHDL
          letter = 'L';
          break;
        case 'method':    // JS
        case 'member':    // JSON, CSON, MARKDOWN
          letter = 'M';
          break;
        case 'var':       // JS
        case 'variable':  // C
        case 'macro':
          if (self.vm.CONFIG_SHOW_VARIABLES) {
            letter = 'V';
          } else {
            return;
          }
          break;
        case 'process':  // VHDL
          letter = 'P';
          break;
        case 'signal':  // VHDL
          letter = 'S';
          break;
        case 'type':  // VHDL
          letter = 'T';
          break;
        default:
          letter = 'U';
          break;
      }
      let iconTpl;
      if (item.type === 'elem') {
        iconTpl = `<span class="icon icon-code"></span>`;
      }
      else if (item.type === 'title'){
        iconTpl = `<div class="icon-circle icon-eye-watch"></div>`;
      }
      else if (item.type === 'libraries'){
        iconTpl = `<div class="icon-circle icon-package"></div>`;
      }
      else {
        iconTpl = `<div class="icon-circle icon-${letter}"><span>${letter}</span></div>`;
      }

      let entry = `<li node-id="${item.id}" class="list-item" title="${item.name}">
        <div class="symbol-mixed-block">
            ${iconTpl}
            <span>${item.name}</span>
        </div>
      </li>`;

      if (item.child) {
          let childContent = self.treeGenerator(item.child);

          if (childContent.length != 0) {
            entry = `<li node-id="${item.id}" class="list-nested-item expanded" title="${item.name}">
                        <div class="list-item symbol-mixed-block">
                            ${iconTpl}
                            <span>${item.name}</span>
                        </div>
                        <ol class="list-tree">${childContent}</ol>
                    </li>`;
          }
      }

      array.push(entry);

    });

    return array.join('');
  }

  serialize() {}

  destroy() {
    this.element.remove();
    if (this.vm.cursorListener) {
      this.vm.cursorListener.dispose();
      this.vm.cursorListener = null;
    }
    if (this.vm.textEditorListener) {
      this.vm.textEditorListener.dispose();
      this.vm.textEditorListener = null;
    }
    _forEach(this.vm.editorSaveListener, item => {
      item.dispose()
    });
    this.vm.editorSaveListener = {};
    // this.vm.$destroy();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    return 'Structure View';
  }
}

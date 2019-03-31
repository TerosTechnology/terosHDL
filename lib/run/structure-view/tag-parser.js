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

import { Point } from 'atom';
import _forEach from 'lodash/forEach';

export default class TagParser {
  constructor(tags, lang) {
    this.tags = tags;
    this.lang = lang;
  }

  parser() {
    if (this.tags.tree) {
      this.tags.list = {};
      this.treeToList(this.tags.list, this.tags.tree);
      return this.tags.tree;
    } else if (this.tags.list) {
      let res = {},
        data = this.tags.list;
      if (Object.keys(data).length === 0) return res;

      // Let items without parent as root node
      let childs = [],
        tagSet = {};
      _forEach(data, item => {
        item.position = new Point(item.lineno - 1);
        if (!item.parent) res[item.id] = item;
        else childs.push(item);
        tagSet[item.id] = item;
      });

      let missed = [];
      _forEach(childs, item => {
        // Save missed child if cannot find its parent in all tags
        if (!tagSet[item.parent]) missed.push(item);
        else {
          if (!tagSet[item.parent].child) tagSet[item.parent].child = {};
          tagSet[item.parent].child[item.id] = item;
        }
      });

      if (missed) {
        _forEach(missed, item => {
          res[item.id] = item;
        });
      }

      this.tags.tree = res;
    }
  }

  treeToList(list, tree) {
    const self = this;
    _forEach(tree, (item, index) => {
      if (item.child && Object.keys(item.child).length === 0) delete item.child;
      item.position = new Point(item.lineno - 1);
      list[index] = item;
      if (item.child) self.treeToList(list, item.child);
    });
  }
}

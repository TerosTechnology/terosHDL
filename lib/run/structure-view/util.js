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

import $ from 'jquery';

export default {
  getScrollDistance($child, $parent) {
    const viewTop = $parent.offset().top,
      viewBottom = viewTop + $parent.height(),
      scrollTop = $parent.scrollTop(),
      // scrollBottom = scrollTop + $parent.height(),
      elemTop = $child.offset().top,
      elemBottom = elemTop + $child.height();

    const ret = {
      needScroll: true,
      distance: 0
    };
    // Element is upon or under the view
    if ((elemTop < viewTop) || (elemBottom > viewBottom)) ret.distance = scrollTop + elemTop - viewTop;
    else ret.needScroll = false;

    return ret;
  },

  selectTreeNode($target, vm, opts) {
    if ($target.is('span')) $target = $target.parent();
    if ($target.is('div')) $target = $target.parent();
    if ($target.is('li')) {
      // ".toggle" would be TRUE if it's double click
      if (opts && opts.toggle) {
        $target.hasClass('list-nested-item') && $target[$target.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed');
      }
      let oldVal = vm.treeNodeId,
        val = $target.attr('node-id');

      // Same node
      if (oldVal === val) return;

      oldVal && $('div.structure-view>div.tree-panel>ol').find('li.selected').removeClass('selected');
      $target.addClass('selected');
      vm.treeNodeId = val;
    }
  },

  notify(title, msg) {
    atom.notifications.addInfo(title, { detail: msg, dismissable: true });
  },

  alert(title, msg) {
    atom.confirm({
      message: title,
      detailedMessage: msg,
      buttons: {
        Close: function() {
          return;
        }
      }
    });
  }
};

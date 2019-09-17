"use babel"

// Copyright 2019
// Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo,
// Alfredo Enrique Sáez Pérez de la Lastra
//
// This file is part of TerosHDL.
//
// TerosHDL is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TerosHDL is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TerosHDL.  If not, see <https://www.gnu.org/licenses/>.

import { CompositeDisposable, Disposable } from 'atom';

const pathLib = require('path')
const fs = require('fs')
const ViewNavbar = require('./views/Navbar')
const ViewTree   = require('./views/Tree')
const Manager    = require('./manager')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')
import ConfigView from './config-view'
import TestView from './test-view'

var projectPath = ""

var project = {
  'path' : "",
  'src'  : [],
  'tb'   : []
}
var elementNodes = []

export default class TreeView {
   constructor({
      idView,
      defaultLocation
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.idView    = idView
      this.element = document.createElement('div')
      this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewNavbar()
      this.element.innerHTML += ViewTree()
      this.config = null;

      this.getTitle = () => 'TerosHDL manager',
         this.getURI = () => 'atom://terosHDL/manager' + this.idView
      this.getAllowedLocations = () => ['left']

      //Variables
      this.path = "";

      // Command registry
      this.x = 0;
      this.y = 0;
      document.onmousemove = this.handleMouseMove;
      atom.commands.add('atom-workspace',
        'terosHDL:manager:delete-src',() => this.deleteItem()
      );
      atom.commands.add('atom-workspace',
        'terosHDL:manager:add-src',() => this.addSource()
      );
      atom.commands.add('atom-workspace',
        'terosHDL:manager:add-tb',() => this.addTb()
      );
      document.addEventListener('contextmenu', ()   => this.clickRigthUl(event))
      atom.contextMenu.add({
        "atom-workspace": [
          {
            command: 'terosHDL:manager:add-src',
            label: "Add src file",
            shouldDisplay: function(event) {
              var activePane = atom.workspace.getActivePane();
              var item = activePane.itemForURI('atom://terosHDL/manager'+idView);
              if (item == activePane.getActiveItem())
                return true;
              else
                return false;
            }
          },
          {
            command: 'terosHDL:manager:add-tb',
            label: "Add tb file",
            shouldDisplay: function(event) {
              var activePane = atom.workspace.getActivePane();
              var item = activePane.itemForURI('atom://terosHDL/manager'+idView);
              if (item == activePane.getActiveItem())
                return true;
              else
                return false;
            }
          },
          {
            command: 'terosHDL:manager:delete-src',
            label: "Delete file",
            shouldDisplay: function(event) {
              var activePane = atom.workspace.getActivePane();
              var item = activePane.itemForURI('atom://terosHDL/manager'+idView);
              if (item == activePane.getActiveItem())
                return true;
              else
                return false;
            }
          }
        ]
      });

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
   }
   selectHtml() {
      return {
         btn: {
            loadProject: this.element.querySelector('#btn-load-project'),
            saveProject: this.element.querySelector('#btn-save-project'),
            addSource: this.element.querySelector('#btn-add-source'),
            addTb: this.element.querySelector('#btn-add-tb'),
            configuration: this.element.querySelector('#btn-configuration'),
            play: this.element.querySelector('#btn-play')
         },
         tree: {
            srcTree: this.element.querySelector('#tree-src'),
            tbTree : this.element.querySelector('#tree-tb')
         }
      }
   }
   setEvents(){
     this.html.btn.loadProject.addEventListener('click', ()   => this.loadProject())
     this.html.btn.saveProject.addEventListener('click', ()   => this.saveProject())
     this.html.btn.addSource.addEventListener('click', ()     => this.addSource())
     this.html.btn.addTb.addEventListener('click', ()         => this.addTb())
     this.html.btn.configuration.addEventListener('click', () => this.configuration())
     this.html.btn.play.addEventListener('click', () => this.play())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   loadProject(){
     const element = this;
     const homedir = require('os').homedir();
     dialog.showOpenDialog(
       {
         defaultPath: homedir,
         filters: [
           { name: 'TerosHDL project', extensions: ['trs'] }
         ]
       },
       function (path) {
         if(path == undefined)
          return;
         element.deleteAllTree();
         project['path'] = path[0];
         var src = Manager.getSrc(path[0]);
         project['src'] = src;
         element.refreshTree(src,element.html.tree.srcTree);
         var tb = Manager.getTb(path[0]);
         project['tb'] = tb;
         element.refreshTree(tb,element.html.tree.tbTree);
       }
     );
   }
   saveProject(){
     const element = this;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         properties: ['openFile'],
         defaultPath: homedir+pathLib.sep+'prj.trs'
       },
       function (path) {
         if(path == undefined)
           return;
         Manager.saveProject(path,project['src'],project['tb']);
       }
     );
   }
   addSource(){
     const element = this;
     const homedir = require('os').homedir();
     dialog.showOpenDialog(
       {
         properties: ['openFile', 'multiSelections'],
         defaultPath: homedir
       },
       function (src) {
         if(src == undefined)
          return;
         project['src'] = project['src'].concat(src);
         element.refreshTree(src,element.html.tree.srcTree);

       }
     );
   }
   addTb(){
     const element = this;
     const homedir = require('os').homedir();
     dialog.showOpenDialog(
       {
         properties: ['openFile', 'multiSelections'],
         defaultPath: homedir
       },
       function (src) {
         if(src == undefined)
           return;
         project['tb'] = project['tb'].concat(src);
         element.refreshTree(src,element.html.tree.tbTree);
       }
     );
   }

   configuration(){
     if (this.config == null)
       this.config = new ConfigView({});
     var panel = atom.workspace.addModalPanel({item: this.config});
     this.config.cancelConfig = () => panel.destroy();
     this.config.saveConfig = () => {
       this.config.config = {
         'suite' : this.config.html.select.suite.value,
         'simulator' : this.config.html.select.simulator.value,
         'language' : this.config.html.select.language.value
       }
       panel.destroy();
     }
   }

   refreshTree(items,node){
     for (i=0;i<items.length;++i)
       this.addNodeTree(items[i],node);
   }

   addNodeTree(item,node){
     var nodeUl   = document.createElement("ul");
     nodeUl.className = "list-tree";
     elementNodes.push(nodeUl);
     var nodeLi   = document.createElement("li");
     nodeLi.className = "list-item";
     var nodeSpan = document.createElement("span");
     nodeSpan.className        = "icon icon-file-text " + node.textContent;
     nodeSpan.textContent = item;
     nodeSpan.addEventListener('dblclick', function (e) {
       // atom.workspace.open("atom://text-editor?file="+this.textContent,{split: 'right'})
       // alert(this.textContent);
     });
     nodeUl.appendChild(nodeLi);
     nodeLi.appendChild(nodeSpan);
     node.appendChild(nodeUl);
   }

   deleteAllTree(){
     for(var i=0;i<elementNodes.length;++i) {
       elementNodes[i].remove();
     }
     elementNodes = [];
   }

  clickRigthUl(event){
    this.x = event.clientX, this.y = event.clientY;
  }

  play(){
    // alert(this.config.getConfig()["suite"])
    var view = new TestView({});
    // var panel = atom.workspace.addBottomPanel({item: view});
    var panel = atom.workspace.open(view,{split: 'rigth'})
  }

  deleteItem(){
    elementMouseIsOver = document.elementFromPoint(this.x, this.y);
    if(elementMouseIsOver.className.includes("Testbenchs"))
      var type = "tb";
    else
      var type = "src";
    for (var i=0;i<project[type].length; ++i){
      if(project[type][i] == elementMouseIsOver.textContent){
        elementMouseIsOver.parentElement.remove();
        project[type].splice(i, 1);
      }
    }
  }

}

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
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')
import ConfigView from './config-view'
import TestView from './test-view'
import Logger from '../../logger/logger'

var projectPath = ""

var project = {
  'path' : "",
  'src'  : [],
  'tb'   : [],
  'config':{
    'suite':'',
    'tool':'',
    'language':'',
    'name':'',
    'top_level':'',
    'working_dir':'',
    'gtkwave':''
  }
}

var projectManager;

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
      //Add context menu
      document.addEventListener('contextmenu', ()   => this.clickRigthUl(event))
      atom.contextMenu.add({
        "atom-workspace": [
          {
            command: 'terosHDL:manager:add-src',
            label: "Add source file",
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
            label: "Add testbench file",
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
      // Create project manager.
      projectManager = new jsTeros.ProjectManager.ProjectManager();

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
      //Test view
      this.testView  = new TestView({});
   }
   selectHtml() {
      return {
         btn: {
            loadProject: this.element.querySelector('#btn-load-project'),
            saveProject: this.element.querySelector('#btn-save-project'),
            clear: this.element.querySelector('#btn-clear'),
            addSource: this.element.querySelector('#btn-add-source'),
            addTb: this.element.querySelector('#btn-add-tb'),
            configuration: this.element.querySelector('#btn-configuration'),
            play: this.element.querySelector('#btn-play'),
            stop: this.element.querySelector('#btn-stop')
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
     this.html.btn.clear.addEventListener('click', ()   => this.clear())
     this.html.btn.addSource.addEventListener('click', ()     => this.addSource())
     this.html.btn.addTb.addEventListener('click', ()         => this.addTb())
     this.html.btn.configuration.addEventListener('click', () => this.configuration())
     this.html.btn.play.addEventListener('click', () => this.play())
     this.html.btn.stop.addEventListener('click', () => this.stop())
     // document.addEventListener('keydown', () => this.keyPress())
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
         projectManager.loadProject(path[0]);
         element.refreshTree(projectManager.getSourceName(),element.html.tree.srcTree);
         element.refreshTree(projectManager.getTestbenchName(),element.html.tree.tbTree);
       }
     );
   }
   saveProject(){
     if (this.config != null)
       project['config'] = this.config.getConfig();
     const element = this;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         filters: [
           { name: 'TerosHDL project', extensions: ['trs'] }
         ],
         properties: ['openFile'],
         defaultPath: homedir+pathLib.sep+'prj.trs'
       },
       function (path) {
         if(path == undefined)
           return;
         projectManager.saveProject(path,project);
       }
     );
   }
   clear(){
     this.deleteAllTree();
     projectManager.clear();
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
         projectManager.addSource(src);
         element.refreshTree(projectManager.getSourceName(),element.html.tree.srcTree);
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
         projectManager.addTestbench(src);
         element.refreshTree(projectManager.getTestbenchName(),element.html.tree.tbTree);
       }
     );
   }

   configuration(){
     var element = this;
     var server = atom.config.get("TerosHDL.general.server-ip");
     var port = atom.config.get("TerosHDL.general.server-port");
     projectManager.getSuites().then(function(resp){
       if (resp['result']['CODE'] != jsTeros.Simulators.Codes.CODE_RESPONSE['SUCCESSFUL']['CODE']){
         console.log("Error: " + resp['result']['description']);
         Logger.logError(resp['result']['TITLE'],resp['result']['DESCRIPTION']);
         return;
       }
       if(element.config == null)
         element.config = new ConfigView(project['config'],resp);
       else
         element.config.setDefaults(project['config']);
       var panel = atom.workspace.addModalPanel({item: element.config});
       element.config.cancelConfig = () => panel.destroy();
       element.config.saveConfig = () => {
         element.config.config = {
           'suite' : element.config.html.select.suite.value,
           'tool' : element.config.html.select.simulator.value,
           'language' : element.config.html.select.language.value,
           'name' : element.config.html.text.testName.value,
           'top_level' : element.config.html.text.topLevel.value,
           'working_dir' : element.config.html.text.workingDirectory.value,
           'gtkwave': element.config.gtkwave
         }
         panel.destroy();
       }
     });
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
     nodeLi.addEventListener("click", function(element){
       if (this.className == "list-item")
         this.className = "list-item selected";
       else
         this.className = "list-item";
     });

     var nodeSpan = document.createElement("span");
     nodeSpan.className        = "icon icon-file-text " + node.textContent;
     nodeSpan.textContent = item;
     nodeSpan.addEventListener('dblclick', function (e) {
       atom.workspace.open(this.textContent);
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
    if (this.config != null)
      project['config'] = this.config.getConfig();
    this.testView.showLoading();
    var element = this;
    this.testPanel = atom.workspace.open(element.testView,{split: 'rigth',activatePane:true})
    projectManager.simulate(
      atom.config.get("TerosHDL.general.server-ip"),
      atom.config.get("TerosHDL.general.server-port")
    ).then(function(response) {
      console.log(response)
      element.testView.draw(response['result'],project['config']['gtkwave']);
    }, function() {
      // failed
    });
  }

  stop(){
    this.testView.draw();
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


  keyPress(e){
    var activePane = atom.workspace.getActivePane();
    var item = activePane.itemForURI('atom://terosHDL/manager'+this.idView);
    if (item == activePane.getActiveItem())
      alert(e);
  }

  deleteSelected(nodeName){
    for(var i=0;i<elementNodes.length;++i) {
      if(elementNodes[i].textContent==nodeName)
        elementNodes[i].remove();
    }
  }

}

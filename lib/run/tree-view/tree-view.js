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
import ListTests from './list-test'
import TestView from './test-view'
import Logger from '../../logger/logger'

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
const DEFAULT_CONFIG = "default.json";

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
      atom.views.getView(atom.workspace).addEventListener('keydown', (e) => this.keyPress(e))

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
      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
      // Create project manager.
      projectManager = new jsTeros.ProjectManager.Manager();
      if (fs.existsSync(DEFAULT_CONFIG)){
        projectManager.loadProject(DEFAULT_CONFIG);
        this.updateTree();
      }
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
            stop: this.element.querySelector('#btn-stop'),
            listTests: this.element.querySelector('#btn-list-tests')
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
     this.html.btn.listTests.addEventListener('click', () => this.listTests())
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
         projectManager.loadProject(path[0]);
         console.log(projectManager.getSourceName());
         element.refreshTree(projectManager.getSourceName(),element.html.tree.srcTree);
         element.refreshTree(projectManager.getTestbenchName(),element.html.tree.tbTree);
         projectManager.saveProject(DEFAULT_CONFIG);
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
     projectManager.saveProject(DEFAULT_CONFIG);
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
         projectManager.saveProject(DEFAULT_CONFIG);
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
         projectManager.saveProject(DEFAULT_CONFIG);
       }
     );
   }

   configuration(){
     var element = this;
     var server = atom.config.get("TerosHDL.general.server-ip");
     var port = atom.config.get("TerosHDL.general.server-port");
     projectManager.getSuites(server,port).then(function(resp){
       if (resp['result']['CODE'] != jsTeros.Simulators.Codes.CODE_RESPONSE['SUCCESSFUL']['CODE']){
         console.log("Error: " + resp['result']['DESCRIPTION']);
         Logger.logWarning(resp['result']['TITLE'],resp['result']['DESCRIPTION']);
         return;
       }
       if(element.config == null)
         element.config = new ConfigView(projectManager.getConfig(),resp['data']);
       else
         element.config.setDefaults(projectManager.getConfig());

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
         var configurator = new jsTeros.ProjectManager.Configurator;
         configurator.setSuite(element.config.html.select.suite.value);
         configurator.setTool(element.config.html.select.simulator.value);
         configurator.setLanguage(element.config.html.select.language.value);
         configurator.setName(element.config.html.text.testName.value);
         configurator.setTopLevel(element.config.html.text.topLevel.value);
         configurator.setWorkingDir(element.config.html.text.workingDirectory.value);
         projectManager.setConfiguration(configurator);
         projectManager.saveProject(DEFAULT_CONFIG);
         panel.destroy();
       }
     });
   }

   listTests(){

     var list_test = new ListTests();
     var panel = atom.workspace.addModalPanel({item: list_test});

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
    console.log(projectManager.getEdamFormat())
    projectManager.simulate(
      atom.config.get("TerosHDL.general.server-ip"),
      atom.config.get("TerosHDL.general.server-port")
    ).then(function(response) {
      element.testView.draw(response['data']['result'],project['config']['gtkwave']);
    }, function() {
      // failed
    });
  }

  stop(){
    this.testView.draw();
  }

  deleteItem(){
    //Chek if files checked and delete
    var removedSources = [];
    var removedTestbenches = [];
    for (var i=0;i<elementNodes.length;++i){
      var child = elementNodes[i].childNodes[0];
      var className = child.className;
      var parentID = elementNodes[i].parentNode.id;
      if (parentID == "tree-src" && className.includes("selected"))
        removedSources.push(child.textContent);
      else if (parentID == "tree-tb" && className.includes("selected"))
        removedTestbenches.push(child.textContent);
    }
    if (removedSources.length>0 || removedTestbenches.length>0){
      projectManager.deleteSource(removedSources);
      projectManager.deleteTestbench(removedTestbenches);
      this.updateTree();
      projectManager.saveProject(DEFAULT_CONFIG);
      return;
    }
    //If no file checked delete item
    elementMouseIsOver = document.elementFromPoint(this.x, this.y);
    if(elementMouseIsOver.className.includes("Testbenchs")){
      projectManager.deleteTestbench([elementMouseIsOver.textContent]);
    }
    else if (elementMouseIsOver.className.includes("Sources")){
      projectManager.deleteSource([elementMouseIsOver.textContent]);
    }
    this.updateTree();
    projectManager.saveProject(DEFAULT_CONFIG);
  }

  updateTree(){
    this.deleteAllTree();
    this.refreshTree(projectManager.getSourceName(),this.html.tree.srcTree);
    this.refreshTree(projectManager.getTestbenchName(),this.html.tree.tbTree);
  }

  keyPress(e){
    var activePane = atom.workspace.getActivePane();
    var item = activePane.itemForURI('atom://terosHDL/manager'+this.idView);
    if (item == activePane.getActiveItem() && e.keyCode==46){
      this.deleteItem();
    }
  }

  deleteSelected(nodeName){
    for(var i=0;i<elementNodes.length;++i) {
      if(elementNodes[i].textContent==nodeName)
        elementNodes[i].remove();
    }
  }

}

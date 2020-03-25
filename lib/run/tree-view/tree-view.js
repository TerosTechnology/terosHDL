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
import DependenciesView from '../dependencies-view/dependencies-view'
import ProjectManager from './tree'

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

      //Dependencies view
      this.viewDependencies = new DependenciesView({
          filename: "filename",
          str: "str",
          workspace: atom.workspace
      })

      this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
         this.subscriptions.add(textEditor.buffer.onWillSave(this.handleDidSave.bind(this)));
       }));

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
      atom.commands.add('atom-workspace',
        'terosHDL:manager:set-top',() => this.setTop()
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
              var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
              if (item == activePane.getActiveItem() || item_dependencies == activePane.getActiveItem())
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
              var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
              if (item == activePane.getActiveItem() || item_dependencies == activePane.getActiveItem())
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
              var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
              if (item == activePane.getActiveItem() || item_dependencies == activePane.getActiveItem())
                return true;
              else
                return false;
            }
          },
          {
            command: 'terosHDL:manager:set-top',
            label: "Set top",
            shouldDisplay: function(event) {
              var activePane = atom.workspace.getActivePane();
              var item = activePane.itemForURI('atom://terosHDL/manager'+idView);
              var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
              if (item == activePane.getActiveItem() || item_dependencies == activePane.getActiveItem())
                return true;
              else
                return false;
            }
          }
        ]
      });
      // wait for the html to be appended
      this.html = this.selectHtml();
      this.setEvents();
      // Create project manager.
      projectManager = new ProjectManager(this.html.tree.srcTree,this.html.tree.tbTree,DEFAULT_CONFIG,this.viewDependencies.get_graph());
      if (fs.existsSync(DEFAULT_CONFIG)){
        projectManager.load_project(DEFAULT_CONFIG);
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
            listTests: this.element.querySelector('#btn-list-tests'),
            saveDocMarkdown: this.element.querySelector('#btn-save-doc-markdown'),
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
     this.html.btn.saveDocMarkdown.addEventListener('click', () => this.saveDocMarkdown())
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
         projectManager.load_project(path[0]);
         // element.regenerate();
       }
     );
   }
   saveProject(){
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
         projectManager.save_project(path);
       }
     );
   }
   clear(){
     projectManager.clear_project();
   }
   addSource(){
     const element = this;
     const editor = atom.workspace.getActiveTextEditor();
     var defaultPath;
     if (editor == null)
       defaultPath = require('os').homedir();
     else
       defaultPath = editor.getPath();
     dialog.showOpenDialog(
       {
         properties: ['openFile', 'multiSelections'],
         defaultPath: defaultPath
       },
       function (src) {
         if(src == undefined)
          return;
         projectManager.add_source(src);
         // element.regenerate();
       }
     );
   }
   addTb(){
     const element = this;
     const editor = atom.workspace.getActiveTextEditor();
     var defaultPath;
     if (editor == null)
       defaultPath = require('os').homedir();
     else
       defaultPath = editor.getPath();
     dialog.showOpenDialog(
       {
         properties: ['openFile', 'multiSelections'],
         defaultPath: defaultPath
       },
       function (src) {
         if(src == undefined)
           return;
         projectManager.add_testbench(src);
         // element.regenerate();
       }
     );
   }
   saveDocMarkdown(){
     const element = this;
     const editor = atom.workspace.getActiveTextEditor();
     var defaultPath;
     if (editor == null)
       defaultPath = require('os').homedir();
     else
       defaultPath = pathLib.dirname(editor.getPath());
     dialog.showOpenDialog(
       {
         properties: ['openDirectory'],
         defaultPath: defaultPath
       },
       function (dir) {
         if(dir == undefined)
           return;
         let include_dependency_graph = atom.config.get("TerosHDL.documenter.include-dependency-graph");
         let symbol_vhdl = atom.config.get("TerosHDL.documenter.vhdl-comment-symbol");
         let symbol_verilog = atom.config.get("TerosHDL.documenter.verilog-comment-symbol")
         projectManager.save_md_doc(dir,symbol_vhdl,symbol_verilog,include_dependency_graph);
       }
     );
   }
   deleteItem(){
     var activePane = atom.workspace.getActivePane();
     var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
     if (item_dependencies == activePane.getActiveItem()){
       var elementMouseIsOver = document.elementFromPoint(this.x, this.y);
       var childs = elementMouseIsOver.parentElement.childNodes;
       for (var i=0;i<childs.length;++i){
         if (childs[i].nodeName == 'title'){
           projectManager.delete_file(childs[i]['innerHTML']);
           // this.regenerate();
           return;
         }
       }
     }
     projectManager.delete_selected_items(this.x,this.y);
   }

   setTop(){
     var activePane = atom.workspace.getActivePane();
     var item_dependencies = activePane.itemForURI('atom://terosHDL/dependencies');
     if (item_dependencies == activePane.getActiveItem()){
       var elementMouseIsOver = document.elementFromPoint(this.x, this.y);
       var childs = elementMouseIsOver.parentElement.childNodes;
       for (var i=0;i<childs.length;++i){
         if (childs[i].nodeName == 'title'){
           projectManager.set_top_from_file(childs[i]['innerHTML']);
           return;
         }
       }
       return;
     }
     var file_name = projectManager.get_file_from_position(this.x,this.y);
     projectManager.set_top_from_file(file_name);
   }

   configuration(){
     var element = this;
     var server = atom.config.get("TerosHDL.general.server-ip");
     var port = atom.config.get("TerosHDL.general.server-port");
     projectManager.get_avaiable_config(server,port).then(function(config){
       if (config == undefined)
         return;

       if(element.config == null)
         element.config = new ConfigView(projectManager.get_config(),config);
       else
         element.config.setDefaults(projectManager.get_config());

       var old_config = projectManager.get_config();
       var panel = atom.workspace.addModalPanel({item: element.config});
       element.config.cancelConfig = () => panel.destroy();
       element.config.saveConfig = () => {
         config_ing = {
           'suite' : element.config.html.select.suite.value,
           'tool' : element.config.html.select.simulator.value,
           'language' : element.config.html.select.language.value,
           'name' : element.config.html.text.testName.value,
           'top_level' : element.config.html.text.topLevel.value,
           'top_level_file' : old_config['top_level_file'],
           'working_dir' : element.config.html.text.workingDirectory.value,
           'gtkwave': element.config.gtkwave
         }
         element.config.config = config_ing;
         projectManager.set_config(config_ing);
         panel.destroy();
       }
     });
   }

   handleDidSave(event) {
     let path = require('path')
     let saved_file = event.path;
     projectManager.refresh(saved_file);
   }

   listTests(){
     var list_test = new ListTests();
     var panel = atom.workspace.addModalPanel({item: list_test});
   }

  clickRigthUl(event){
    this.x = event.clientX, this.y = event.clientY;
  }

  play(){
    var config = projectManager.get_config();
    this.testView.showLoading();
    var element = this;
    this.testPanel = atom.workspace.open(element.testView,{split: 'rigth',activatePane:true})
    projectManager.simulate(
      atom.config.get("TerosHDL.general.server-ip"),
      atom.config.get("TerosHDL.general.server-port")
    ).then(function(response) {
      element.testView.draw(response,config['gtkwave']);
    }, function() {
      // failed
    });
  }

  stop(){
    this.testView.draw();
  }

  keyPress(e){
    var element = this;
    var activePane = atom.workspace.getActivePane();
    var item = activePane.itemForURI('atom://terosHDL/manager'+this.idView);
    if (item == activePane.getActiveItem() && e.keyCode==46){
      projectManager.delete_selected_items();
      // element.regenerate();
    }
  }

  dependenciesGraph(){
    // var all_sources  = projectManager.get_all_sources();
    projectManager.generate_dependency_graph();
    atom.workspace.open(this.viewDependencies,{split: 'down'})
    // this.viewDependencies.generate(all_sources,atom.workspace);
  }
}

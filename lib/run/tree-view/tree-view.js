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
      this.html = this.selectHtml();
      this.setEvents();
      // Create project manager.
      projectManager = new ProjectManager(this.html.tree.srcTree,this.html.tree.tbTree,DEFAULT_CONFIG);
      if (fs.existsSync(DEFAULT_CONFIG)){
        projectManager.load_project(DEFAULT_CONFIG);
        // projectManager.loadProject(DEFAULT_CONFIG);
        // this.updateTree();
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
         // element.deleteAllTree();
         projectManager.load_project(path[0]);
         // element.updateTree();
         // projectManager.saveProject(DEFAULT_CONFIG);
         element.regenerate();
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
         projectManager.save_project(path);
       }
     );
   }
   clear(){
     // this.deleteAllTree();
     // projectManager.clear();
     // projectManager.saveProject(DEFAULT_CONFIG);
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
         // projectManager.addSource(src);
         // element.updateTree();
         // projectManager.saveProject(DEFAULT_CONFIG);
         projectManager.add_source(src);
         element.regenerate();
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
         // projectManager.addTestbench(src);
         // element.updateTree();
         // projectManager.saveProject(DEFAULT_CONFIG);
         projectManager.add_testbench(src);
         element.regenerate();
       }
     );
   }

   deleteItem(){
     projectManager.delete_selected_items(this.x,this.y);
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

  keyPress(e){
    var activePane = atom.workspace.getActivePane();
    var item = activePane.itemForURI('atom://terosHDL/manager'+this.idView);
    if (item == activePane.getActiveItem() && e.keyCode==46){
      projectManager.delete_selected_items();
    }
  }

  dependenciesGraph(){
    var src = projectManager.getSourceName();
    var tb  = projectManager.getTestbenchName();
    var all_sources = src.concat(tb);

    this.viewDependencies = new DependenciesView({
        filename: "filename",
        str: "str",
        workspace: atom.workspace
    })
    atom.workspace.open(this.viewDependencies,{split: 'down'})
    this.viewDependencies.generate(all_sources,atom.workspace);
  }

  regenerate(){
    if (this.viewDependencies == undefined)
      return;
    var src = projectManager.getSourceName();
    var tb  = projectManager.getTestbenchName();
    var all_sources = src.concat(tb);
    this.viewDependencies.generate(all_sources);
  }

}

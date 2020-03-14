'use babel';

// Copyright 2018
// Ismael Pérez Rojo (ismaelprojo@gmail.com)
// Carlos Alberto Ruiz Naranjo (carlosruiznaranjo@gmail.com)
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

// import pipeline from 'when/pipeline';
import { CompositeDisposable } from "atom"
import { packageName } from './utils/package-helper';
import {magicEditor} from "./run/vhdlEditor/main"
import { createRun } from './run/create/run-py'
import { showStructure, goto, back } from './run/structure-view/main'
import { getStateMachineVhdl } from './run/state-machine/main'
import { showType } from './run/structure-view/show-type'
import { imageTemplate } from './run/documenter/main'
import packageConfigLinux   from './config/config-schema.json'
import packageConfigWindows from './config/config-schema-windows.json'
import {linter} from './run/linter/main'
import {treeView} from './run/tree-view/main'
import {setToolbar} from './toolbar'
import {beautify} from './run/beautify/beautify'
import { dependenciesView } from './run/dependencies-view/main'

const jsteros = require('jsteros');

let Emitter = null;
let fs = null;
let settings = null;
let utilities = null;
let path = null;
let _s = null;
let url = null;
let errorParser = null;
let libraryManager = null;
let semver = null;
let compilationContext = null;

let buttonComponent
let buttonCoverage
let toolBar
let consolepanel

var os = require('os');
if (os.platform == "win32"){
  var packageConfig = packageConfigWindows;
}
else{
  var packageConfig = packageConfigLinux;
}

export default {
  config: packageConfigLinux,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.workspace.observeTextEditors(textEditor => {
       this.subscriptions.add(textEditor.buffer.onWillSave(this.handleDidSave.bind(this)));
     }));

    // Register commands
    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "TerosHDL:initialize-project": () => treeView(),
      //////////////////////////////////////////////////////////////////////////
      "TerosHDL:copy-as-component": () => magicEditor(jsteros.Templates.Codes.TYPES.COMPONENT,
                                                      jsteros.Templates.Codes.TYPESCOMPONENTS.COMPONENT),
      "TerosHDL:copy-as-instance": () => magicEditor(jsteros.Templates.Codes.TYPES.COMPONENT,
                                                      jsteros.Templates.Codes.TYPESCOMPONENTS.INSTANCE),
      "TerosHDL:copy-as-signals": () => magicEditor(jsteros.Templates.Codes.TYPES.COMPONENT,
                                                    jsteros.Templates.Codes.TYPESCOMPONENTS.SIGNALS),
      "TerosHDL:copy-as-tb": () => magicEditor(jsteros.Templates.Codes.TYPES.TESTBENCH,
                                               jsteros.Templates.Codes.TYPESTESTBENCH.GENERAL),
      "TerosHDL:copy-as-tb-vunit": () => magicEditor(jsteros.Templates.Codes.TYPES.TESTBENCH,
                                                     jsteros.Templates.Codes.TYPESTESTBENCH.VUNIT),
      "TerosHDL:copy-as-tb-cocotb": () => magicEditor(jsteros.Templates.Codes.TYPES.COCOTB),
      "TerosHDL:copy-as-tb-verilator": () => magicEditor(jsteros.Templates.Codes.TYPES.VERILATOR),
      //////////////////////////////////////////////////////////////////////////
      "TerosHDL:create-run": () => createRun(),
      //////////////////////////////////////////////////////////////////////////
      "TerosHDL:copy-as-image": () => imageTemplate(),
      "TerosHDL:dependencies-view": () => treeView("dependencies"),
      "TerosHDL:info": () => this.info(),
      "TerosHDL:repo": () => this.repo(),
      "TerosHDL:donate": () => this.donate(),
      "TerosHDL:show-structure": () => showStructure(),
      "TerosHDL:goto": () => goto(),
      "TerosHDL:return": () => back(),
      "TerosHDL:state-machine": () => getStateMachineVhdl(),
      //////////////////////////////////////////////////////////////////////////
      "TerosHDL:beautify": () => beautify()
    }))

    // Install packages we depend on
    require('atom-package-deps').install(packageName(), true);

    this.provideBuilder = () => BuildProvider;

    messages = []

    // Create promises for consumed services
    this.profilesPromise = new Promise((resolve, reject) => this.profilesResolve = resolve);
    activatePromise = Promise.all([
      this.profilesPromise,

      new Promise((resolve, reject) => this.statusBarResolve = resolve),
      new Promise((resolve, reject) => this.toolBarResolve = resolve),
      new Promise((resolve, reject) => this.consolePanelResolve = resolve)
    ]).then(() => {
      return this.ready();
    });
    showType();
    
    return activatePromise;
  },

  deactivate() {
    if (toolBar) {
      toolBar.removeItems();
      toolBar = null;
    }
    this.subscriptions.dispose()
  },

  serialize() {},

  handleDidSave(event) {
    var path = require('path')
    var savedFile = event.path;
    if (atom.config.get("TerosHDL.beautifuler.on-save") == true && path.extname(savedFile) == ".vhd")
      beautify(savedFile);
  },

  //*****************************************************************************
  //*****************************************************************************
  consumeToolBar(getToolBar) {
    toolBar = getToolBar('TerosHDL');
    toolbar = setToolbar(toolBar);
    this.toolBarResolve(toolBar);
  },

  consumeConsolePanel(consolePanel) {
    consolepanel = consolePanel;

    this.consolePanelResolve(this.consolePanel);
  },
  //*****************************************************************************
  //*****************************************************************************
  provideLinter() {
     return linter();
  },

 //*****************************************************************************
 //*****************************************************************************
 info() {
   const {shell} = require('electron')
   shell.openExternal("https://github.com/TerosTechnology/terosHDL/tree/develop/doc/User_Manual.md")
 },

 repo() {
   const {shell} = require('electron')
   shell.openExternal("http://www.terostech.com/")
 },

 donate() {
   const {shell} = require('electron')
   shell.openExternal("http://www.terostech.com/teroshdl")
 },

};

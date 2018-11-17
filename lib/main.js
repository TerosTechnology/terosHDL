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
import { exec } from 'child-process-promise'
import packageConfig from './config/config-schema.json'
import {runTest,showCoverage,runConfig, runClean} from "./run/simulator/main"
import {copyBase,componentTemplate, docPorts,instanceTemplate, signalsTemplate, tbTemplate} from "./run/vhdlEditor/main"
import { createRun } from './run/create/run-py'
import { initProject } from './run/create/init-project'
import { runTestArgs } from './run/simulator/main'
import { showStructure, goto, back } from './run/structure-view/main'
import { stateMachine } from './run/state-machine/main'
import { showType } from './run/structure-view/show-type'
import { imageTemplate } from './run/symbolator/main'
import { axilite } from './run/axilite/main'

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
let scrollMarker

export default {
	config: packageConfig,

	activate(state) {
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register commands
    this.subscriptions.add(atom.commands.add("atom-workspace", {
			"TerosHDL:initialize-project": () => initProject(),
      "TerosHDL:copy-as-component": () => copyBase("Component", componentTemplate),
      "TerosHDL:copy-as-instance": () => copyBase("Instance", instanceTemplate),
      "TerosHDL:copy-as-signals": () => copyBase("Signals",signalsTemplate),
      "TerosHDL:copy-as-image": () => imageTemplate(),
			"TerosHDL:doc-ports": () => copyBase("DocPorts", docPorts),
      "TerosHDL:copy-as-tb": () => copyBase("Tb", tbTemplate),
      "TerosHDL:create-run": () => createRun(),
			"TerosHDL:axilite": () => axilite(),
      "TerosHDL:run-test": () => runTest(buttonCoverage,consolepanel),
			"TerosHDL:run-config": () => runConfig(buttonCoverage,consolepanel),
			"TerosHDL:run-clean": () => runClean(consolepanel),
      "TerosHDL:show-coverage": () => showCoverage(),
			"TerosHDL:info": () => this.info(),
			"TerosHDL:repo": () => this.repo(),
			"TerosHDL:marker": () => this.marker(),
			"TerosHDL:show-structure": () => showStructure(),
			"TerosHDL:goto": () => goto(),
			"TerosHDL:return": () => back(),
			"TerosHDL:switch-simulator": () => this.switchSimulator(),
			"TerosHDL:state-machine": () => stateMachine()
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
		showType()
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

	//*****************************************************************************
  //*****************************************************************************
  //*****************************************************************************
  //*****************************************************************************
  //*****************************************************************************

	consumeToolBar(getToolBar) {
  	toolBar = getToolBar('TerosHDL');

		toolBar.addButton({
	    text: '<b>Teros</b>HDL',
	    html: true,
	    callback: 'TerosHDL:repo',
			priority: 210
	  });

		//Spacer
		toolBar.addSpacer({
			priority: 220 })

		//Initialize project
		buttonComponent = toolBar.addButton({
			 icon: 'file-code',
			 tooltip: 'Initialize project/Add module',
			 callback: 'TerosHDL:initialize-project',
			 priority: 225
		 });

		//Component
		buttonComponent = toolBar.addButton({
		   text: '<b>C</b>',
		   html: true,
			 tooltip: 'Copy as component',
			 callback: 'TerosHDL:copy-as-component',
			 priority: 230
		 });

		//Instance
		toolBar.addButton({
 		  text: '<b>I</b>',
 		  html: true,
			tooltip: 'Copy as instance',
			callback: 'TerosHDL:copy-as-instance',
 			priority: 240
 		});

		//Signal
		toolBar.addButton({
		  text: '<b>S</b>',
		  html: true,
			tooltip: 'Copy as signal',
			callback: 'TerosHDL:copy-as-signals',
			priority: 250
		 });

		//Testbenchcopy-as-component
		toolBar.addButton({
 		  text: '<b>Tb</b>',
 		  html: true,
			tooltip: 'Copy as testbench',
			callback: 'TerosHDL:copy-as-tb',
 			priority: 260
 		});

		//Vunit
		toolBar.addButton({
 		  text: '<b>V</b>',
 		  html: true,
			tooltip: 'Create VUnit file',
			callback: 'TerosHDL:create-run',
 			priority: 270
 		});

		//axilite
		toolBar.addButton({
 		  text: 'axi',
 		  html: true,
			callback: 'TerosHDL:axilite',
 			priority: 275
 		});

		//Spacer
		toolBar.addSpacer({
			priority: 280 })

		//Run test
		toolBar.addButton({
			icon: 'play',
			tooltip: 'Run test',
			callback: 'TerosHDL:run-test',
			iconset: 'ion',
			priority: 290
		})

		//Run config
		toolBar.addButton({
			icon: 'gear',
			tooltip: 'Simulation config',
			callback: 'TerosHDL:run-config',
			priority: 296
		})

		//Run clean
		toolBar.addButton({
			icon: 'sync',
			tooltip: 'Recompile',
			callback: 'TerosHDL:run-clean',
			priority: 298
		})

		//Show coverage
		buttonCoverage = toolBar.addButton({
			icon: 'graph',
			callback: 'TerosHDL:show-coverage',
			tooltip: 'Show code coverage',
			priority: 300
		})

		//Switch simulator
		toolBar.addButton({
			icon: 'zap',
			callback: 'TerosHDL:switch-simulator',
			tooltip: 'Switch simulator',
			priority: 305
		})

		//Spacer
		toolBar.addSpacer({
			priority: 310 })

		//Diagram
		toolBar.addButton({
			icon: 'file-media',
			callback: 'TerosHDL:copy-as-image',
			tooltip: 'Copy as diagram',
			priority: 320
		})

		//Doc
		toolBar.addButton({
			icon: 'book',
			callback: 'TerosHDL:doc-ports',
			tooltip: 'Copy as doc.',
			priority: 325
		})

		//Spacer
		toolBar.addSpacer({
			priority: 330 })

		//Info
		toolBar.addButton({
			icon: 'info',
			tooltip: 'Help',
			callback: 'TerosHDL:info',
			priority: 360
		})

		this.toolBarResolve(toolBar);
	},

	consumeConsolePanel(consolePanel) {
		consolepanel = consolePanel;

		this.consolePanelResolve(this.consolePanel);
	},

	consumeScrollMarker(scrollMarkerAPI) {
		scrollMarker = scrollMarkerAPI;
	},

 //*****************************************************************************
 //*****************************************************************************
 //*****************************************************************************
 //*****************************************************************************
 //*****************************************************************************
	marker(){
	},
 info() {
	 const {shell} = require('electron')
	 shell.openExternal("https://github.com/TerosTechnology/terosHDL")
 },

 repo() {
	 const {shell} = require('electron')
	 shell.openExternal("https://github.com/qarlosalberto/TerosHDL")
 },

	switchSimulator(){
		if (atom.config.get('TerosHDL.general.simulator')=="modelsim"){
			atom.config.set('TerosHDL.general.simulator',"ghdl")
		}
		else{
			atom.config.set('TerosHDL.general.simulator',"modelsim")
		}
		atom.notifications.addInfo("Current simulator: " + atom.config.get('TerosHDL.general.simulator'))
	}

};

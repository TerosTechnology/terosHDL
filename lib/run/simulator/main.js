"use babel"

// Copyright 2018 Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
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

import { exec } from 'child-process-promise';
import { dirname } from 'path';
import {$, CompositeDisposable} from "atom";
import path from "path";
import { showBetterMessageBox } from 'electron-better-dialog';
import { runSimulator } from './runSimulator';
import { runTestArgsI } from './run-args';

export function runTest(buttonCoverage,consolepanel) {
  let gtkwave = false
  if (atom.config.get('TerosHDL.others.sim-display-mode') == "gtkwave"){
    gtkwave = true
  }
  let params = atom.config.get('TerosHDL.others.sim-args')
  let gtkwaveFile = atom.config.get('TerosHDL.others.sim-gtkwave-file-out')
  let gtkwaveOutput = atom.config.get('TerosHDL.others.sim-gtkwave-output')
  runSimulator(buttonCoverage,consolepanel,gtkwave,params,gtkwaveFile,gtkwaveOutput)
}

export function runConfig(buttonCoverage,consolepanel) {
  runTestArgsI(true)
}

export function runClean(consolepanel) {
  const item = atom.config.get('TerosHDL.others.sim-runpy')
    if ( item == ""){
      atom.notifications.addInfo("Please, select a run.py file in config menu :)")
      return
    }
    if ( path.extname(item)!= ".py"){
      atom.notifications.addInfo("Please, select a correct run.py file in config menu :)")
      return
    }

  pathXML    = item
  dir        = path.dirname(pathXML)
  file       = path.basename(pathXML)

  var modelsim_path = "export VUNIT_MODELSIM_PATH=" + atom.config.get('TerosHDL.modelsim.modelsim-path')
  var modelsim_ini  = "export VUNIT_MODELSIM_INI="  + atom.config.get('TerosHDL.modelsim.modelsim-ini')
  var simulator = "export VUNIT_SIMULATOR=" + atom.config.get('TerosHDL.general.simulator')
  var command = modelsim_path + ";" + modelsim_ini + ";" + simulator + "; cd " + dir + "; python " + file + " --clean --compile --exit-0 --no-color --verbose"
  var shell = require('shelljs');

  consolepanel.clear()

  atom.notifications.addInfo("Cleaning...")
  var child = shell.exec(command, {async:true}, function(code, stdout, stderr) {
    if (code==0){
      atom.notifications.addInfo("Cleaned!")
    }
    else{
      atom.notifications.addError("Error in simulation!")
    }
  });
  child.stdout.on('data', function(data) {
    consolepanel.notice(data)
  });
}

export function showCoverage() {
  if (atom.config.get('TerosHDL.general.simulator') != "ghdl"){
    atom.notifications.addError("Code coverage only supported with ghdl with gcc backend!")
    return
  }
  const item = atom.config.get('TerosHDL.others.sim-runpy')
  dir_py        = path.dirname(item)
  dir           = dir_py +'/'+ atom.config.get('TerosHDL.ghdl.sim-coverage-report-folder')

  const {BrowserWindow} = require('electron').remote
  const electron = require('electron')
  const {WINDOW_WIDTH, WINDOW_HEIGHT} = electron.screen.getPrimaryDisplay().workAreaSize
  let win = new BrowserWindow(
    {
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      autoHideMenuBar: true
    }
  )
  win.on('closed', () => {
    win = null
  })
  win.maximize()

  // Load a remote URL
  win.loadURL('file://' + dir + '/index.html')
}

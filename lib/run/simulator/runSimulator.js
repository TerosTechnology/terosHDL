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
import { simulatorView } from './simulator-view';
import { pslView } from './psl-view';

var childp = "none"
var running = false
var stop = false

export function runSimulator(buttonCoverage,consolepanel,gtkwave,params,gtkwaveFile,gtkwaveOutput) {
  item = atom.config.get('TerosHDL.others.sim-runpy')
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

  var nameTests = " " + atom.config.get('TerosHDL.others.sim-tests')
  //Exports
  var exp       = ""
  var more      = ""
  var folderSep = ""
  var os = require('os');
  if (os.platform == "win32"){
    exp  = "SET "
    more = "&&"
    folderSep = "\\"
  }
  else{
    exp  = "export "
    more = ";"
    folderSep = "/"
  }
  var checkPath = "";
  if (atom.config.get('TerosHDL.general.simulator') == "ghdl"){
    const fs = require('fs');
    checkPath = atom.config.get('TerosHDL.ghdl.ghdl-path') + folderSep + "ghdl"
    if (fs.existsSync(checkPath)) {
      console.log("ghdl ok");
    }
    else{
      atom.notifications.addWarning("Please, configure correctly your ghdl path.");
      return;
    }
  }
  if (atom.config.get('TerosHDL.general.simulator') == "modelsim"){
    const fs = require('fs');
    checkPath = atom.config.get('TerosHDL.modelsim.modelsim-ini')
    if (fs.existsSync(checkPath)) {
      console.log("modelsim-ini ok");
    }
    else{
      atom.notifications.addWarning("Please, configure correctly your modelsim-ini path.");
      return;
    }
  }
  if (atom.config.get('TerosHDL.general.simulator') == "modelsim"){
    const fs = require('fs');
    if (os.platform == "win32"){
      checkPath = atom.config.get('TerosHDL.modelsim.modelsim-path') + folderSep + "vsim"
    }
    else{
      checkPath = atom.config.get('TerosHDL.modelsim.modelsim-path')
    }
    if (fs.existsSync(checkPath)) {
      console.log("modelsim ok");
    }
    else{
      atom.notifications.addWarning("Please, configure correctly your modelsim path.");
      return;
    }
  }

  var modelsim_path = exp + "VUNIT_MODELSIM_PATH=" + atom.config.get('TerosHDL.modelsim.modelsim-path')
  var modelsim_ini  = exp + "VUNIT_MODELSIM_INI="  + atom.config.get('TerosHDL.modelsim.modelsim-ini')
  var simulator     = exp + "VUNIT_SIMULATOR=" + atom.config.get('TerosHDL.general.simulator')
  var ghdlPath      = exp + "VUNIT_GHDL_PATH=" + atom.config.get('TerosHDL.ghdl.ghdl-path')
  //Exec
  if (gtkwave == false){
    var command = modelsim_path + more + modelsim_ini + more + simulator + more + " cd " + dir + more + " python " + file + " -x out.xml --exit-0  --no-color --verbose " + params + nameTests
  }
  else if (atom.config.get('TerosHDL.general.simulator')=="modelsim"){
    var command = modelsim_path + more + modelsim_ini + more + simulator + more + ghdlPath + more + " cd " + dir + more + " python " + file + " -x out.xml --exit-0 --no-color --verbose " + params + nameTests
  }
  else {
    var command = modelsim_path + more + modelsim_ini + more + simulator + more + ghdlPath + more + " cd " + dir + more +" python " + file + " --gtkwave-fmt " + gtkwaveOutput + " -x out.xml --exit-0 --no-color --verbose " + params + nameTests
  }

  var shell = require('shelljs');
  consolepanel.clear()
  atom.notifications.addInfo("Testing...")
  shell.rm('-rf', dir + folderSep+ "out.xml");

  running = true
  stop = false
  childp = shell.exec(command, {async:true}, function(code, stdout, stderr) {

    if (code==0){
      simulatorView(dir+folderSep+"out.xml",dir+folderSep+"vunit_out"+folderSep+"test_output",gtkwaveFile,gtkwaveOutput)
      if(atom.config.get('TerosHDL.ghdl.psl-support')==true){
        pslView(dir)
      }
    }
    else{
      if (stop == false){
        atom.notifications.addError("Error in simulation!")
      }
      else{
        stop = false
      }
    }
    running = false
  });

  childp.stdout.on('data', function(data) {
    consolepanel.notice(data)
  });
  childp.stderr.on('data', function(data) {
    consolepanel.notice(data)
  });

}

export function stopTest() {
  var os = require('os');
  if (running = true){
    stop = true
    if (os.platform == "win32"){
      var cmd = "TASKKILL /F /T /PID  " + (childp.pid)
    }
    else{
      var pathKill = path.resolve(__dirname, 'bin/kill.sh')
      var cmd = "bash " + pathKill + " " + (childp.pid)
    }
    var shell = require('shelljs');
    exec(cmd, {async:true}, function(error, stdout, stderr) {
      atom.notifications.addSuccess("Stopped successfully.")
    })
  }
}

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
    alert("Please, select a run.py file in config menu :)")
    return
  }
  if ( path.extname(item)!= ".py"){
    alert("Please, select a correct run.py file in config menu :)")
    return
  }

  pathXML    = item
  dir        = path.dirname(pathXML)
  file       = path.basename(pathXML)

  var nameTests = " " + atom.config.get('TerosHDL.others.sim-tests')
  var modelsim_path = "export VUNIT_MODELSIM_PATH=" + atom.config.get('TerosHDL.modelsim.modelsim-path')
  var modelsim_ini  = "export VUNIT_MODELSIM_INI="  + atom.config.get('TerosHDL.modelsim.modelsim-ini')
  var simulator = "export VUNIT_SIMULATOR=" + atom.config.get('TerosHDL.general.simulator')
  if (gtkwave == false){
    var command = modelsim_path + ";" + modelsim_ini + ";" + simulator + "; cd " + dir + "; python " + file + " -x ./out.xml --exit-0  --no-color --verbose " + params + nameTests
  }
  else if (atom.config.get('TerosHDL.general.simulator')=="modelsim"){
    var command = modelsim_path + ";" + modelsim_ini + ";" + simulator + "; cd " + dir + "; python " + file + " -x ./out.xml --exit-0 --no-color --verbose " + params + nameTests
  }
  else {
    var command = modelsim_path + ";" + modelsim_ini + ";" + simulator + "; cd " + dir + "; python " + file + " --gtkwave-fmt " + gtkwaveOutput + " -x ./out.xml --exit-0 --no-color --verbose " + params + nameTests
  }
  var shell = require('shelljs');
  consolepanel.clear()

  atom.notifications.addInfo("Testing...")
  shell.rm('-rf', dir + "/out.xml");
  running = true
  childp = shell.exec(command, {async:true}, function(code, stdout, stderr) {
    if (code==0){
      simulatorView(dir+"/out.xml",dir+"/vunit_out/test_output",gtkwaveFile,gtkwaveOutput)
      if(atom.config.get('TerosHDL.ghdl.psl-support')==true){
        pslView(dir)
      }
    }
    else{
      if (stop = false){
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

}

export function stopTest() {
  if (running = true){
    stop = true
    var pathKill = path.resolve(__dirname, 'bin/kill.sh')
    cmd = "bash " + pathKill + " " + (childp.pid)
    var shell = require('shelljs');
    exec(cmd, {async:true}, function(error, stdout, stderr) {
      atom.notifications.addSuccess("Stopped successfully.")
    })
  }
}

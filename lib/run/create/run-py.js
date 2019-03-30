'use babel';

// Copyright 2019 Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
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

import fs from 'fs';
import path from 'path';

let listModule
let listTb
let src_files_array = []
let tb_files_array = []

class CreateRun {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/run-py.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.vunit-template').cloneNode(true);

    // Find important nodes
    this.nameText = this.element.querySelector('.name-text');
    this.nameText.onkeyup = () => this.deleteKey(event)

    listModule = this.element.querySelector('.list-module');
    this.moduleSourcesButton = this.element.querySelector('.module-sources-button');
    this.clearButtonSrc = this.element.querySelector('.clean-button-src');

    listTb = this.element.querySelector('.list-tb');
    this.tbSourcesButton = this.element.querySelector('.tb-sources-button');
    this.clearButtonTb = this.element.querySelector('.clean-button-tb');

    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');

    // this.modeSelect = this.element.querySelector('.mode-select');

    //checks
    this.checkXilinx    = this.element.querySelector('.vunit-xilinx');
    this.checkXilinx.onchange = () => {
      if(this.checkComplex.checked==true){
        this.checkXilinx.checked = false
      }
    };
    this.checkPreCheck  = this.element.querySelector('.vunit-pre-check');
    this.checkPreCheck.onchange = () => {
      if(this.checkComplex.checked==true){
        this.checkPreCheck.checked = false
      }
    };
    this.checkPostCheck = this.element.querySelector('.vunit-post-check');
    this.checkPostCheck.onchange = () => {
      if(this.checkComplex.checked==true){
        this.checkPostCheck.checked = false
      }
    };
    this.checkUVVM      = this.element.querySelector('.vunit-uvvm');
    this.checkUVVM.onchange = () => {
      if(this.checkComplex.checked==true){
        this.checkUVVM.checked = false
      }
    };
    this.checkComplex   = this.element.querySelector('.vunit-complex');
    this.checkComplex.onchange = () => {
      if(this.checkComplex.checked==true){
        this.checkXilinx.checked = false
        this.checkPreCheck.checked = false
        this.checkPostCheck.checked = false
        this.checkUVVM.checked = false
      }
    };

    this.checkIeee      = this.element.querySelector('.vunit-ieee');
    this.checkSynopsis  = this.element.querySelector('.vunit-synopsys');
    this.checkpsl       = this.element.querySelector('.vunit-psl');


    //Controls
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.doInitButton.disabled = false
    this.cancelButton = this.element.querySelector('.controls .cancel');

    tb_files_array = []
    src_files_array = []

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    //-------- Set handlers
    this.clearButtonSrc.onclick = () => {
      src_files_array = []
      listModule.value = ""
    };
    this.clearButtonTb.onclick = () => {
      tb_files_array = []
      listTb.value = ""
    };

    //-- Module button
    this.moduleSourcesButton.onclick = () => {
      this.getSrc()
    };

    //-- Tb button
    this.tbSourcesButton.onclick = () => {
      this.getTb()
    };

    //-- Directory, other button
    this.otherDirectoryButton.onclick = () => {
      this.getOut()
    };

    //-- Initialize button
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = 'Initializing...';
      //this.doInitButton.disabled = true;
      this.createRun()
      this.handleInit()
    };

    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor


  handleInit() {}
  handleCancel() {}

  deleteKey(event) {
    //Delete key
    if (event.keyCode == 8){
      this.nameText.value = this.nameText.value.slice(0,-1)
    }
  }

  getElement() {
    return this.element;
  }

  getDirectory() {
    return this.directorySelect.value;
  }

  getName() {
    return this.nameText.value;
  }

  // getMode() {
  //   return this.modeSelect.value;
  // }

  getChecks(){
    let checks = {
      xilinx: this.checkXilinx.checked,
      postCheck: this.checkPostCheck.checked,
      preCheck: this.checkPreCheck.checked,
      uvvm : this.checkUVVM.checked,
      complex : this.checkComplex.checked,
      ieee : this.checkIeee.checked,
      synopsis : this.checkSynopsis.checked,
      psl : this.checkpsl.checked
    }
    return checks
  }

  destroy() {
    this.element.remove();
  }

  // ***************************************************************************

  getSrc() {
    const item = atom.workspace.getActivePaneItem()
    if (item == null || atom.workspace.isTextEditor(item) == false){
      p          = ""
      dir        = ""
    }
    else{
      p          = item.getPath();
      dir        = path.dirname(p)
    }

    const {dialog} = require('electron').remote
    dialog.showOpenDialog(
      {
        defaultPath: dir,
        properties: ['openFile', 'multiSelections'],
      },
      this.getSrcDialog
    );
  }

  getSrcDialog(filenames){
    var i = 0;
    for (i in filenames){
      src_files_array.push(filenames[i])
    }

    i = 0
    var text = ""
    for (i in src_files_array) {
        text += src_files_array[i] + "\n";
    }
    listModule.value = text
  }

  // ***************************************************************************

  getTb() {
    const item = atom.workspace.getActivePaneItem();
    if (item == null || atom.workspace.isTextEditor(item) == false){
      p          = ""
      dir        = ""
    }
    else{
      p          = item.getPath();
      dir        = path.dirname(p)
    }

    const {dialog} = require('electron').remote
    dialog.showOpenDialog(
      {
        defaultPath: dir,
        properties: ['openFile', 'multiSelections']
      },
      function (filenames) {
        var i = 0;
        for (i in filenames){
          tb_files_array.push(filenames[i])
        }

        i = 0
        var text = ""
        for (i in tb_files_array) {
            text += tb_files_array[i] + "\n";
        }
        listTb.value = text
      }
    );
  }

  // ***************************************************************************

  getOut() {
    const item = atom.workspace.getActivePaneItem();
    if (item == null || atom.workspace.isTextEditor(item) == false){
      p          = ""
      dir        = ""
    }
    else{
      p          = item.getPath();
      dir        = path.dirname(p)
    }

    const {dialog} = require('electron').remote
    dialog.showOpenDialog(
      {
        defaultPath: dir,
        properties: ['openDirectory']
      },
      function (directory) {
        this.out_directory = directory
      }
    );
  }

  // ***************************************************************************


  createRun() {

    var src_files = ""
    var tb_files  = ""
    var name = this.getName()
    var checks = this.getChecks()

    var commandChecks = ""

    if (checks.xilinx == true){
      commandChecks += " --xilib "
    }
    if (checks.postCheck == true){
      commandChecks += " --poscheck "
    }
    if (checks.preCheck == true){
      commandChecks += " --precheck "
    }
    if (checks.uvvm == true){
      commandChecks += " --uvvm "
    }
    if (checks.complex == true){
      commandChecks += " --complex "
    }
    if (checks.ieee == true){
      commandChecks += " --disableIeeeWarnings"
    }
    if (checks.synopsis == true){
      commandChecks += " --synopsysLibraries"
    }
    if (checks.psl == true){
      commandChecks += " --pslSupport"
    }
    ////////////////////////////////////////////////////////////////////////////
    var ghdl_uvvm = atom.config.get('TerosHDL.ghdl.ghdl-uvvm')
    if (ghdl_uvvm == "" ){
      ghdl_uvvm = "/"
    }
    var modelsim_uvvm = atom.config.get('TerosHDL.modelsim.modelsim-uvvm')
    if (modelsim_uvvm == "" ){
      modelsim_uvvm = "/"
    }
    var ghdl_ise = atom.config.get('TerosHDL.ghdl.ghdl-xlib-vivado')
    if (ghdl_ise == "" ){
      ghdl_ise = "/"
    }
    var ghdl_vivado = atom.config.get('TerosHDL.ghdl.ghdl-xlib-vivado')
    if (ghdl_vivado == "" ){
      ghdl_vivado = "/"
    }
    var modelsim_vivado = atom.config.get('TerosHDL.modelsim.modelsim-xlib-vivado')
    if (modelsim_vivado == "" ){
      modelsim_vivado = "/"
    }


    var commandLibraries = ""

    commandLibraries += " --uvvmGhdlPath "            + ghdl_uvvm
    commandLibraries += " --uvvmModelsimPath "        + modelsim_uvvm

    commandLibraries += " --xilibIseGhdlPath "        + ghdl_ise

    commandLibraries += " --xilibVivadoGhdlPath "     + ghdl_vivado
    commandLibraries += " --xilibVivadoModelsimPath " + modelsim_vivado

    var path = require('path');
    //src
    var text_out = out_directory[0]
    for (var x = 0; x < src_files_array.length; x++) {
      src_files += path.relative(text_out,src_files_array[x]) + " "
    }
    //tb
    for (var x = 0; x < tb_files_array.length; x++) {
      tb_files += path.relative(text_out,tb_files_array[x]) + " "
    }

    var commandCore   = ""
    var commandComplex   = ""
    var commandDirectory = " --outPath " + out_directory
    var commandRun = "terosHdlRunpy"
                   + " --src "  + src_files
                   + " --tb "   + tb_files

    commandCore = " --name " + name
    commandFilename = " --filename " + name
    var commandLanguage = " --lang " + atom.config.get('TerosHDL.general.hdl-language')
    var command = commandRun + commandDirectory + commandCore + commandFilename + commandLanguage + commandChecks + commandLibraries

    var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec(command, puts);

    atom.notifications.addSuccess(name + " created.")
  }

} //-- End class


export function createRun() {

  //-- Open the new project panel
  var view = new CreateRun();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  //-- Cancel button pressed: finish
  view.handleCancel = () => panel.destroy();

  //-- Initialize button pressed: both board and project folder has been
  //-- selected
  view.handleInit = () => {
    //-- Close the new project panel
    panel.destroy();
  };


} //-- Init project

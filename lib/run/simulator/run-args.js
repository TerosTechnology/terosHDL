'use babel';

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

import fs from 'fs';
import path from 'path';
import { runSimulator } from './runSimulator'

let listGtkw

class InitProjectView {

  constructor() {

  this.gtkwaveOutput = "ghw"
  this.gtkwaveFile = ""

  const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/run-args.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.apio-template-root').cloneNode(true);

    // Find important nodes
    this.nameText = this.element.querySelector('.name-text');
    this.nameText.value = atom.config.get('TerosHDL.others.sim-args')
    this.nameText.onkeyup = () => this.deleteKey(event)

    this.modeSelect = this.element.querySelector('.mode-select');
    this.modeSelect.value = atom.config.get('TerosHDL.others.sim-display-mode')

    this.gtkwaveOutputSelect = this.element.querySelector('.gtkwave-output-select');
    this.gtkwaveOutputSelect.value = atom.config.get('TerosHDL.others.sim-gtkwave-output')

    this.clearButton = this.element.querySelector('.clean-button');

    this.divGtkwave = this.element.querySelector('.gtkwave-select');
    this.divGtkwaveOut = this.element.querySelector('.gtkwave-output');

    listGtkw = this.element.querySelector('.list-gtkw');
    listGtkw.value = atom.config.get('TerosHDL.others.sim-gtkwave-file-out')
    this.gtkwButton = this.element.querySelector('.gtkw-button');

    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.doInitButton.disabled = false
    this.cancelButton = this.element.querySelector('.controls .cancel');

    if(atom.config.get('TerosHDL.others.sim-display-mode')=="terminal"){
      this.divGtkwave.style.display = "none"
      this.divGtkwaveOut.style.display = "none"
    }
    else if (atom.config.get('TerosHDL.general.simulator')=="modelsim") {
      this.divGtkwave.style.display = "block"
      this.divGtkwaveOut.style.display = "none"
    }
    
    //-- Selecti button
     this.modeSelect.onchange = () => {
      if(this.modeSelect.value=="terminal"){
        this.divGtkwave.style.display = "none"
        this.divGtkwaveOut.style.display = "none"
      }
      else if (atom.config.get('TerosHDL.general.simulator')=="modelsim") {
        this.divGtkwave.style.display = "block"
        this.divGtkwaveOut.style.display = "none"
      }
      else{
        this.divGtkwave.style.display = "block"
        this.divGtkwaveOut.style.display = "block"
      }
    };
    //-- Select output gtkwave button
    this.gtkwaveOutputSelect.onchange = () => {
      this.gtkwaveOutput = this.gtkwaveOutputSelect.value
    };
    //-- Clear button
    this.clearButton.onclick = () => {
      listGtkw.value = ""
      // atom.config.set('TerosHDL.others.sim-gtkwave-file') = "none"
    };
    //-- Module button
    this.gtkwButton.onclick = () => {
      this.getFile()
    };
    //-- Initialize button
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = 'Initializing...';
      this.doInitButton.disabled = false;
      this.handleInit();
    };
    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor

  handleInit() {}
  handleCancel() {
  }

  deleteKey(event) {
    //Delete key
    if (event.keyCode == 8){
      this.nameText.value = this.nameText.value.slice(0,-1)
    }
  }

  getFile() {
    const item = atom.workspace.getActivePaneItem();
    if (item == null){
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
        properties: ['openFile'],
      },
      this.getFileDialog
    );
  }

  getFileDialog(filename){
    listGtkw.value = filename
    this.gtkwaveFile = filename
  }

  getElement() {
    return this.element;
  }

  getName() {
    return this.nameText.value;
  }

  getGtkwaveFile() {
    return listGtkw.value;
  }

  getGtkwaveOutput() {
    return this.gtkwaveOutput;
  }

  getDisplayMode() {
    return this.modeSelect.value;
  }

  destroy() {
    this.element.remove();
  }

} //-- End class


export function runTestArgsI(buttonCoverage,consolepanel) {
  var view = new InitProjectView();
  var panel = atom.works
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  view.handleCancel = () => {
    panel.destroy();
  }

  view.handleInit = () => {
    let args = view.getName()
    let display = view.getDisplayMode()
    let gtkwaveOutput = view.getGtkwaveOutput()
    let file = view.getGtkwaveFile()

    atom.config.set('TerosHDL.others.sim-args', args)
    atom.config.set('TerosHDL.others.sim-display-mode', display)
    atom.config.set('TerosHDL.others.sim-gtkwave-output', gtkwaveOutput)
    atom.config.set('TerosHDL.others.sim-gtkwave-file-out', file)

    //-- Close the new project panel
    panel.destroy();
  };

} //-- Init project

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

class InitProjectView {

  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/init-project.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.apio-template-root').cloneNode(true);

    // Find important nodes
    this.nameText = this.element.querySelector('.name-text');
    this.nameText.onkeyup = () => this.deleteKey(event)

    this.modeSelect = this.element.querySelector('.mode-select');
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');

    //-------- Set handlers

    //-- Directory, other button
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
      });
    };

    //-- Initialize button
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = 'Initializing...';
      //this.doInitButton.disabled = true;
      this.handleInit();
    };

    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();

  } //-- End constructor

  updateInitButtonDisabled() {
    const directorySelected = this.directorySelect.value.toString().length > 0;
    this.doInitButton.disabled = !directorySelected;
  }

  addDirectories(directories, activeDir) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (dir == activeDir) {
        option.selected = true;
      }
      this.directorySelect.appendChild(option);
    }
    if (directories.length > 0) {
      this.updateInitButtonDisabled();
    }
  }

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

  getMode() {
    return this.modeSelect.value;
  }

  destroy() {
    this.element.remove();
  }

} //-- End class


export function initProject() {

  console.log("Init Project")

  //-- Open the new project panel
  var view = new InitProjectView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  //------------------- Set buttons handlers

  //-- Cancel button pressed: finish
  view.handleCancel = () => panel.destroy();

  //-- Initialize button pressed: both board and project folder has been
  //-- selected
  view.handleInit = () => {

    var projectPath = view.getDirectory()
    var name = view.getName()
    var mode = view.getMode()

    var shell = require('shelljs');
    var fs = require('fs');
    if (mode == "initRepo"){
      if (fs.existsSync(projectPath+"/" + name + "/.git")) {
        command = "cd " + projectPath + "; mkdir " + name + "; cd " + name + ";" + "terosHDLrepo " + "--core " + name
      }
      else{
        command = "cd " + projectPath + "; mkdir " + name + "; cd " + name + ";" + "git init; " + "terosHDLrepo " + "--core " + name
      }
      alert("Project initialized")
    }
    else{}

    shell.exec(command, {async:false}, function(code, stdout, stderr) {
      atom.project.addPath(projectPath+"/"+name)
    });

    //-- Close the new project panel
    panel.destroy();
  };

  const paths = atom.project.getPaths();
  if (paths.length > 0) {
    view.addDirectories(paths, paths[paths.length - 1]);
  }
} //-- Init project

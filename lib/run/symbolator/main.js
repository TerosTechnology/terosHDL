"use babel"

// Copyright 2018 DAS Photonics
// Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
//
// This file is part of ATOMato.
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
import fs from 'fs';

let svg

class InitProjectView {
  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/view-svg.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.template').cloneNode(true);
    svg = this.element.querySelector('.myDiv');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();
  }
  getElement() {
    return this.element;
  }
  handleCancel() {}
  destroy() {
    this.element.remove();
  }
}
function imageTemplate() {
  const item = atom.workspace.getActivePaneItem();
  if (item == null){
    atom.notifications.addError("Please, select a file in the editor.")
    return
  }

  try {
    p          = item.getPath();
  } catch (ex) {
    atom.notifications.addError("Please, select a file in the editor.")
    return
  }
  dir        = path.dirname(p)
  file       = path.basename(p)
  name       = path.basename(p,'.vhd');

  let projectPath = "";
  atom.project.getDirectories().forEach(function(dir){
    if (dir.contains(p)) {
      projectPath = dir.path;
    }
  });

  var more      = ""
  var folderSep = ""
  var os = require('os');
  if (os.platform === "win32"){
    more = "&&"
    folderSep = "\"
  }
  else{
    more = ";"
    folderSep = "/"
  }

  let command = `cd ${dir}` + more + ` symbolator -f png -i ${file}` + more + ` mv $(ls | grep png) ./${name}.png`
  exec(command);

  var fs = require('fs');

  var shell = require('shelljs');
  let commandFirst  = `cd ${dir}` + more + ` symbolator --title -f svg -i ${file}` + more + ` mv $(ls | grep svg) ./${name}.svg` + more
  let commandSecond = `cd ${dir}` + more + `cat ${name}.svg` + more + ` rm ${name}.svg`
  command = commandFirst + commandSecond
  let child = shell.exec(command, {async:false}, function(code, stdout, stderr) {
    if (code==0){
      let text   = `![alt text](${dir}/${name}.png "Esquema ${name}")`
      atom.notifications.addSuccess("Image copied to clipboard.", {
        detail: text
      })

      atom.clipboard.write(text)

      // break the textblock into an array of lines
      var lines = stdout.split('\n');
      // remove one line, starting at the first position
      lines.splice(0,3);
      // join the array back into a single string
      var svgFile = lines.join('\n');

      var view = new InitProjectView();
      var panel = atom.workspace.addBottomPanel({item: view.getElement()});
      svg.outerHTML += svgFile
      //-- ok button pressed: finish
      view.handleCancel = () => panel.destroy();
    }
    else if( code != 0 && (stdout.indexOf("Creating symbol") == -1) ){
      atom.notifications.addError("Error: please select a vhdl pkg component.")
    }
    else{
      atom.notifications.addSuccess("Image created.")
    }
  });
}

export {
  imageTemplate,
}

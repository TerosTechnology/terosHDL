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

class initIndexView {
  constructor() {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/axilite-index.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.register').cloneNode(true);
    ////////////////////////////////////////////////////////////////////////////
    // Find important nodes
    this.indexInitButton   = this.element.querySelector('.index-controls .index-do-init');
    this.indexCancelButton = this.element.querySelector('.index-controls .index-cancel');

    this.nameTxt = this.element.querySelector('.name');
    this.descriptionTxt = this.element.querySelector('.description');
    this.numberTxt = this.element.querySelector('.number');

    //-- Initialize button
    this.indexInitButton.onclick = () => {
      let name = this.nameTxt.value
      let description = this.descriptionTxt.value
      let number = this.numberTxt.value
      var view = new initRegistersView(name,description,number);
      var panel = atom.workspace.addModalPanel({item: view.getElement()});
      view.handleCancel = () => panel.destroy();
      view.handleInit = () => {
        panel.destroy();
      };
    };

    //-- Cancel button
    this.indexCancelButton.onclick = () => this.handleCancel();
    ////////////////////////////////////////////////////////////////////////////
  } //-- End constructor

  handleInit() {}
  handleCancel() {}
  getElement() {
    return this.element;
  }
  destroy() {
    this.element.remove();
  }
} //-- End class

let tableRegisters = []
var rowsTestTable = []

class initRegistersView {
  constructor(name,description,number) {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'templates/axilite-registers.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.register').cloneNode(true);
    ////////////////////////////////////////////////////////////////////////////
    // Find important nodes
    this.indexInitButton   = this.element.querySelector('.controls .do-init');
    this.indexCancelButton = this.element.querySelector('.controls .cancel');
    this.table = this.element.querySelector('.table');
    ////////////////////////////////////////////////////////////////////////////
    let tableTitle = this.table.insertRow(0);
    tableTitle.insertCell(0).innerHTML = "Offset"
    tableTitle.insertCell(1).innerHTML = "Name"
    tableTitle.insertCell(2).innerHTML = "Description"
    tableTitle.insertCell(3).innerHTML = "Access"
    tableTitle.style.background = "#1C1C1C"
    tableTitle.style.fontWeight = "bold"
    ////////////////////////////////////////////////////////////////////////////
    let register = {
      offset: "",
      name: "",
      description: "",
      access: ""
    };
    for (let i = 0; i<number; ++i){
      rowsTestTable.push(this.table.insertRow(-1))
      rowsTestTable[i].style.borderTopColor = "green"
    }
    for (let i = 0; i<number; ++i){
      let cellOffset = rowsTestTable[i].insertCell(0)
      let cellName = rowsTestTable[i].insertCell(1)
      let cellDescription = rowsTestTable[i].insertCell(2)
      let cellAccess = rowsTestTable[i].insertCell(3)
      cellAccess.style.width = "20%"
      cellOffset.style.borderWidth = "0"
      cellName.style.borderWidth = "0"
      cellDescription.style.borderWidth = "0"
      cellAccess.style.borderWidth = "0"
      // Txt offset
      let txtoffset = doc.createElement("input");
      txtoffset.className = "input-text offset" + i
      cellOffset.appendChild(txtoffset);
      // Txt name
      let txtName = doc.createElement("input");
      txtName.className = "input-text"
      cellName.appendChild(txtName);
      // Txt description
      let txtDescription = doc.createElement("input");
      txtDescription.className = "input-text"
      cellDescription.appendChild(txtDescription);
      // Access
      let divAccess = doc.createElement("div");
      divAccess.className = "settings-view"

      let txtAccess = doc.createElement("select");
      txtAccess.className = "mode-select form-control"
      let txtread  = document.createElement("option")
      txtread.text = "read"
      let txtwrite  = document.createElement("option")
      txtwrite.text = "write"
      let txtreadwrite  = document.createElement("option")
      txtreadwrite.text = "rd-wr"
      txtAccess.add(txtread)
      txtAccess.add(txtwrite)
      txtAccess.add(txtreadwrite)

      divAccess.appendChild(txtAccess);
      cellAccess.appendChild(divAccess);

      tableRegisters.push(register)
    }

    //-- Initialize button
    this.indexInitButton.onclick = () => {

      for (const i in tableRegisters) {
        tableRegisters[i].offset = rowsTestTable[i].cells[0].childNodes[0].value
        tableRegisters[i].name = rowsTestTable[i].cells[1].childNodes[0].value
        tableRegisters[i].description = rowsTestTable[i].cells[2].childNodes[0].value
        tableRegisters[i].access = rowsTestTable[i].cells[3].childNodes[0].value
      }

    };

    //-- Cancel button
    this.indexCancelButton.onclick = () => {
      tableRegisters = []
      rowsTestTable = []
      this.handleCancel();
    }
    ////////////////////////////////////////////////////////////////////////////
  } //-- End constructor

  handleInit() {}
  handleCancel() {}
  getElement() {
    return this.element;
  }
  destroy() {
    this.element.remove();
  }
} //-- End class



export function axilite() {
  //-- Open the new project panel
  var view = new initIndexView();
  var panel = atom.workspace.addModalPanel({item: view.getElement()});

  //------------------- Set buttons handlers

  //-- Cancel button pressed: finish
  view.handleCancel = () => {
    panel.destroy();
  }
  //-- Initialize button pressed: both board and project folder has been
  //-- selected
  view.handleInit = () => {
    //-- Close the new project panel
    panel.destroy();
  };

} //-- Init project

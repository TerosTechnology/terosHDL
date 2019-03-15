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
import { getTests } from './vunit';

var tableTitle

export class testsView {
  constructor(runpy) {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/run-args-tests.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.tests').cloneNode(true);

    dir        = path.dirname(runpy)
    file       = path.basename(runpy)

    var modelsim_path = "export VUNIT_MODELSIM_PATH=" + atom.config.get('TerosHDL.modelsim.modelsim-path')
    var modelsim_ini  = "export VUNIT_MODELSIM_INI="  + atom.config.get('TerosHDL.modelsim.modelsim-ini')
    var simulator = "export VUNIT_SIMULATOR=" + atom.config.get('TerosHDL.general.simulator')

    var shell = require('shelljs');
    var command = modelsim_path + ";" + modelsim_ini + ";" + simulator + "; cd " + dir + "; python " + file + " --export-json ./export.json "


    ////////////////////////////////////////////////////////////////////////////
    // Find important nodes
    this.indexInitButton   = this.element.querySelector('.controls .do-init');
    this.indexCancelButton = this.element.querySelector('.controls .cancel');
    this.table = this.element.querySelector('.table');
    ////////////////////////////////////////////////////////////////////////////
    tableTitle = this.table.insertRow(0);
    tableTitle.insertCell(0).innerHTML = "Name"
    tableTitle.insertCell(1).innerHTML = "Select"
    tableTitle.style.background = "#1C1C1C"
    tableTitle.style.fontWeight = "bold"
    ////////////////////////////////////////////////////////////////////////////


    shell.exec(command, { silent: true })
    tests = getTests(dir+"/export.json")


    cellsTestsTable = []
    for (var i=0;i<tests.length;++i){
      cellsTestsTable.push(this.table.insertRow(i+1))
      cellsTestsTable[i].insertCell(0).innerHTML = tests[i].name

      let btnTxt = doc.createElement("input");
      btnTxt.className = "input-toggle inline-block-tight"
      btnTxt.type = "checkbox"
      cellsTestsTable[i].insertCell(1).appendChild(btnTxt);
    }

    // let tests
    // var child = shell.exec(command, function(code, stdout, stderr) {
    //   if (code==0){
    //     tests = getTests(dir+"/export.json")
    //
    //     alert(tests[0].name)
    //
    //     cellsTestsTable = []
    //     for (var i=0;i<tests.length;++i){
    //       cellsTestsTable.push(this.table.insertRow(i+1))
    //     }
    //
    //
    //   }
    //   else{
    //     atom.notifications.addError("Error in simulation!")
    //   }
    // });



    // var resumeTable    = this.element.querySelector('.resumeTable');
    // var rowTitleResumeTable = resumeTable.insertRow(0);
    // var rowResumeTable      = resumeTable.insertRow(1);
    //
    // cellsTitleResumeTable = []
    // cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(0))
    // cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(1))
    // cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(2))
    // cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(3))
    // cellsTitleResumeTable[0].innerHTML = "Errors"
    // cellsTitleResumeTable[1].innerHTML = "Failures"
    // cellsTitleResumeTable[2].innerHTML = "Skipped"
    // cellsTitleResumeTable[3].innerHTML = "Tests"
    //
    // cellsResumeTable = []
    // cellsResumeTable.push(rowResumeTable.insertCell(0))
    // cellsResumeTable.push(rowResumeTable.insertCell(1))
    // cellsResumeTable.push(rowResumeTable.insertCell(2))
    // cellsResumeTable.push(rowResumeTable.insertCell(3))
    // cellsResumeTable[0].innerHTML = globalInfo.errors
    // cellsResumeTable[1].innerHTML = globalInfo.failures
    // cellsResumeTable[2].innerHTML = globalInfo.skipped
    // cellsResumeTable[3].innerHTML = globalInfo.tests






  //   ////////////////////////////////////////////////////////////////////////////
  //   // Find important nodes
  //   this.indexInitButton   = this.element.querySelector('.index-controls .index-do-init');
  //   this.indexCancelButton = this.element.querySelector('.index-controls .index-cancel');
  //
  //   this.nameTxt = this.element.querySelector('.name');
  //   this.descriptionTxt = this.element.querySelector('.description');
  //   this.numberTxt = this.element.querySelector('.number');
  //
  //   //-- Initialize button
  //   this.indexInitButton.onclick = () => {
  //     let name = this.nameTxt.value
  //     let description = this.descriptionTxt.value
  //     let number = this.numberTxt.value
  //     var view = new initRegistersView(name,description,number);
  //     var panel = atom.workspace.addModalPanel({item: view.getElement()});
  //     view.handleCancel = () => panel.destroy();
  //     view.handleInit = () => {
  //       panel.destroy();
  //     };
  //   };
  //
  //   //-- Cancel button
  //   this.indexCancelButton.onclick = () => this.handleCancel();
  //   ////////////////////////////////////////////////////////////////////////////
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

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

import fs from 'fs';
import path from 'path';

class InitPslView {

  constructor(jsonContent) {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/psl-tests.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.psl').cloneNode(true);
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Resume table
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    var resumeTable    = this.element.querySelector('.resumeTable');
    var rowTitleResumeTable = resumeTable.insertRow(0);
    var rowResumeTable      = resumeTable.insertRow(1);

    cellsTitleResumeTable = []
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(0))
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(1))
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(2))
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(3))
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(4))
    cellsTitleResumeTable.push(rowTitleResumeTable.insertCell(5))
    cellsTitleResumeTable[0].innerHTML = "Assert"
    cellsTitleResumeTable[1].innerHTML = "Assert-failure"
    cellsTitleResumeTable[2].innerHTML = "Assert-pass"
    cellsTitleResumeTable[3].innerHTML = "Cover"
    cellsTitleResumeTable[4].innerHTML = "Cover-failure"
    cellsTitleResumeTable[5].innerHTML = "Cover-pass"

    cellsResumeTable = []
    cellsResumeTable.push(rowResumeTable.insertCell(0))
    cellsResumeTable.push(rowResumeTable.insertCell(1))
    cellsResumeTable.push(rowResumeTable.insertCell(2))
    cellsResumeTable.push(rowResumeTable.insertCell(3))
    cellsResumeTable.push(rowResumeTable.insertCell(4))
    cellsResumeTable.push(rowResumeTable.insertCell(5))
    cellsResumeTable.push(rowResumeTable.insertCell(6))
    cellsResumeTable[0].innerHTML = jsonContent["summary"]["assert"]
    cellsResumeTable[1].innerHTML = jsonContent["summary"]["assert-failure"]
    cellsResumeTable[2].innerHTML = jsonContent["summary"]["assert-pass"]
    cellsResumeTable[3].innerHTML = jsonContent["summary"]["cover"]
    cellsResumeTable[4].innerHTML = jsonContent["summary"]["cover-failure"]
    cellsResumeTable[5].innerHTML = jsonContent["summary"]["cover-pass"]

    ///----------------------------- Styles -----------------------------
    resumeTable.style.width = "100%"
    rowTitleResumeTable.style.background = "#1C1C1C"
    rowTitleResumeTable.style.fontWeight = "bold"
    rowResumeTable.style.background = "#2E2E2E"

    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // Test table
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    var pslInfo = jsonContent["details"]
    var testTable    = this.element.querySelector('.testsTable');
    var rowTitleTestTable = testTable.insertRow(-1);
    var rowsTestTable = []

    rowTitleTestTable.insertCell(0).innerHTML = "Directive"
    rowTitleTestTable.insertCell(1).innerHTML = "Name"
    rowTitleTestTable.insertCell(2).innerHTML = "Line"
    rowTitleTestTable.insertCell(3).innerHTML = "Count"
    rowTitleTestTable.insertCell(4).innerHTML = "Status"

    for (const i in pslInfo) {
      rowsTestTable.push(testTable.insertRow(-1))
    }

    for (const i in pslInfo) {
      let cellDirective = rowsTestTable[i].insertCell(0)
      let cellName      = rowsTestTable[i].insertCell(1)
      let cellLine      = rowsTestTable[i].insertCell(2)
      let cellCount     = rowsTestTable[i].insertCell(3)
      let cellFail      = rowsTestTable[i].insertCell(4)
      let buttonGoto    = rowsTestTable[i].insertCell(5)

      cellDirective.innerHTML = pslInfo[i]["directive"]
      cellName.innerHTML = pslInfo[i]["name"]
      cellLine.innerHTML = pslInfo[i]["line"]
      cellCount.innerHTML = pslInfo[i]["count"]
      cellFail.innerHTML = pslInfo[i]["status"]
      //-------- goto output --------------------------------------------------
      let btnGoto = doc.createElement("BUTTON");
      btnGoto.className = "btn icon icon-reply btn-warning inline-block-tight"
      let tTxt = doc.createTextNode("Goto");
      btnGoto.appendChild(tTxt);
      buttonGoto.appendChild(btnGoto);
      //------------------------------------------------------------------------
      if (pslInfo[i]["status"]!="passed" && pslInfo[i]["status"]!="covered"){
        cellFail.style.background = "#FF5733"
        cellFail.style.color      = "#8A0808"
        cellFail.style.fontWeight = "bold"
      }
      else{
        cellFail.style.background = "#5BC16D"
        cellFail.style.color      = "#016012"
        cellFail.style.fontWeight = "bold"
      }

      cellDirective.style.background = "#2E2E2E"
      cellName.style.background = "#2E2E2E"
      cellLine.style.background = "#2E2E2E"
      cellCount.style.background = "#2E2E2E"
      buttonGoto.style.padding = "0% 1% 0%"


      btnGoto.onclick = function () {
        atom.workspace.open(pslInfo[i]["file"], {
          initialLine: pslInfo[i]["line"]-1
        });
      };
    }

    ///----------------------------- Styles -----------------------------
    testTable.style.width = "100%"
    rowTitleTestTable.style.background = "#1C1C1C"
    rowTitleTestTable.style.fontWeight = "bold"

  }
  getElement() {
    return this.element;
  }
}

var directoryTests = []
var directoryTestsName = []
export function pslView(dir){
  //Read PSL .json
  var fs = require("fs");
  f = dir + "/psl_coverage.json"
  var content = fs.readFileSync(f)
  var jsonContent = JSON.parse(content)

  var view = new InitPslView(jsonContent);
  const item = {
    element: view.getElement(),
    getTitle: () => 'PSL report',
    getURI: () => 'atom://my-package/my-item',
    getDefaultLocation: () => 'bottom'
  };
  let viewModal = atom.workspace.open(item)

}

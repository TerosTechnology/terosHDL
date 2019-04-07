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

class InitSimulatorView {

  constructor(globalInfo,testsInfo,gtkwaveFile) {
    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/run-tests.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.simulator').cloneNode(true);
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
    cellsTitleResumeTable[0].innerHTML = "Errors"
    cellsTitleResumeTable[1].innerHTML = "Failures"
    cellsTitleResumeTable[2].innerHTML = "Skipped"
    cellsTitleResumeTable[3].innerHTML = "Tests"

    cellsResumeTable = []
    cellsResumeTable.push(rowResumeTable.insertCell(0))
    cellsResumeTable.push(rowResumeTable.insertCell(1))
    cellsResumeTable.push(rowResumeTable.insertCell(2))
    cellsResumeTable.push(rowResumeTable.insertCell(3))
    cellsResumeTable[0].innerHTML = globalInfo.errors
    cellsResumeTable[1].innerHTML = globalInfo.failures
    cellsResumeTable[2].innerHTML = globalInfo.skipped
    cellsResumeTable[3].innerHTML = globalInfo.tests

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
    var testTable    = this.element.querySelector('.testsTable');
    var rowTitleTestTable = testTable.insertRow(-1);
    var rowsTestTable = []

    rowTitleTestTable.insertCell(0).innerHTML = "Classname"
    rowTitleTestTable.insertCell(1).innerHTML = "Name"
    rowTitleTestTable.insertCell(2).innerHTML = "Time"
    rowTitleTestTable.insertCell(3).innerHTML = "Test"
    let buttoTittle = rowTitleTestTable.insertCell(4)

    for (const i in testsInfo) {
      rowsTestTable.push(testTable.insertRow(-1))
    }

    for (const i in testsInfo) {
      let cellClassname = rowsTestTable[i].insertCell(0)
      let cellName      = rowsTestTable[i].insertCell(1)
      let cellTime      = rowsTestTable[i].insertCell(2)
      let cellFail      = rowsTestTable[i].insertCell(3)
      let buttonInfo    = rowsTestTable[i].insertCell(4)

      cellClassname.innerHTML = testsInfo[i].classname
      cellName.innerHTML = testsInfo[i].name
      cellTime.innerHTML = testsInfo[i].time
      cellFail.innerHTML = testsInfo[i].failure

      //-------- Text output --------------------------------------------------
      let btnTxt = doc.createElement("BUTTON");
      btnTxt.className = "btn icon icon-device-desktop btn-warning inline-block-tight"
      let tTxt = doc.createTextNode("Terminal");
      btnTxt.appendChild(tTxt);
      buttonInfo.appendChild(btnTxt);
      //-------- GTKWave output ------------------------------------------------
      let btnWAve = doc.createElement("BUTTON");
      if (atom.config.get('TerosHDL.others.sim-display-mode') == "gtkwave"){
        btnWAve.className = "btn icon icon-pulse btn-info selected inline-block-tight"
        if (atom.config.get('TerosHDL.general.simulator')=="modelsim"){
          var tWave = doc.createTextNode("Modelsim (clipboard)");
        }
        else{
          var tWave = doc.createTextNode("GTKwave");
        }
        btnWAve.appendChild(tWave);
        buttonInfo.appendChild(btnWAve);
      }
      //------------------------------------------------------------------------

      if (testsInfo[i].failure=="Failed"){
        cellFail.style.background = "#FF5733"
        cellFail.style.color      = "#8A0808"
        cellFail.style.fontWeight = "bold"
      }
      else{
        cellFail.style.background = "#5BC16D"
        cellFail.style.color      = "#016012"
        cellFail.style.fontWeight = "bold"
      }

      cellClassname.style.background = "#2E2E2E"
      cellName.style.background = "#2E2E2E"
      cellTime.style.background = "#2E2E2E"

      buttonInfo.style.background = ""
      buttoTittle.style.background = ""
      buttonInfo.style.padding = "0% 1% 0%"

      var folderSep = ""
      var os = require('os');
      if (os.platform == "win32"){
        folderSep = "\\"
      }
      else{
        folderSep = "/"
      }

      if (atom.config.get('TerosHDL.others.sim-display-mode') == "gtkwave"){
        btnWAve.onclick = function () {
          let nameTest = testsInfo[i].classname + "." + testsInfo[i].name
          let dir
          for (let i = 0; i < directoryTests.length; i++) {
            if (nameTest == directoryTestsName[i]){
              dir = directoryTests[i]
            }
          }
          if (atom.config.get('TerosHDL.general.simulator')=="modelsim") {
            var command = atom.config.get('TerosHDL.modelsim.modelsim-path') + folderSep + "vsim -view " + dir + " -do " + gtkwaveFile
            atom.clipboard.write(command);
            atom.notifications.addInfo("Modelsim command copied to clipboard!");
          }
          else{
            var command = "gtkwave " + dir + " --save=" + gtkwaveFile
            let shell = require('shelljs');
            shell.exec(command, {async:true});
          }
        };
      }

      btnTxt.onclick = function () {
        // alert(testsInfo[i].info)
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
        let infoHTML = testsInfo[i].info.split('\n');

        let info = ""
        for (const i in infoHTML) {
          info = info + infoHTML[i] + "<br/>"
        }

        // win.loadURL(doc)
        var html = [
          "<body bgcolor='#1C1C1C'>",
            "<p>",
              "<font color='#A4A4A4' face='DejaVu Mono'>",
                info,
              "</font>",
            "</p>",
          "</body>",
      ].join("");

        win.loadURL("data:text/html;charset=utf-8," + encodeURI(html));



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
export function simulatorView(path,pathTests,gtkwaveFile,waveout){
  //Read csv tests
  var txtFile = pathTests + "/test_name_to_path_mapping.txt"
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", txtFile, false);
  rawFile.onreadystatechange = function ()
  {
     if(rawFile.readyState === 4)
     {
         if(rawFile.status === 200 || rawFile.status == 0)
         {
            var allText = rawFile.responseText;
            allText = allText.split("\n")
            for (i = 0; i < allText.length; i++) {
                var sample = allText[i].split(" ")
                if (atom.config.get('TerosHDL.general.simulator')=="modelsim"){
                  directoryTests[i] = pathTests + "/" + sample[0] + "/modelsim/vsim.wlf"
                  directoryTestsName[i] = sample[1]
                }
                else {
                  directoryTests[i] = pathTests + "/" + sample[0] + "/ghdl/wave."+waveout
                  directoryTestsName[i] = sample[1]
                }
            }
           }
       }
  }
  rawFile.send(null);
  let results
  let globalInfo
  let testsInfo
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      results = getXml(this);
      globalInfo = results[0]
      testsInfo  = results[1]

      let view = new InitSimulatorView(globalInfo,testsInfo,gtkwaveFile);
      const item = {
        element: view.getElement(),
        getTitle: () => 'Tests info',
        getURI: () => 'atom://my-package/my-item',
        getDefaultLocation: () => 'bottom'
      };
      let viewModal = atom.workspace.open(item);
    }
  };
  xmlhttp.open("GET", path, true);
  xmlhttp.send();
}

function getXml(xml) {
  let i;
  let xmlDoc = xml.responseXML;
  let y = xmlDoc.getElementsByTagName("testsuite");
  let globalInfo = {
    errors:   y[0].attributes.getNamedItem("errors").value,
    failures: y[0].attributes.getNamedItem("failures").value,
    skipped:  y[0].attributes.getNamedItem("skipped").value,
    tests:    y[0].attributes.getNamedItem("tests").value
  };
  //////////////////////////////////////////////////////////////////////////////
  x = xmlDoc.getElementsByTagName("testcase");
  let testsInfo = []
  let localInfo = {
    classname: "",
    name: "",
    time: "",
  };
  for (i = 0; i <x.length; i++) {
    localInfo = {
      classname: x[i].attributes.getNamedItem("classname").value,
      name: x[i].attributes.getNamedItem("name").value,
      time: x[i].attributes.getNamedItem("time").value,
      info: x[i].getElementsByTagName("system-out")[0].childNodes[0].nodeValue,
      failure: "None"
    }
    if (!x[i].getElementsByTagName("failure")[0]){
      localInfo.failure = "Ok!"
    }
    else{
      localInfo.failure = "Failed"
    }
    testsInfo.push(localInfo)
  }
  return [globalInfo, testsInfo]
}

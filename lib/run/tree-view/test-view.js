"use babel"

// Copyright 2019
// Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo,
// Alfredo Enrique Sáez Pérez de la Lastra
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

import { CompositeDisposable, Disposable } from 'atom';

const pathLib = require('path')
const fs = require('fs')
const ViewTests  = require('./views/Tests')
const Manager    = require('./manager')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')
const shell      = require('shelljs');
import OutputView from './output-view'

var projectPath = ""
var project = {
  'path' : "",
  'src'  : [],
  'tb'   : []
}
var elementNodes = []

export default class TestView {
   constructor({
      testRun
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.element = document.createElement('div')
      this.element.innerHTML += ViewTests()

      this.getTitle = () => 'TerosHDL tests',
         this.getURI = () => 'atom://terosHDL/manager_test' + ''
      this.getAllowedLocations = () => ['bottom']

      //Variables
      this.testRun = testRun;
      // wait for the html to be appended
      this.html = this.selectHtml()
   }

   sleep(milliseconds) {
     var start = new Date().getTime();
     for (var i = 0; i < 1e7; i++) {
       if ((new Date().getTime() - start) > milliseconds){
         break;
       }
     }
   }

   draw(result,gtkwave){
     this.setResume(result['summary']);
     this.setResumeStyle();
     this.setTestStyle();
     this.setTests(result['test'],gtkwave);
     this.showTests();
   }

   showLoading(){
     this.html.show.tests.style.display   = "none";
     this.html.show.loading.style.display = "block";
     this.html.show.tests.style.display   = "none";
   }

   showTests(){
     this.html.show.tests.style.display   = "none";
     this.html.show.loading.style.display = "none";
     this.html.show.tests.style.display   = "block";
   }


   selectHtml() {
      return {
        show: {
          none: this.element.querySelector('#show-none'),
          loading: this.element.querySelector('#show-loading'),
          tests: this.element.querySelector('#show-tests')
        },
        resume: {
           table: this.element.querySelector('#resume-table'),
           title: this.element.querySelector('#resume-title'),
           results: this.element.querySelector('#resume-results'),
           errors: this.element.querySelector('#resume-errors'),
           failures: this.element.querySelector('#resume-failures'),
           skipped: this.element.querySelector('#resume-skipped'),
           tests: this.element.querySelector('#resume-tests')
        },
        test: {
           table: this.element.querySelector('#test-table'),
           title: this.element.querySelector('#test-title')
        }
      }
   }
   setEvents(){
     this.html.btn.ok.addEventListener('click', ()     => this.saveConfig())
     this.html.btn.cancel.addEventListener('click', () => this.cancelConfig())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   getConfig(){
     return this.config;
   }
   setResume(summary){
     this.html.resume.errors.textContent   = summary['errors'];
     this.html.resume.failures.textContent = summary['failures'];
     this.html.resume.skipped.textContent  = summary['skipped'];
     this.html.resume.tests.textContent    = summary['test'];
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| table styles |----------------------------*/
   /*------------------------------------------------------------------------*/
   setResumeStyle(){
     this.html.resume.table.style.width = "100%";

     this.html.resume.title.style.background = "#1C1C1C";
     this.html.resume.title.style.fontWeight = "bold";

     this.html.resume.results.style.background   = "#2E2E2E";
   }
   setTestStyle(){
     this.html.test.table.style.width = "100%";

     this.html.test.title.style.background = "#1C1C1C";
     this.html.test.title.style.fontWeight = "bold";
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| tests |-----------------------------------*/
   /*------------------------------------------------------------------------*/
   removeRow(table){
     var rows = table.rows;
     var len = rows.length;
     for(var i=1;i<len;++i){
      table.deleteRow(1);
    }
   }

   setTests(tests,gtkwave){
     if(gtkwave == null)
       gtkwave = "";
     var table = this.html.test.table;
     this.removeRow(table);
     for(var i=0;i<tests.length;++i){
       var row = table.insertRow(-1);
       row.style.background =  "#2E2E2E";
       row.insertCell(0).innerHTML = tests[i]['classname'];
       row.insertCell(1).innerHTML = tests[i]['name'];
       row.insertCell(2).innerHTML = tests[i]['time'];
       var passTest = row.insertCell(3);
       passTest.innerHTML = tests[i]['test'];
       if(tests[i]['test']=="Failed"){
         passTest.style.background = "#FF5733"
         passTest.style.color      = "#8A0808"
         passTest.style.fontWeight = "bold"
       }
       else{
         passTest.style.background = "#5BC16D"
         passTest.style.color      = "#016012"
         passTest.style.fontWeight = "bold"
       }
       ///////////////////////////////////////////////////////////////////////
        var cellOutput = row.insertCell(4);
        cellOutput.style.padding = "0% 1% 0%"
        var btnOut    = document.createElement("BUTTON");
        btnOut.className = "btn icon icon-device-desktop btn-warning inline-block-tight " + i;
        btnOut.appendChild(document.createTextNode("Output"));
        cellOutput.appendChild(btnOut);

        btnOut.onclick = function () {
          var i = parseInt(this.className.split(' ')[5]);
          var outputView  = new OutputView(tests[i]['stdout']);
          var panel = atom.workspace.open(outputView,{split: 'rigth',activatePane:true})
        };
        ///////////////////////////////////////////////////////////////////////
        cellOutput.style.padding = "0% 1% 0%"
        var btnWave    = document.createElement("BUTTON");
        btnWave.className = "btn icon icon-pulse btn-info selected inline-block-tight " + i;
        btnWave.appendChild(document.createTextNode("Waveform"));
        cellOutput.appendChild(btnWave);

        btnWave.onclick = function () {
          var i = parseInt(this.className.split(' ')[6]);
          var command = "gtkwave " + tests[i]['waveform'] + " --save=" + gtkwave;
          shell.exec(command, {async:true});
        };
     }
   }
}

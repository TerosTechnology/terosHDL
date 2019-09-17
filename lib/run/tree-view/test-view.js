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
const ViewTests = require('./views/Tests')
const Manager    = require('./manager')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')

var projectPath = ""


var project = {
  'path' : "",
  'src'  : [],
  'tb'   : []
}
var elementNodes = []

var resume = {
  'errors' : "1",
  'failures' : "2",
  'skipped' : "3",
  'tests' : "4"
}
var tests = {
  'tests' : [
    {
      'classname' : "1",
      'name' : "2",
      'time' : "3",
      'test' : "4",
      'terminal' : "4",
      'waveform' : "4"
    },
    {
      'classname' : "1",
      'name' : "2",
      'time' : "3",
      'test' : "4",
      'terminal' : "4",
      'waveform' : "4"
    },
    {
      'classname' : "1",
      'name' : "2",
      'time' : "3",
      'test' : "4",
      'terminal' : "4",
      'waveform' : "4"
    }
  ]
}

export default class TestView {
   constructor({
      idView,
      defaultLocation
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.idView    = idView
      this.element = document.createElement('div')
      // this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewTests()

      this.getTitle = () => 'TerosHDL tests',
         this.getURI = () => 'atom://terosHDL/manager_test' + this.idView
      this.getAllowedLocations = () => ['bottom']

      //Variables

      // wait for the html to be appended
      this.html = this.selectHtml()
      // this.setEvents()
      this.setResume();
   }

   selectHtml() {
      return {
        resume: {
           errors: this.element.querySelector('#resume-errors'),
           failures: this.element.querySelector('#resume-failures'),
           skipped: this.element.querySelector('#resume-skipped'),
           tests: this.element.querySelector('#resume-tests')
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
   setResume(){
     this.html.resume.errors.textContent = resume.errors;
     this.html.resume.failures.textContent = resume.failures;
     this.html.resume.skipped.textContent = resume.skipped;
     this.html.resume.tests.textContent = resume.tests;
   }
   setTests(){


     


     this.html.resume.errors.textContent = resume.errors;
     this.html.resume.failures.textContent = resume.failures;
     this.html.resume.skipped.textContent = resume.skipped;
     this.html.resume.tests.textContent = resume.tests;
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/


}

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
const ViewConfig = require('./views/Config')
const Manager    = require('./manager')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')

var projectPath = ""

export default class TreeView {
   constructor(
      config
   ) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.idView    = ''
      this.element = document.createElement('div')
      // this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewConfig()

      this.getTitle = () => 'TerosHDL config',
         this.getURI = () => 'atom://terosHDL/manager_config' + this.idView
      this.getAllowedLocations = () => ['top']

      //Variables
      this.config = config;

      // wait for the html to be appended
      this.html = this.selectHtml();
      this.setEvents();
      this.setDefaults();
   }
   selectHtml() {
      return {
        select: {
           suite: this.element.querySelector('#config-select-suite'),
           simulator: this.element.querySelector('#config-select-simulator'),
           language: this.element.querySelector('#config-select-language')
        },
        tab: {
           general: this.element.querySelector('#tab-general'),
           test: this.element.querySelector('#tab-test')
        },
        text: {
           testName: this.element.querySelector('#text-test-name'),
           topLevel: this.element.querySelector('#text-top-level')
        },
        btn: {
          tabGeneral: this.element.querySelector('#btn-tab-general'),
          tabTest: this.element.querySelector('#btn-tab-test'),
          ok: this.element.querySelector('#config-ok'),
          cancel: this.element.querySelector('#config-cancel')
        }
      }
   }
   setDefaults(){
     this.html.text.testName.value = this.config["testName"];
     this.html.text.topLevel.value = this.config["topLevel"];
   }
   setEvents(){
     this.html.btn.tabGeneral.addEventListener('click', () => this.switchGeneral())
     this.html.btn.tabTest.addEventListener('click', ()    => this.switchTest())
     this.html.btn.ok.addEventListener('click', ()     => this.saveConfig())
     this.html.btn.cancel.addEventListener('click', () => this.cancelConfig())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   getConfig(){
     return this.config;
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   saveConfig(){
   }
   cancelConfig(){
   }
   switchGeneral(){
     this.html.tab.general.style.display = "block";
     this.html.tab.test.style.display = "none";
   }
   switchTest(){
     this.html.tab.general.style.display = "none";
     this.html.tab.test.style.display = "block";
   }

}

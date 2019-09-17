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


var project = {
  'path' : "",
  'src'  : [],
  'tb'   : []
}
var elementNodes = []


export default class TreeView {
   constructor({
      idView,
      defaultLocation
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.idView    = idView
      this.element = document.createElement('div')
      this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewConfig()

      this.getTitle = () => 'TerosHDL config',
         this.getURI = () => 'atom://terosHDL/manager_config' + this.idView
      this.getAllowedLocations = () => ['top']

      //Variables
      this.config = null;

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
   }
   selectHtml() {
      return {
        select: {
           suite: this.element.querySelector('#config-select-suite'),
           simulator: this.element.querySelector('#config-select-simulator'),
           language: this.element.querySelector('#config-select-language')
        },
         btn: {
            ok: this.element.querySelector('#config-ok'),
            cancel: this.element.querySelector('#config-cancel')
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
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   saveConfig(){
     // this.config = {
     //   'suite' : this.html.select.suite.value,
     //   'simulator' : this.html.select.simulator.value,
     //   'language' : this.html.select.language.value
     // }
   }
   cancelConfig(){
   }

}

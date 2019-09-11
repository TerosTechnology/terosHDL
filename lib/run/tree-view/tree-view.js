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

const fs = require('fs')
const ViewNavbar = require('./views/Navbar')
const ViewTree   = require('./views/Tree')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')

var projectPath = ""


var project = {
  'path' : "",
  'src'  : [],
  'tb'   : [],
}


export default class TreeView {
   constructor({
      structure,
      defaultLocation
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false

      this.element = document.createElement('div')
      this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewNavbar()
      this.element.innerHTML += ViewTree()

      this.getTitle = () => 'TerosHDL manager',
         this.getURI = () => 'atom://terosHDL/manager' + Math.random()
      this.getAllowedLocations = () => ['left']

      //Variables
      this.path = "";

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
   }
   selectHtml() {
      return {
         btn: {
            loadProject: this.element.querySelector('#btn-load-project'),
            addSource: this.element.querySelector('#btn-add-source'),
            addtb: this.element.querySelector('#btn-add-tb'),
            configuration: this.element.querySelector('#btn-configuration')
         },
         tree: {
            srcTree: this.element.querySelector('#tree-src'),
            tbTree : this.element.querySelector('#tree-tb')
         }
      }
   }
   setEvents(){
     this.html.btn.loadProject.addEventListener('click', ()   => this.loadProject())
     this.html.btn.addSource.addEventListener('click', ()     => this.addSource())
     this.html.btn.addTb.addEventListener('click', ()         => this.addTb())
     this.html.btn.configuration.addEventListener('click', () => this.configuration())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   loadProject(){
     const homedir = require('os').homedir();
     dialog.showOpenDialog(
       {
         defaultPath: homedir,
         filters: [
           { name: 'TerosHDL project', extensions: ['trs'] }
         ]
       },
       function (path) {
         project['path'] = path;
       }
     );
   }
   addSource(){
     const homedir = require('os').homedir();
     dialog.showOpenDialog(
       {
         { properties: ['openFile', 'multiSelections'] }
         defaultPath: homedir,
         filters: [
           { name: 'TerosHDL project', extensions: ['trs'] }
         ]
       },
       function (src) {
         project['src'].concat(src);
         this.refreshTree();
       }
     );
   }

   configuration(){
   }

   refreshTree(){

   }



}

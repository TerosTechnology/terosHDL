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
const ViewNavbar = require('./views/Navbar')
const {dialog} = require('electron').remote
const jsTeros = require('jsteros')

export default class DocumenterView {
   constructor({
      str,
      lang,
      defaultLocation
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false

      this.element = document.createElement('div')
      this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewNavbar()

      this.doc = new jsTeros.Documenter.BaseStructure(str,lang);
      this.element.innerHTML += this.doc.html

      this.getTitle = () => 'Documentation',
         this.getURI = () => 'atom://terosHDL/' + Math.random()
      this.getAllowedLocations = () => ['center']

      // wait for the html to be appended
      this.html = this.selectHtml()
      this.setEvents()
   }
   selectHtml() {
      return {
         btn: {
            pdf: this.element.querySelector('#btn-pdf'),
            html: this.element.querySelector('#btn-html'),
            markdown: this.element.querySelector('#btn-markdown'),
            image: this.element.querySelector('#btn-image')
         }
      }
   }
   setEvents(){
     this.html.btn.pdf.addEventListener('click', ()      => this.getPdf())
     this.html.btn.html.addEventListener('click', ()     => this.getHtml())
     this.html.btn.markdown.addEventListener('click', () => this.getMarkdown())
     this.html.btn.image.addEventListener('click', ()    => this.getImage())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   getMarkdown(){
     var documenter = this.doc;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         defaultPath: homedir+pathLib.sep+"output.md",
         filters: [
           { name: 'MARKDOWN', extensions: ['md'] }
         ]
       },
       function (path) {
         if (path!=null)
          documenter.saveMarkdown(path);
       }
     );
   }
   getPdf(){
     var documenter = this.doc;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         defaultPath: homedir+pathLib.sep+"output.pdf",
         filters: [
           { name: 'PDF', extensions: ['pdf'] }
         ]
       },
       function (path) {
         if (path!=null)
           documenter.savePdf(path);
       }
     );
   }
   getHtml(){
     var documenter = this.doc;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         defaultPath: homedir+pathLib.sep+"output.html",
         filters: [
           { name: 'HTML', extensions: ['html'] }
         ]
       },
       function (path) {
         if (path!=null)
          documenter.saveHtml(path);
       }
     );
   }
   getImage(){
     var documenter = this.doc;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         defaultPath: homedir+pathLib.sep+"output.svg",
         filters: [
           { name: 'SVG', extensions: ['svg'] }
         ]
       },
       function (path) {
         if (path!=null)
          documenter.saveSVG(path);
       }
     );
   }
}

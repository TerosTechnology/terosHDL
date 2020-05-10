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
const ViewNavbar = require('./Navbar')
const ViewSvg = require('./Svg')
const {dialog} = require('electron').remote
const jsTeros = require('jsteros')
const d3 = require('d3')

export default class StateMachineView {
   constructor({
      svg
   }) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false

      this.element = document.createElement('div');
      this.element.setAttribute('id', 'atombrowser-view');
      this.element.setAttribute('background-color','white');
      this.element.innerHTML += ViewNavbar();
      this.element.innerHTML += ViewSvg();
      this.svg = svg;

      var svg_div = d3.select(this.element.querySelector("#zoom"))
        .append("svg")
          .attr("id", "pepe")
          .attr("width",  2048)
          .attr("height",  2048)
          .call(d3.zoom().on("zoom", function () {
             svg_div.attr("transform", d3.event.transform)
          }))
        .append("g")

      svg_div.html(svg);
      this.getTitle = () => 'State machine';

      // wait for the html to be appended
      this.html = this.select_html();
      this.setEvents()
   }
   select_html() {
      return {
         btn: {
            image: this.element.querySelector('#btn-image')
         }
      }
   }
   setEvents(){
     this.html.btn.image.addEventListener('click', ()    => this.save_as_svg_image())
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   save_as_svg_image(){
     let svg = this.svg;
     const homedir = require('os').homedir();
     dialog.showSaveDialog(
       {
         defaultPath: homedir+"/output.svg",
         filters: [
            { name: 'Svg images', extensions: ['svg'] }
          ]
       },
       function (path) {
         if (path!=null)
           fs.writeFileSync(path,svg);
       }
     );
   }
}

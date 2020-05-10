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
const ViewOutput  = require('./views/Output')

export default class OutputView {
   constructor(
      output,
      title
   ) {
      this.subscriptions = new CompositeDisposable();
      this.reloading = false;
      this.element = document.createElement('div');
      this.element.style.overflow = "auto";
      this.element.innerHTML += ViewOutput();

      this.getTitle = () => 'TerosHDL: ' + title,
         this.getURI = () => 'atom://terosHDL/manager_test/output'
      this.getAllowedLocations = () => ['bottom']

      this.output = this.element.querySelector('#out-output');

      this.output.innerHTML = output;
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| table styles |----------------------------*/
   /*------------------------------------------------------------------------*/
   set_output(output){
     this.output.innerHTML = output;
   }

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

}

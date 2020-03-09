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
import { generate_svg,set_top_dependency_graph } from './dependency_graph';
const pathLib = require('path')
const fs = require('fs')
const ViewNavbar = require('./views/Navbar')
const Graph = require('./views/Graph')
const {dialog} = require('electron').remote
const path  = require('path');

export default class DocumenterView {
  obj = null;
   constructor({
      filename,
      str,
      workspace
   }) {
      this.workspace = workspace;
      this.filename = filename;
      this.reloading = false;

      this.element = document.createElement('div');
      this.element.setAttribute('id', 'atombrowser-view');
      this.element.innerHTML += ViewNavbar();
      this.element.innerHTML += Graph();

      this.getTitle = () => 'Dependencies viewer',
         this.getURI = () => 'atom://terosHDL/dependencies'
      this.getAllowedLocations = () => ['center']

      // wait for the html to be appended
      this.html = this.selectHtml()
   }

  get_graph(){
    return this.html.graph.graph;
  }

  generate(files){
    var graph = this.html.graph.graph;
    generate_svg(files,this.openFile,graph);
  }

  set_top(file){
    var graph = this.html.graph.graph;
    set_top_dependency_graph(graph,file);
  }

  openFile(file){
    atom.center();
    atom.workspace.activateNextPane();
    atom.workspace.open(file);
  }

  selectHtml() {
    return {
      graph: {
        graph: this.element.querySelector('#graph')
      }
    }
  }
}

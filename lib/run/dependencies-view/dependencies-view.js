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
const Graph = require('./views/Graph')
const {dialog} = require('electron').remote
const jsTeros = require('jsteros')
const d3 = require('d3-graphviz');
const d3_selection = require('d3-selection');
const d3_chromatic = require('d3-scale-chromatic');

const shell = require('child_process');
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
      this.subscriptions = new CompositeDisposable();
      this.reloading = false;

      this.element = document.createElement('div');
      this.element.setAttribute('id', 'atombrowser-view');
      this.element.innerHTML += ViewNavbar();
      this.element.innerHTML += Graph();

      this.getTitle = () => 'Documentation',
         this.getURI = () => 'atom://terosHDL/' + Math.random()
      this.getAllowedLocations = () => ['center']

      // wait for the html to be appended
      this.html = this.selectHtml()
   }

   generate(files){
     // files = [
     //            "/home/carlos/repo/dependencies/cordic_top_tb.vhd",
     //             "/home/carlos/repo/dependencies/cordic_arctg_mag_engine.vhd",
     //             "/home/carlos/repo/dependencies/cordic_engines_pkg.vhd",
     //             "/home/carlos/repo/dependencies/cordic_sincos_engine.vhd",
     //             "/home/carlos/repo/dependencies/cordic_top.vhd",
     //             "/home/carlos/repo/dependencies/cordic_top_pkg.vhd",
     //             "/home/carlos/repo/dependencies/or.vhd"
     //         ]

     var graph = this.html.graph.graph;
     var str = "";
     for (var i=0;i<files.length-1;++i){
       str += files[i] + ","
     }
     str += files[files.length-1]

     var path_python = '/home/carlos/repo/dependencies/sample.py ' + ' "' + str + '"';
     var cmd = "python3 " + path_python

     const execSync = require('child_process').execSync;
     var stdout = execSync(cmd).toString();
     var element = this;


     d3_selection.select(this.html.graph.graph).on("click", function() {


        // console.log(event['path'])
        //
        //
        // var children = event['path'][2]['children']
        // for (var i=0;i<children.length;++i){
        //   if(children[i]['childNodes'][3] != null && children[i]['classList'][0]!='edge'
        //       && children[i]['classList']['value']!='')
        //     children[i]['childNodes'][3]['attributes'][0]['value'] = 'yellow'
        // }


        // var g = event['path'][1];
        // var element = g.getElementsByTagName("path")
        // element[0]['attributes'][0]['value'] = "red"

        var g = event['path'][1];
        var node_path = g.getElementsByTagName("title")[0]['innerHTML'];
        var node_name = g.getElementsByTagName("text")[0]['innerHTML'];
        var rectangle = g.getElementsByTagName("polygon");
        rectangle[0]['attributes'][0]['value'] = "red"

        element.openFile(node_path);
     });
     d3.graphviz(graph).height(1089).width(2000).renderDot(stdout)

   }

   openFile(file){
     console.log("entra")
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

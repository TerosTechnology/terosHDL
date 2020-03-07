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
const d3_ease = require('d3-ease');
const d3_transition = require('d3-transition');
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

   //  generate(files){
   //   var graph = this.html.graph.graph;
   //   var str = "";
   //   for (var i=0;i<files.length-1;++i){
   //     str += files[i] + ","
   //   }
   //   str += files[files.length-1]
   //
   //   var path_python = '/home/carlos/repo/dependencies/sample.py ' + ' "' + str + '"';
   //   var cmd = "python3 " + path_python
   //
   //   var element = this;
   //   const child_process = require('child_process');
   //   child_process.exec(cmd, function (error, stdout, stderr) {
   //     d3_selection.select(element.html.graph.graph).on("click", function() {
   //
   //       if(event['path'][1]['id'] == "graph0")
   //         return;
   //
   //        var children = event['path'][2]['children']
   //        for (var i=0;i<children.length;++i){
   //          if(children[i]['childNodes'][3] != null && children[i]['classList'][0]!=='edge'
   //              && children[i]['classList']['value']!==""){
   //            children[i]['childNodes'][3]['attributes'][0]['value'] = 'lightgray'
   //          }
   //        }
   //        var g = event['path'][1];
   //        var node_path = g.getElementsByTagName("title")[0]['innerHTML'];
   //        var node_name = g.getElementsByTagName("text")[0]['innerHTML'];
   //        var rectangle = g.getElementsByTagName("polygon");
   //        rectangle[0]['attributes'][0]['value'] = "red"
   //
   //        element.openFile(node_path);
   //     });
   //     var t = d3_transition.transition()
   //         .duration(700)
   //         .ease(d3_ease.easeLinear);
   //     if (stdout == "")
   //       return;
   //     d3.graphviz(graph).transition(t).height(1089).width(2000).renderDot(stdout)
   //   });
   // }


   generate(files){
    var graph = this.html.graph.graph;
    var element = this;
    create_dependency_graph(files).then( async function (dependency_graph) {

      console.log(dependency_graph)

      d3_selection.select(element.html.graph.graph).on("click", function() {

        if(event['path'][1]['id'] == "graph0")
          return;

         var children = event['path'][2]['children']
         for (var i=0;i<children.length;++i){
           if(children[i]['childNodes'][3] != null && children[i]['classList'][0]!=='edge'
               && children[i]['classList']['value']!==""){
             children[i]['childNodes'][3]['attributes'][0]['value'] = 'lightgray'
           }
         }
         var g = event['path'][1];
         var node_path = g.getElementsByTagName("title")[0]['innerHTML'];
         var node_name = g.getElementsByTagName("text")[0]['innerHTML'];
         var rectangle = g.getElementsByTagName("polygon");
         rectangle[0]['attributes'][0]['value'] = "red"

         element.openFile(node_path);
         var t = d3_transition.transition()
         .duration(700)
         .ease(d3_ease.easeLinear);
         if (dependency_graph == "")
          return;
         d3.graphviz(graph).transition(t).height(1089).width(2000).renderDot(dependency_graph)
      });
    });
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

// function create_dependency_graph(sources){
//   var str = "";
//   for (var i=0;i<sources.length-1;++i)
//     str += sources[i] + ","
//   str += sources[sources.length-1];
//
//   var path_python = '/home/carlos/repo/dependencies/sample.py ' + ' "' + str + '"';
//   var cmd = "python3 " + path_python;
//   const child_process = require('child_process');
//   var dependency_graph;
//   await child_process.exec(cmd, async function (error, stdout, stderr) {
//     dependency_graph = stdout;
//   });
//   callback(dependency_graph);
// }








function create_dependency_graph(sources) {
  var str = "";
  for (var i=0;i<sources.length-1;++i)
    str += sources[i] + ","
  str += sources[sources.length-1];

  var path_python = '/home/carlos/repo/dependencies/sample.py ' + ' "' + str + '"';
  var cmd = "python3 " + path_python;

  const child_process = require('child_process');
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      resolve(stdout)
    })
  })
}

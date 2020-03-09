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

const d3 = require('d3-graphviz');
const d3_selection = require('d3-selection');
const d3_ease = require('d3-ease');
const d3_transition = require('d3-transition');
const d3_chromatic = require('d3-scale-chromatic');
const shell = require('child_process');

function generate_svg(files,open_function,graph,top){
  if (graph == undefined)
    var graph = document.createElement("div");
    graph.setAttribute("id", "#graph");
    graph.setAttribute("style", "background-color:white;width=900px;height=900px");
  create_dependency_graph(files).then( async function (dependency_graph) {
    d3_selection.select(graph).on("click", function() {
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
      open_function(node_path);
    });
    var t = d3_transition.transition().duration(700).ease(d3_ease.easeLinear);
    if (dependency_graph == "")
      return;
    console.log(dependency_graph)
    d3.graphviz(graph).transition(t).height(window.innerHeight).width(window.innerWidth)
      .renderDot(dependency_graph).on("end", function(event) {
        if (top != undefined)
          set_top_dependency_graph(graph,top);
    });
  });
}

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

function set_top_dependency_graph(graph,file) {
  try{
    console.log(file)
    var selection = d3_selection.select(graph);
    var childs = selection['_groups'][0][0]['childNodes'][0]['childNodes'][1]['childNodes'];
    for (var i=0;i<childs.length;++i){
      if(childs[i]['childNodes'][3] != null && childs[i]['classList'][0]!=='edge'
          && childs[i]['classList']['value']!==""){
        if (childs[i]['childNodes'].length>2){
          if (childs[i]['childNodes'][1]['innerHTML']==file){
            childs[i]['childNodes'][3]['attributes'][0]['value'] = 'red'
          }
          else{
            childs[i]['childNodes'][3]['attributes'][0]['value'] = 'lightgray'
          }
        }
      }
    }
  }
  catch(error){console.log(error)}
}


module.exports = {
  create_dependency_graph : create_dependency_graph,
  generate_svg : generate_svg,
  set_top_dependency_graph : set_top_dependency_graph
}

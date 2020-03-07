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

const jsTeros    = require('jsteros')

export default class ProjectManager {

  constructor(source_node,testbench_node,prj_file){
    this.project_manager = new jsTeros.ProjectManager.Manager();
    this.source_node     = source_node;
    this.testbench_node  = testbench_node;
    this.element_nodes   = [];
    this.prj_file        = prj_file;
  }
  load_project(file){
    this.project_manager.loadProject(file);
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
  }
  save_project(file){
    this.project_manager.saveProject(file);
  }
  clear_project(){
    this.delete_all_tree();
    this.project_manager.clear();
    this.project_manager.saveProject(this.prj_file);
  }
  add_source(source){
    this.project_manager.addSource(src);
    this.update_tree();
    this.project_manager.saveProject(prj_file);
  }
  add_testbench(source){
    this.project_manager.addTestbench(src);
    this.update_tree();
    this.project_manager.saveProject(prj_file);
  }



  /*
    Graphic.
  */
  update_tree(){
    this.delete_all_tree();
    element_nodes = this.refresh_tree(this.project_manager.getSourceName(),this.source_node);
    element_nodes = this.refresh_tree(this.project_manager.getTestbenchName(),this.testbench_node);
  }

  refresh_tree(items,node){
    for (i=0;i<items.length;++i)
      this.add_node_tree(items[i],node);
    return this.element_nodes;
  }

  add_node_tree(item,node){
    console.log(node)
    // ul
    var nodeUl   = document.createElement("ul");
    nodeUl.className = "list-tree";
    this.element_nodes.push(nodeUl);
    // li
    var nodeLi   = document.createElement("li");
    nodeLi.className = "list-item";
    nodeLi.addEventListener("click", function(element){
      if (this.className == "list-item")
        this.className = "list-item selected";
      else
        this.className = "list-item";
    });
    // Span
    var nodeSpan = document.createElement("span");
    nodeSpan.className        = "icon icon-file-text " + node.textContent;
    nodeSpan.textContent = item;
    nodeSpan.addEventListener('dblclick', function (e) {
      atom.workspace.open(this.textContent);
    });
    // Append elements
    node.appendChild(nodeUl);
    nodeUl.appendChild(nodeLi);
    nodeLi.appendChild(nodeSpan);

    // node ={
    //   id : id,
    //   filepath : item,
    //   ul : nodeUl,
    //   li : nodeLi
    // };
    // id += 1;
  }

  delete_all_tree(){
    for(var i=0;i<this.element_nodes.length;++i) {
      this.element_nodes[i].remove();
    }
    this.element_nodes = [];
  }

  delete_selected_items(x,y){
    //Chek if files checked and delete
    var removed_sources = [];
    var removed_testbenches = [];
    for (var i=0;i<this.element_nodes.length;++i){
      var child = this.element_nodes[i].childNodes[0];
      var className = child.className;
      var parentID = this.element_nodes[i].parentNode.id;
      if (parentID == "tree-src" && className.includes("selected"))
        removed_sources.push(child.textContent);
      else if (parentID == "tree-tb" && className.includes("selected"))
        removed_testbenches.push(child.textContent);
    }
    if (removed_sources.length>0 || removed_testbenches.length>0){
      this.project_manager.deleteSource(removed_sources);
      this.project_manager.deleteTestbench(removed_testbenches);
      this.update_tree();
      this.project_manager.saveProject(this.prj_file);
      // this.regenerate();
      return;
    }
    //If no file checked delete item: delete with rigth click
    elementMouseIsOver = document.elementFromPoint(x, y);
    if(elementMouseIsOver.className.includes("Testbenchs")){
      this.project_manager.deleteTestbench([elementMouseIsOver.textContent]);
    }
    else if (elementMouseIsOver.className.includes("Sources")){
      this.project_manager.deleteSource([elementMouseIsOver.textContent]);
    }
    // this.regenerate();
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
  }

}

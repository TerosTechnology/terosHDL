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

import { generate_svg,set_top_dependency_graph } from './dependency_graph'
import Logger from '../../logger/logger'
const jsTeros    = require('jsteros')
const path = require('path');
export default class ProjectManager {

  constructor(source_node,testbench_node,prj_file,graph){
    this.project_manager = new jsTeros.ProjectManager.Manager();
    this.source_node     = source_node;
    this.testbench_node  = testbench_node;
    this.element_nodes   = [];
    this.prj_file        = prj_file;
    this.config          = undefined;
    this.graph           = graph;
  }
  load_project(file){
    this.project_manager.loadProject(file);
    this.update_tree();
    this.config = this.project_manager.getConfig();
    this.project_manager.saveProject(this.prj_file);
    this.set_top_from_file(this.config['top_level_file']);
    this.set_top_default();
    this.generate_dependency_graph();
  }
  save_project(file){
    this.project_manager.saveProject(file);
  }
  clear_project(){
    this.delete_all_tree();
    this.project_manager.clear();
    this.project_manager.saveProject(this.prj_file);
    const fs = require('fs');
    this.generate_dependency_graph();
    // fs.unlinkSync(this.prj_file);
  }
  add_source(source){
    var source_array = [];
    for (var i=0;i<source.length;++i){
      if (this.check_if_exist(source[i]) == true)
        Logger.logInfo("Duplicated file: " + source[i]);
      else
        source_array.push(source[i]);
    }
    if (source_array==[])
      return;
    this.project_manager.addSource(source_array);
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
    this.set_top_default();
    this.generate_dependency_graph();
  }
  add_testbench(source){
    var source_array = [];
    for (var i=0;i<source.length;++i){
      if (this.check_if_exist(source[i]) == true)
        Logger.logInfo("Duplicated file: " + source[i]);
      else
        source_array.push(source[i]);
    }
    if (source_array==[])
      return;
    this.project_manager.addTestbench(source_array);
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
    this.set_top_default();
    this.generate_dependency_graph();
  }
  delete_file(file){
    var file_array = [file]
    this.project_manager.deleteSource(file_array);
    this.project_manager.deleteTestbench(file_array);
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
    this.set_top_default();
    this.generate_dependency_graph();
  }
  check_if_exist(file){
    for (var i=0;i<this.element_nodes.length;++i)
      if (this.element_nodes[i]['filepath'] == file)
        return true;
    return false;
  }

  async simulate(server,ip){
    var response;
    await this.project_manager.simulate(server,ip).then(function(resp){
      response = resp['data']['result'];
    });
    return response;
  }

  get_config(){
    return this.project_manager.getConfig();
  }
  set_config(config){
    var configurator = new jsTeros.ProjectManager.Configurator;
    configurator.setSuite(config['suite']);
    configurator.setTool(config['tool']);
    configurator.setLanguage(config['language']);
    configurator.setName(config['name']);
    configurator.setTopLevel(config['top_level']);
    configurator.setTopLevelFile(config['top_level_file']);
    configurator.setWorkingDir(config['working_dir']);
    this.project_manager.setConfiguration(configurator);
    this.project_manager.saveProject(this.prj_file);
  }

  get_all_sources(){
    var sources = this.project_manager.getSourceName();
    var testbenches = this.project_manager.getTestbenchName();
    var all_sources = sources.concat(testbenches);
    return all_sources;
  }

  async get_avaiable_config(server,port){
    var avaiable_config;
    await this.project_manager.getSuites(server,port).then(function(resp){
      if (resp['result']['CODE'] != jsTeros.Simulators.Codes.CODE_RESPONSE['SUCCESSFUL']['CODE']){
        Logger.logWarning(resp['result']['TITLE'],resp['result']['DESCRIPTION']);
        return undefined;
      }
      avaiable_config = resp['data'];
    });
    return avaiable_config;
  }


  /*
    dependency_graph.
  */
  generate_dependency_graph(){
    var all_sources = this.get_all_sources();
    var element = this;
    generate_svg(all_sources,this.openFile,this.graph,this.config['top_level_file']);
  }

  openFile(file){
    atom.center();
    atom.workspace.activateNextPane();
    atom.workspace.open(file);
  }

  /*
    Graphic.
  */
  get_file_from_position(x,y){
    element_mouse = document.elementFromPoint(x, y);
    if (element_mouse.className.includes("Testbenchs")
          || element_mouse.className.includes("Sources")){
      return element_mouse.getAttribute("data-path");
    }
    return "";
  }

  update_tree(){
    this.delete_all_tree();
    this.refresh_tree(this.project_manager.getSourceName(),this.source_node);
    this.refresh_tree(this.project_manager.getTestbenchName(),this.testbench_node);
  }

  refresh_tree(items,node){
    for (i=0;i<items.length;++i)
      this.add_node_tree(items[i],node);
  }

  add_node_tree(item,node){
    // ul
    var nodeUl   = document.createElement("ul");
    nodeUl.className = "list-tree";
    // li
    var nodeLi   = document.createElement("li");
    nodeLi.setAttribute("data-path",item);
    nodeLi.className = "list-item";
    nodeLi.addEventListener("click", function(element){
      if (this.className == "list-item")
        this.className = "list-item selected";
      else
        this.className = "list-item";
    });
    // Span
    var text_path = path.dirname(item);
    var text_file = path.basename(item);
    var text_content = text_path.substring(0, 10) + "..." + path.sep + text_file;
    var nodeSpan = document.createElement("span");
    nodeSpan.className   = "icon icon-file-text " + node.textContent;
    nodeSpan.textContent = text_content;
    nodeSpan.setAttribute("data-path",item);
    nodeSpan.addEventListener('dblclick', function (e) {
      const filepath = item;
      atom.workspace.open(filepath);
    });
    atom.tooltips.add(nodeSpan, {title: item})
    //point
    var nodeSpanDot = document.createElement("i");
    nodeSpanDot.className = "icon icon-bookmark";
    nodeSpanDot.style.marginLeft = "2%";
    nodeSpanDot.style.visibility = "hidden";
    // Append elements
    node.appendChild(nodeUl);
    nodeUl.appendChild(nodeLi);
    nodeLi.appendChild(nodeSpan);
    nodeSpan.appendChild(nodeSpanDot);
    var node_element ={
      id : 0,
      filepath : item,
      element : nodeUl,
      element_span : nodeSpan,
      element_top : nodeSpanDot
    };
    this.element_nodes.push(node_element);
  }

  delete_all_tree(){
    for(var i=0;i<this.element_nodes.length;++i) {
      this.element_nodes[i]['element'].remove();
    }
    this.element_nodes = [];
  }

  delete_selected_items(x,y){
    //Chek if files checked and delete
    var removed_sources = [];
    var removed_testbenches = [];
    for (var i=0;i<this.element_nodes.length;++i){
      var child = this.element_nodes[i]['element'].childNodes[0];
      var className = child.className;
      var parentID = this.element_nodes[i]['element'].parentNode.id;
      if (parentID == "tree-src" && className.includes("selected"))
        removed_sources.push(child.getAttribute("data-path"));
      else if (parentID == "tree-tb" && className.includes("selected"))
        removed_testbenches.push(child.getAttribute("data-path"));
    }
    if (removed_sources.length>0 || removed_testbenches.length>0){
      this.project_manager.deleteSource(removed_sources);
      this.project_manager.deleteTestbench(removed_testbenches);
      this.update_tree();
      this.project_manager.saveProject(this.prj_file);
      this.set_top_default();
      this.generate_dependency_graph()
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
    this.update_tree();
    this.project_manager.saveProject(this.prj_file);
    this.set_top_default();
    this.generate_dependency_graph();
  }

  set_top_default(){
    this.set_top_from_file(this.config['top_level_file']);
    set_top_dependency_graph(this.graph,this.config['top_level_file']);
  }

  set_top_from_file(file){
    for(var i=0;i<this.element_nodes.length;++i){
      if (this.element_nodes[i]['filepath']==file){
        this.element_nodes[i]['element_span'].setAttribute("style","font-weight:bold");
        this.element_nodes[i]['element_top'].style.visibility = "visible";
      }
      else{
        this.element_nodes[i]['element_span'].setAttribute("style","font-weight:normal");
        this.element_nodes[i]['element_top'].style.visibility = "hidden";
      }
    }
    this.set_config_top(file);
    set_top_dependency_graph(this.graph,file);
  }

  set_config_top(file){
    if (path.extname(file)==".vhd")
      var lang = "vhdl";
    else if(path.extname(file)==".v")
      var lang = "verilog";
    else
      var lang = "verilog";
    var fs = require("fs");
    var element = this;
    fs.readFile(file, "utf8", function(err, str) {
      try{
        var entity = element.project_manager.get_entity(str,lang);
      }
      catch(error){
        var entity = "";
      }
      element.config['top_level_file'] = file;
      element.config['top_level'] = entity;
      element.set_config(element.config);
      element.save_project(element.prj_file);
    });
  }

}

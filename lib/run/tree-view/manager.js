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

const fs = require('fs');


class ProjectManager{

  constructor(configurator){
    this.source = [];
    this.testbench = [];
    if (typeof configurator === 'undefined')
      this.configurator = new Configurator();
    else
      this.configurator = configurator;
  }

  loadProject(){

  }
  saveTrs(){

  }
  clear(){
    this.source = [];
    this.testbench = [];
    // this.configurator = new Configurator();
  }
  addSource(newSource){
    console.log("Added source...");
    for (const x in newSource) {
      var f = {
        name: newSource[x],
        type: this.getFileType(newSource[x])
      }
      this.source = this.source.concat(f);
    }
  }
  addTestbench(newTestbench){
    console.log("Added testbench...");
    for (const x in newTestbench) {
      var f = {
        name: newTestbench[x],
        type: this.getFileType(newTestbench[x])
      }
      this.testbench = this.testbench.concat(f);
    }
  }
  setConfiguration(configurator){
    this.configurator = configurator;
  }

  //////////////////////////////////////////////////////////////////////////////
  getSourceName(){
    var names = [];
    for (const x in this.source) {
      names = names.concat(this.source[x]['name']);
    }
    return names;
  }
  getTestbenchName(){
    var names = [];
    for (const x in this.testbench) {
      names = names.concat(this.testbench[x]['name']);
    }
    return names;
  }
  getFileType(f){
    var ext = f.split('.').pop();
    var file_type = "";
    if (ext == "py")
      file_type = "py"
    else if(ext == "v")
      file_type = "verilogSource-2005"
    else if(ext == "vhd")
      file_type = "vhdlSource-2008"
    return file_type;
  }
  addFile(){

  }

}

class Configurator{
  constructor(){
    this.configuration = this.setDefaults();
  }
  setDefaults(){
    var configuration = {
      'suite':'',
      'tool':'',
      'language':'',
      'name':'',
      'top_level':'',
      'working_dir':''
    }
    return configuration;
  }
  setSuite(suite){
    if (typeof suite != 'string') {
        throw new Error('You must pass requiredParam to function setSuite!');
    }
    this.configuration["suite"] = suite;
  }
  setTool(tool){
    if (typeof tool != 'string') {
        throw new Error('You must pass requiredParam to function settool!');
    }
    this.configuration["tool"] = tool;
  }
  setLanguage(language){
    if (typeof language != 'string') {
        throw new Error('You must pass requiredParam to function setLanguage!');
    }
    this.configuration["language"] = language;
  }
  setName(name){
    if (typeof name != 'string') {
        throw new Error('You must pass requiredParam to function setName!');
    }
    this.configuration["name"] = name;
  }
  setTopLevel(topLevel){
    if (typeof topLevel != 'string') {
        throw new Error('You must pass requiredParam to function setTopLevel!');
    }
    this.configuration["topLevel"] = topLevel;
  }
  setWorkingDir(workingDir){
    if (typeof workingDir != 'string') {
        throw new Error('You must pass requiredParam to function setWorkingDir!');
    }
    this.configuration["working_dir"] = workingDir;
  }

}



























function getSrc(file){
  var structure = fs.readFileSync(file,'utf8');
  return JSON.parse(structure)['src'];
}

function getTb(file){
  var structure = fs.readFileSync(file,'utf8');
  return JSON.parse(structure)['tb'];
}

function getConfig(file){
  var structure = fs.readFileSync(file,'utf8');
  var json = JSON.parse(structure);
  var config = {
      'suite': json['suite'],
      'tool': json['tool'],
      'language': json['language'],
      'name': json['name'],
      'top_level': json['top_level'],
      'working_dir': json['working_dir'],
      'gtkwave': json['gtkwave']
  }
  return config;
}

function saveProject(file,project){
  var project = {
    'gtkwave': project['config']['gtkwave'],
    'name': project['config']['name'],
    'suite': project['config']['suite'],
    'tool' : project['config']['tool'],
    'language' : project['config']['language'],
    'working_dir' : project['config']['working_dir'],
    'top_level' : project['config']['top_level'],
    'path' : project['file'],
    'src'  : project['src'],
    'tb'   : project['tb']
  }
  var data = JSON.stringify(project);
  fs.writeFileSync(file,data);
}

function validate(files){
}

function getType(f){
  var ext = f.split('.').pop();
  var file_type = "";
  if (ext == "py")
    file_type = "py"
  else if(ext == "v")
    file_type = "verilogSource-2005"
  else if(ext == "vhd")
    file_type = "vhdlSource-2008"
  return file_type;
}

function getEdamFileFormat(files){
  var files_edam = [];
  for(var i = 0;i<files.length;++i){
    var f = {'name':files[i],'file_type':getType(files[i])};
    files_edam.push(f);
  }
  return files_edam;
}

function getEdamFormat(project){
  var edam = {
    'name': project['config']['name'],
    'suite': project['config']['suite'],
    'tool' : project['config']['tool'],
    'working_dir' : project['config']['working_dir'],
    'top_level' : project['config']['top_level'],
    'files'  : project['src'].concat(project['tb'])
  }
  return edam;
}

module.exports = {
  ProjectManager : ProjectManager,
  getSrc: getSrc,
  getTb : getTb,
  saveProject : saveProject,
  getConfig : getConfig,
  getEdamFileFormat : getEdamFileFormat,
  getEdamFormat:getEdamFormat
}

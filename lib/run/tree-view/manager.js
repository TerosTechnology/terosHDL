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
  getSrc: getSrc,
  getTb : getTb,
  saveProject : saveProject,
  getConfig : getConfig,
  getEdamFileFormat : getEdamFileFormat,
  getEdamFormat:getEdamFormat
}

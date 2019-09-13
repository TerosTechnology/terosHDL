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

function saveProject(file,src,tb){
  var project = {
    'path' : file,
    'src'  : src,
    'tb'   : tb
  }
  var data = JSON.stringify(project);
  fs.writeFileSync(file,data);  
}

function validate(files){
}

module.exports = {
  getSrc: getSrc,
  getTb : getTb,
  saveProject : saveProject
}

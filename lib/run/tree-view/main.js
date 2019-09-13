"use babel"

// Copyright 2019 Teros Tech
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

import {$, CompositeDisposable} from "atom";
import fs from 'fs';
import path from 'path';
import TreeView from './tree-view'
const jsteros = require('jsteros');

var view ;
var idView = 0;
function treeView() {
  //Planteamiento 1: solo hay una visualizacion y se recarga al cerrarla.
  if(view == undefined){
    view = this.view = new TreeView({});
  }

  //Planteamiento 2: hay varias visualizaciones. Cuando se cierra se pierde.
  //Se pueden tener varias y se activan/desactivan.
  // idView += 1;
  // view = this.view = new TreeView({idView});
  atom.workspace.open(this.view,{split: 'left'})
}

export {
  treeView
}

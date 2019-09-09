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
import DocumenterView from './documenter-view'
const jsteros = require('jsteros');

function imageTemplate() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {

    if ( path.extname(editor.getPath())==".vhd" )
      var parser = new jsteros.VhdlParser.VhdlParser();
    else if ( path.extname(editor.getPath())==".v" )
      var parser = new jsteros.VerilogParser.VerilogParser();
    else
      return

    var text = editor.getText();
    var entity   = parser.getEntityName(text);
    var ports    = parser.getPorts(text);
    var generics = parser.getGenerics(text);

    var structure = {
      "entity": entity,
      "generics": generics,
      "ports": ports
    };
    this.view = new DocumenterView({
      structure: structure
    })
    atom.workspace.open(this.view,{split: 'right'})
  }
}

export {
  imageTemplate,
}

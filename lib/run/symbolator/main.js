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
import DocumenterView from './documenter-view'
const jsteros = require('jsteros');

function imageTemplate() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    var text = editor.getText();
    var parser = new jsteros.Parser.VhdlParser();
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

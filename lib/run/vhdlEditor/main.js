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
import path from "path";
const jsteros = require('jsteros');

const DEFAULT_OPTIONS = {signalPrefix: ""}

function instanceComponent(type) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {

    if ( editor.getGrammar().scopeName =="source.vhdl" ){
      var editorHDL = jsteros.VhdlEditor;
      var parser = new jsteros.VhdlParser.VhdlParser();
    }
    else if ( editor.getGrammar().scopeName =="source.verilog" ){
      // var editorHDL = new jsteros.VerilogEditor;
      var parser = new jsteros.VerilogParser.VerilogParser();
    }
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
    var options = {
      "type": type
    };
    return editorHDL.createComponent(structure,options);
  }
}

function tbTemplate(type) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {

    if ( editor.getGrammar().scopeName =="source.vhdl" ){
      var editorHDL = jsteros.VhdlEditor;
      var parser = new jsteros.VhdlParser.VhdlParser();
    }
    else if ( editor.getGrammar().scopeName =="source.verilog" ){
      // var editorHDL = new jsteros.VerilogEditor;
      var parser = new jsteros.VerilogParser.VerilogParser();
    }
    else
      return

    var text = editor.getText();
    var entity    = parser.getEntityName(text);
    var ports     = parser.getPorts(text);
    var generics  = parser.getGenerics(text);
    var libraries = parser.getLibraries(text);

    var structure = {
      "entity": entity,
      "generics": generics,
      "ports": ports,
      "libraries": []
    };
    var options = {
      "type": type
    };
    return editorHDL.createTestbench(structure,options);
  }
}

function magicEditor(type) {
  if (type == "tb")
    var text = tbTemplate("tb");
  else if (type == "vunit")
    var text = tbTemplate("vunit");
  else if (type == "cocotb")
    var text = tbTemplate("cocotb");
  else if (type == "verilator")
    var text = tbTemplate("verilator");
  else
    var text = instanceComponent(type);
  atom.notifications.addSuccess(`${type}' copied to the clipboard`,
                                  {detail: text});
  atom.clipboard.write(text);
}

export {
  magicEditor
}

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

////////////////////////////////////////////////////////////////////////////////
const LANGUAGES = {
  "source.verilog": jsteros.General.LANGUAGES.VERILOG,
  "source.vhdl": jsteros.General.LANGUAGES.VHDL
};

function magicEditor(type,subtype) {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor){
    var scopeName = editor.getGrammar().scopeName;
    var structure = getStructure(editor,scopeName);
    if (structure == null)
      atom.notifications.addInfo("Please, select a valid file.");
    else{
      var options = {
        "type": subtype,
        "language": LANGUAGES[scopeName]
      };
      createTemplate(type,structure,options,scopeName);
    }
  }
  else{
    atom.notifications.addInfo("Please, select a valid file.");
    return;
  }
}

function getStructure(editor,scopeName){
  //Check file extension
  if ( scopeName =="source.vhdl" ){
    var lang = "vhdl";
  }
  else if ( scopeName =="source.verilog" ){
    var lang = "verilog";
  }
  else
    return null;
  //Get structure
  var str = editor.getText();

  var parser = new jsteros.Parser.ParserFactory;
  parser = parser.getParser(lang,'');
  var structure_i =  parser.getAll(str);
  var structure = {
    "entity": structure_i['entity'],
    "generics": structure_i['generics'],
    "ports": structure_i['ports'],
    "libraries": []
  };
  return structure;
}

function createTemplate(type,structure,options){
  var template = new jsteros.Templates.Templates();
  var text = template.getTemplate(type,structure,options);
  if (text==null)
    atom.notifications.addInfo("Please, select a valid file.");
  else{
    atom.notifications.addSuccess(`${type}' copied to the clipboard`,
                                    {detail: text});
    atom.clipboard.write(text);
  }
}

export {
  magicEditor
}

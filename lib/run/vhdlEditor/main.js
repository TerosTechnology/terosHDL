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
    let scope_name = editor.getGrammar().scopeName;
    if (scope_name != "source.verilog" && scope_name != "source.vhdl"){
      atom.notifications.addInfo("Please, select a valid file.");
      return;
    }
    let options = {
      "type": subtype,
      "language": LANGUAGES[scope_name]
    };
    let template = new jsteros.Templates.Templates();
    let code = editor.getText();
    let text = template.getTemplate(type,code,options);
    if (text==null)
      atom.notifications.addInfo("Please, select a valid file.");
    else{
      atom.notifications.addSuccess(`${type}' copied to the clipboard`,
                                      {detail: text});
      atom.clipboard.write(text);
    }
  }
  else{
    atom.notifications.addInfo("Please, select a valid file.");
    return;
  }
}

export {
  magicEditor
}

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

import fs from 'fs';
import path from 'path';
const jsteros = require('jsteros');
import State_machine_view from './views/state-machine-view'

const LANGUAGES = {
  "source.verilog": jsteros.General.LANGUAGES.VERILOG,
  "source.vhdl": jsteros.General.LANGUAGES.VHDL
};

export function get_state_machine_hdl() {
  let editor = atom.workspace.getActiveTextEditor();
  if (editor == null)
    atom.notifications.addInfo("Please, select the state machine code.");

  let code = editor.getSelectedText();
  if (code == "")
    atom.notifications.addInfo("Please, select the state machine code.");

  let scope_name = editor.getGrammar().scopeName;
  if (scope_name != "source.vhdl"){
    atom.notifications.addInfo("This is an experimental feature. Sorry, \
    \ only VHDL is supported. ");
    return;
  }
  let lang = LANGUAGES[scope_name];
  let state_machine_svg = jsteros.Documenter.get_state_machine_hdl_svg(code,lang);

  if (state_machine_svg == null){
    atom.notifications.addInfo("This is an experimental feature. Sorry, this \
    state machine is no supported.");
    return;
  }

  this.view = new State_machine_view({
    svg: state_machine_svg
  })
  atom.workspace.open(this.view,{split: 'right'})
}

//*****************************************************************************/
//***************************** Exports ***************************************/
//*****************************************************************************/
module.exports = {
  get_state_machine_hdl : get_state_machine_hdl
}

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
const smcat = require("state-machine-cat")
import StateMachineView from './state-machine-view'

export function getStateMachineVhdl() {
  let editor = atom.workspace.getActiveTextEditor();
  let scopeName = editor.getGrammar().scopeName;
  let text = editor.getSelectedText()

  if (scopeName == "source.vhdl"){
    var stateMachine = new jsteros.StateMachineVhdl.VhdlStateMachine();
    var stateMachineSvg = stateMachine.getStateMachine(text);
  }
  else if (scopeName == "source.verilog"){
    var stateMachine = new jsteros.StateMachineVhdl.VhdlStateMachine();
    var stateMachineSvg = stateMachine.getStateMachine(text);
  }
  else
    return;
  // try {
      var svg = smcat.render(stateMachineSvg);
      this.view = new StateMachineView({
        svg: svg
      })
      atom.workspace.open(this.view,{split: 'right'})
  // }
  // } catch (pError) {
  //   atom.notifications.addInfo("This is an experimental feature. Sorry, this state machine is not supported.")
  // }
}

//*****************************************************************************/
//***************************** Exports ***************************************/
//*****************************************************************************/
module.exports = {
  getStateMachineVhdl : getStateMachineVhdl
}

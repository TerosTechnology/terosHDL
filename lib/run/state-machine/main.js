'use babel';

// Copyright 2018 Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
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

let svg

class InitProjectView {
  constructor() {

    //-- Load the html template and parse it
    const templateString = fs.readFileSync(
      path.resolve(__dirname, 'views/view-svg.html'),
      {encoding: 'utf-8'});

    const parser = new DOMParser();
    const doc = parser.parseFromString(templateString, 'text/html');
    this.element = doc.querySelector('.apio-template-root').cloneNode(true);
    svg = this.element.querySelector('.myDiv');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    //-- Cancel button
    this.cancelButton.onclick = () => this.handleCancel();
  }
  getElement() {
    return this.element;
  }
  handleCancel() {}
  destroy() {
    this.element.remove();
  }
}

///////////////////////////////////////////////////////////////////////////////

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
  try {
      var lSVGInAString = smcat.render(stateMachineSvg);
      var view = new InitProjectView();
      var panel = atom.workspace.addBottomPanel({item: view.getElement()});
      svg.outerHTML += lSVGInAString
      //-- Cancel button pressed: finish
      view.handleCancel = () => panel.destroy();
  } catch (pError) {
    atom.notifications.addInfo("This is an experimental feature. Sorry, this state machine is not supported.")
  }

}

//*****************************************************************************/
//***************************** Exports ***************************************/
//*****************************************************************************/
module.exports = {
  getStateMachineVhdl : getStateMachineVhdl
}

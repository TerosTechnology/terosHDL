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



export function stateMachine() {
  let editor = atom.workspace.getActiveTextEditor();
  let scopeName = editor.getGrammar().scopeName;
  let text = editor.getSelectedText()

  if (scopeName == "source.vhdl"){
    stateMachineVHDL(text)
  }
  else{

  }

}

export function stateMachineVHDL(code) {
  let codeArray = code.split("\n")
  let states = []
  let statesCount = -1
  let transitionsCount = 0

  for (var i in codeArray) {
    //State definition
    if (codeArray[i].includes("when") == true){
      if (codeArray[i].includes("when others") == true){
        break
      }
      else{
        var stateName = codeArray[i].substring(
          codeArray[i].lastIndexOf("when") + 4,
          codeArray[i].lastIndexOf("=>") - 1
        )
        let stateInst = {
          name: stateName,
          transitions: []
        };
        states.push(stateInst)
        statesCount++
      }
    }
    //Transition condition: if then
    else if (codeArray[i].includes("elsif") == true && codeArray[i].includes("then") == true
    || codeArray[i].includes("else")){
      var condition = codeArray[i].substring(
        codeArray[i].lastIndexOf("elsif")+5,
        codeArray[i].lastIndexOf("then")
      )
      condition = condition.replace('(', '')
      condition = condition.replace(')', '')
      let transitionInst = {
        condition: condition,
        next: ""
      };
      states[statesCount].transitions.push(transitionInst)
      transitionsCount++
    }
    else if (codeArray[i].includes("if") == true && codeArray[i].includes("then") == true){
      var condition = codeArray[i].substring(
        codeArray[i].lastIndexOf("if")+2,
        codeArray[i].lastIndexOf("then")
      )
      condition = condition.replace('(', '')
      condition = condition.replace(')', '')
      let transitionInst = {
        condition: condition,
        next: ""
      };
      states[statesCount].transitions.push(transitionInst)
      transitionsCount=0
    }
    //Transition condition: if then
    else if (codeArray[i].includes("<=") == true && statesCount!=-1){
      var next = codeArray[i].substring(
        codeArray[i].lastIndexOf("<=")+2,
        codeArray[i].lastIndexOf(";")
      )
      states[statesCount].transitions[transitionsCount].next = next
    }
  }

  let go = ""
  for (var i in states) {
    for (var j in states[i].transitions) {
      go += states[i].name + " => " + states[i].transitions[j].next + ": " + states[i].transitions[j].condition + ";\n"
    }
  }

  const smcat = require("state-machine-cat")
  try {
      const lSVGInAString = smcat.render(go);
      var view = new InitProjectView();
      var panel = atom.workspace.addBottomPanel({item: view.getElement()});
      svg.outerHTML += lSVGInAString
      //-- Cancel button pressed: finish
      view.handleCancel = () => panel.destroy();
  } catch (pError) {
      console.error(pError);
  }
}

export function stateMachineVerilog(code) {

}

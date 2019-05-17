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

///////////////////////////////////////////////////////////////////////////////

export function getStateMachineVhdl() {
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
  const smcat = require("state-machine-cat")
  try {
      var go = getSvgStateMachine(code);
      var lSVGInAString = smcat.render(go);
      var view = new InitProjectView();
      var panel = atom.workspace.addBottomPanel({item: view.getElement()});
      svg.outerHTML += lSVGInAString
      //-- Cancel button pressed: finish
      view.handleCancel = () => panel.destroy();
  } catch (pError) {
    atom.notifications.addInfo("This is an experimental feature. Sorry, this state machine is not supported.")
  }
}

function getSvgStateMachine(str){
  var go = getStateMachineVhdl2(str);
  return go;
}

function getStateMachineVhdl2(str){
  var strDel = deleteComments(str);
  var body   = getBody(strDel);
  var states = getStates(body);

  var go = ""
  for(let x=0;x<states.length;++x){
    for(let i=0;i<states[x]['transitions'].length;++i){
      if (states[x]['name']!=="others"){
        if (states[x]['transitions'][i]['condition']== undefined){
          go += states[x]['name'] + " => " + states[x]['transitions'][i]['transition'] + ": "
          + '' + ";\n"
        }
        else{
          go += states[x]['name'] + " => " + states[x]['transitions'][i]['transition'] + ": "
          + states[x]['transitions'][i]['condition'] + ";\n"
        }
      }
    }
  }
  return go;
}

function deleteComments(str){
  str = str.replace(/--(.+)/gi,'');
  return str;
}

function getBody(str){
  var regex = /is([\s\S]*?)end case/gi;
  var body = regex.exec(str);
  return body[1];
}

function getStates(str){
  var regex = /when*[\n\t ]*(.+)*[\n\t ]*=>/gim;
  var states = [];
  var result = regex.exec(str);
  var statesName = [];
  while(result !== null){
    let state = {
      'name' : result[1].replace(/ /gi,''),
      'index' : result['index'],
      'body' : "",
      'transitions' : []
    }
    states.push(state);
    statesName.push(result[1].replace(/ /gi,''));
    result = regex.exec(str);
  }
  for(let x = 0; x<states.length-1; ++x){
    states[x]['body'] = str.substring(states[x]['index'], states[x+1]['index']).replace(/when*[\n\t ]*(.+)*[\n\t ]*=>/gim,'');
  }
  states[states.length-1]['body'] = str.substring(states[states.length-1]['index']);
  for(let x = 0; x<states.length-1; ++x){
    states[x].transitions = getMove(states[x]['body'],statesName);
  }
  return states;
}

function getMove(str,main){
  var cases = getCases(str);
  cases = getTransitions(cases,main);
  return cases;
}

function getCases(str){
  var regexIf = /[\t ]*(if|elsif)(.+)*[\n\t ]*then/gim;
  var regexElse = /(else |else\n)/gim;
  var cases = [];

  var result = regexIf.exec(str);
  while(result !== null){
    let casel = {
      'else' : false,
      'condition' : result[2],
      'index' : result['index'],
      'body' : "",
      'transition' : ""
    };
    cases.push(casel);
    result = regexIf.exec(str);
  }
  result = regexElse.exec(str);
  while(result !== null){
    let casel = {
      'else' : true,
      'condition' : result[2],
      'index' : result['index'],
      'body' : "",
      'transition' : ""
    };
    cases.push(casel);
    result = regexElse.exec(str);
  }
  if(cases.length === 0){
    let casel = {
      'else' : false,
      'condition' : '',
      'index' : 0,
      'body' : str,
      'transition' : ""
    };
    cases.push(casel);
  }
  else{
    for(let x = 0; x<cases.length-1; ++x){
        cases[x]['body'] = str.substring(cases[x]['index'], cases[x+1]['index']).replace(/[\t ]*(if|elsif)(.+)*[\n\t ]*then/gim,'');
    }
    if(cases[cases.length-1]['else'] == false){
      cases[cases.length-1]['body'] = str.substring(cases[cases.length-1]['index']);
      cases[cases.length-1]['body'] = cases[cases.length-1]['body'].replace(/[\t ]*(if|elsif)(.+)*[\n\t ]*then/gim,'');
      cases[cases.length-1]['body'] = cases[cases.length-1]['body'].replace(/(end if)/gim,'');
    }
    else{
      cases[cases.length-1]['body'] = str.substring(cases[cases.length-1]['index']);
      cases[cases.length-1]['body'] = cases[cases.length-1]['body'].replace(/(else |else\n)/gim,'');
      cases[cases.length-1]['body'] = cases[cases.length-1]['body'].replace(/(end if)/gim,'');
    }
  }
  return cases;
}

function getTransitions(cases,main){
  for (let x = 0; x<cases.length; ++x){
    let regex = /([A-Za-z0-9_]+)*[\t\n ]*(<=|< =|:=|: =){1}[]*[\t\n ]*([A-Za-z0-9_]+)*[\t\n ]*;/gmi;
    let result = regex.exec(cases[x]['body']);
    while(result !== null){
      for (let i = 0; i<main.length;++i){
        if(result[3]==main[i]){
          cases[x]['transition'] = result[3];
        }
      }
      result = regex.exec(cases[x]['body']);
    }
  }
  return cases;
}

//*****************************************************************************/
//***************************** Exports ***************************************/
//*****************************************************************************/
module.exports = {
  getStateMachineVhdl : getStateMachineVhdl
}

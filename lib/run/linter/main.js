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

import { exec } from 'child-process-promise';
import { dirname } from 'path';
const jsteros = require('jsteros');

function linter() {

  var verilogLinter = {
    name: 'TerosHDL linter',
    scope: 'file',
    lintsOnChange: false,
    grammarScopes: ['source.verilog'],
    lint: async (textEditor) => {
      const regex = /((?:[A-Z]:)?[^:]+):([^:]+):(.+)/;
      const editorPath = textEditor.getPath();

      const compiler = "iverilog";
      const compileArgs = "";
      const command = '';

      const options = { cwd: dirname(editorPath) };
      const results = [];
      var cmd = compiler + " " + editorPath;

      try {
        await exec(cmd, options);
      } catch ({ stderr }) {
         var messages = parseErrors(stderr,editorPath);
         return messages;
      }
      return [];
    }
  }

  var vhdlLinter = {
    name: 'TerosHDL linter',
    scope: 'file',
    lintsOnChange: false,
    grammarScopes: ['source.vhdl'],
    lint: async (textEditor) => {
      const editorPath = textEditor.getPath();

      const Linter = jsteros.Linter;
      var linter = new Linter.LinterFactory("ghdl");

      var results = [];
      var errors  = await linter.lint(editorPath,"/usr/local/bin/ghdl");
      for (var i=0; i<errors.length;++i){
        const line = errors[i]['location']['position'][0];
        const col  = errors[i]['location']['position'][1];
        const range = [[(+line) - 1, (+col) - 1], [(+line) - 1, 1000]];
        results.push({
          severity: errors[i]['severity'],
          location: {
            file: editorPath,
            position: range,
          },
          excerpt: errors[i]['description'],
          description: errors[i]['description'],
        });
      }
      return results;
    }
  }

  return [verilogLinter,vhdlLinter];
}

function parseErrors(str, file) {
  var PARAMETERS = {
    'SYNT': "iverilog ",
    'ERROR': /[\t\n ]*(.+){1}[\t]*.v:*([0-9]+):*[\t ]*(error):*[\t ]*([a-zA-Z \t0-9-:_.]+)/g,
    'TYPEPOSITION': 3,
    'ROWPOSITION': 2,
    'COLUMNPOSITION': 5,
    'DESCRIPTIONPOSITION': 4,
    'OUTPUT': 1,
  }

  if(str==""){
    return [];
  }
  let errorRegex = PARAMETERS['ERROR']
  let errors = [];
  let result = errorRegex.exec(str);
  while (result !== null) {
    let severity;
    if (result[PARAMETERS['TYPEPOSITION']] !== undefined) {
      severity = result[PARAMETERS['TYPEPOSITION']];
    } else {
      severity = "error";
    }
    let cl = 0;
    if (result[PARAMETERS['COLUMNPOSITION']] == undefined) {
      cl = 0;
    } else {
      cl = parseInt(result[PARAMETERS['COLUMNPOSITION']]);
    }
    let error = {
      'severity': severity.toLowerCase(),
      'location': {
        'file': file,
        // 'position': [parseInt(result[PARAMETERS['ROWPOSITION']]), cl]
        'position' : [[(+parseInt(result[PARAMETERS['ROWPOSITION']])) - 1,
                      (+cl) - 1], [(+parseInt(result[PARAMETERS['ROWPOSITION']])) - 1, 1000]]
      },
      'excerpt': result[PARAMETERS['DESCRIPTIONPOSITION']],
      'description': result[PARAMETERS['DESCRIPTIONPOSITION']]
    };
    errors.push(error);
    result = errorRegex.exec(str);
  }
  return errors;
}

export {
  linter,
}

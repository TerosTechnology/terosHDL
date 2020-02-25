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
    lintsOnChange: atom.config.get("TerosHDL.linters.on-change"),
    grammarScopes: ['source.verilog'],
    lint: async (textEditor) => {
      const editorPath = textEditor.getPath();

      const Linter = jsteros.Linter;
      const linter_type = atom.config.get("TerosHDL.linters.verilog-linter")
      var linter = new Linter.LinterFactory(linter_type);

      var results = [];
      var errors  = await linter.lint(editorPath,"");
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

  var vhdlLinter = {
    name: 'TerosHDL linter',
    scope: 'file',
    lintsOnChange: atom.config.get("TerosHDL.linters.on-change"),
    grammarScopes: ['source.vhdl'],
    lint: async (textEditor) => {
      const editorPath = textEditor.getPath();

      const Linter = jsteros.Linter;
      const linter_type = atom.config.get("TerosHDL.linters.vhdl-linter")
      var linter = new Linter.LinterFactory(linter_type);

      var results = [];
      var errors  = await linter.lint(editorPath,"");
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

export {
  linter,
}

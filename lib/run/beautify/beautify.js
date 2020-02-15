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

const jsteros = require('jsteros');
import Logger from '../../logger/logger'

function beautify() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    var cursorPosition = editor.getCursorBufferPosition();
    let scopeName = editor.getGrammar().scopeName;
    if (scopeName != "source.vhdl"){
      Logger.logWarning("VHDL not supported","");
      return;
    }

    var input = editor.getText();
    var sett = {
      "RemoveComments": atom.config.get('TerosHDL.beautifuler.remove-comments'),
      "RemoveAsserts": atom.config.get('TerosHDL.beautifuler.remove-asserts'),
      "CheckAlias": false,
      "SignAlignSettings": {
          "isRegional": true,
          "isAll": true,
          "mode": atom.config.get('TerosHDL.beautifuler.mode'),
          "keyWords": [
              "FUNCTION",
              "IMPURE FUNCTION",
              "GENERIC",
              "PORT",
              "PROCEDURE"
          ]
      },
      "KeywordCase": atom.config.get('TerosHDL.beautifuler.keyword-case'),
      "TypeNameCase": atom.config.get('TerosHDL.beautifuler.type-name-case'),
      "Indentation": atom.config.get('TerosHDL.beautifuler.indentation'),
      "NewLineSettings": {
          "newLineAfter": [
              ";",
              "then"
          ],
          "noNewLineAfter": []
      },
      "EndOfLine": "\n"
    };
    var output = jsteros.Beautifuler.beauty(input,sett);
    editor.setText(output);
    editor.setCursorBufferPosition(cursorPosition);
  }
}




export {
  beautify,
}
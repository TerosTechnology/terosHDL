"use babel"
// Copyright (C) 2016 Pete Burgers
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.

import {$, CompositeDisposable} from "atom";
import path from "path";
import {tbAXI, tbNoAXI} from "./tbgenerator"
import {longestinArray, rpad} from "./utils"
import Parser from "./parser"
import markdownTable from "./markdownTable"

let StyleguideView = null

const DEFAULT_OPTIONS = {signalPrefix: ""}

function componentTemplateTb(entity, options = DEFAULT_OPTIONS) {
  let text = ` component ${entity.name} is\n`
  if (entity.generics.length > 0) {
    text += `      generic (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `        ${name} : ${generic.type}`
      if (generic.default) {
        text += ` := ${generic.default}`
      }
      text += `;\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n      );\n`
  }

  if (entity.ports.length > 0) {
    text += `      port (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      const dir = rpad(port.dir, 3)
      text += `        ${name} : ${dir} ${port.type};\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n      );\n`
  }

  text += `    end component;\n`  //   text += `end component ${entity.name};\n`
  return text
}

function componentTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = ` component ${entity.name} is\n`
  if (entity.generics.length > 0) {
    text += `   generic (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `     ${name} : ${generic.type}`
      if (generic.default) {
        text += ` := ${generic.default}`
      }
      text += `;\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n   );\n`
  }

  if (entity.ports.length > 0) {
    text += `   port (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      const dir = rpad(port.dir, 3)
      text += `     ${name} : ${dir} ${port.type};\n`
    }
    // Strip the final semicolon
    text = text.slice(0, -2)
    text += `\n   );\n`
  }

  text += ` end component;\n`  //   text += `end component ${entity.name};\n`
  return text
}

function instanceTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = `${entity.name}_i : ${entity.name}`
  if (entity.generics.length > 0) {
    text += `\ngeneric map (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `  ${name} => ${generic.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  if (entity.ports.length > 0) {
    text += `\nport map (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `  ${name} => ${port.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n)`
  }

  text += `;\n`
  return text
}

function signalsTemplate(entity, options = DEFAULT_OPTIONS) {
  let text = ""
  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `signal ${name} : ${port.type};\n`
    }
  }

  return text
}

function docPorts(entity, options = DEFAULT_OPTIONS) {
  let text = ""
  let table = []
  table.push(["Port name","Type","Description"])
  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      table.push([port.name,port.type,""])
    }
    text = markdownTable(table)
  }

  return text
}

function tbTemplate(entity, options = DEFAULT_OPTIONS) {
  text = ""
  axi_check = ""
  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      if (port.name.indexOf("axi")!=-1){
        axi_check = "axi"
        break
      }
      else{
        axi_check = "noaxi"
      }
    }
  }

  if (axi_check == "axi"){
    text = tbAXI(entity, options = DEFAULT_OPTIONS)
  }
  else{
    text = tbNoAXI(entity, options = DEFAULT_OPTIONS)
  }
  return text
}

function copyBase(type, template) {
  const entity = selectAndParseEntity()
  if (entity == null){
    atom.notifications.addError(
      "error",
      {detail: "Please, select a vhdl entity."
    })
    return
  }
  if (!entity) {
    const text = template(entity)
    atom.clipboard.write(text)
    atom.notifications.addSuccess(`${type}' copied to the clipboard`,
                                  {detail: text})
    return
  } else {
    const text = template(entity)
    atom.clipboard.write(text)
    atom.notifications.addSuccess(`${type} for '${entity.name}' copied to the clipboard`,
                                  {detail: text})
  }
}

function selectAndParseEntity() {
  const editor = atom.workspace.getActivePaneItem()
  let entityRange = getScopeRange(editor, "meta.block.entity.vhdl")
  if (!entityRange) {
    return null
  }
  // Include the trailing semicolon
  entityRange = entityRange.translate(0, [1, 0])

  editor.setSelectedBufferRange(entityRange)
  const entity = new Parser(editor.getTextInBufferRange(entityRange))

  return {name: entity.name,
          generics: entity.generics,
          ports: entity.ports}
}

function getScopeRange(editor, scopeName) {
  var fullRange = editor.bufferRangeForScopeAtCursor(scopeName)
  if (!fullRange) {
    return null
  }

  // Search backwards line by line until we're outside the scope
  let range
  while ((range = editor.bufferRangeForScopeAtCursor(scopeName)) !== undefined) {
    fullRange = fullRange.union(range)
    if (fullRange.start.row === 0) {
      break
    }
    editor.setCursorBufferPosition(range.start)
    editor.moveLeft()
  }

  // Search forwards line by line until we're outside the scope
  editor.setCursorBufferPosition(fullRange.end)
  editor.moveRight()
  while ((range = editor.bufferRangeForScopeAtCursor(scopeName)) !== undefined) {
    fullRange = fullRange.union(range)
    if (fullRange.end.row === editor.getLastBufferRow()) {
      break
    }
    editor.setCursorBufferPosition(range.end)
    editor.moveRight()
  }
  return fullRange
}

export {
  docPorts,
  copyBase,
  getScopeRange,
  selectAndParseEntity,
  componentTemplate,
  componentTemplateTb,
  instanceTemplate,
  signalsTemplate,
  tbTemplate
}

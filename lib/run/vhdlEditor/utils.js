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

export function longestinArray(array, attr) {
  let longest = 0
  for (let object of array) {
    if (object[attr].length > longest) {
      longest = object.name.length
    }
  }
  return longest
}

export function rpad(string, length, padChar = " ") {
  while (string.length < length) {
    string = string + padChar
  }
  return string
}

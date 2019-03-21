'use babel';

// Copyright 2019 Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
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

let cachedPackageName = undefined;

export function packageName() {
	return cachedPackageName = cachedPackageName || fetchPackageName('../../package.json', 'TerosHDL');
}

export function fetchPackageName(module, defaultName) {
	try {
		const pjson = require(module);
		return pjson.name;
	} catch (error) {
		return defaultName;
	}
}

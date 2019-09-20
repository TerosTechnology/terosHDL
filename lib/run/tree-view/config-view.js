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

import { CompositeDisposable, Disposable } from 'atom';

const pathLib = require('path')
const fs = require('fs')
const ViewConfig = require('./views/Config')
const Manager    = require('./manager')
const {dialog}   = require('electron').remote
const jsTeros    = require('jsteros')

var projectPath = ""

export default class TreeView {
   constructor(
      config,
      suites
   ) {
      this.subscriptions = new CompositeDisposable()
      this.reloading = false
      this.idView    = ''
      this.element = document.createElement('div')
      // this.element.setAttribute('id', 'atombrowser-view')
      this.element.innerHTML += ViewConfig()

      this.getTitle = () => 'TerosHDL config',
         this.getURI = () => 'atom://terosHDL/manager_config' + this.idView
      this.getAllowedLocations = () => ['top']

      //Variables
      this.config = config;
      this.suites = suites;

      // wait for the html to be appended
      this.html = this.selectHtml();
      this.setEvents();
      this.setDefaults();
      this.setSuites();
   }
   selectHtml() {
      return {
        select: {
           suite: this.element.querySelector('#config-select-suite'),
           simulator: this.element.querySelector('#config-select-simulator'),
           language: this.element.querySelector('#config-select-language')
        },
        tab: {
           general: this.element.querySelector('#tab-general'),
           test: this.element.querySelector('#tab-test')
        },
        text: {
           testName: this.element.querySelector('#text-test-name'),
           topLevel: this.element.querySelector('#text-top-level')
        },
        btn: {
          tabGeneral: this.element.querySelector('#btn-tab-general'),
          tabTest: this.element.querySelector('#btn-tab-test'),
          ok: this.element.querySelector('#config-ok'),
          cancel: this.element.querySelector('#config-cancel')
        }
      }
   }
   setDefaults(){
     this.html.text.testName.value = this.config["testName"];
     this.html.text.topLevel.value = this.config["topLevel"];
   }
   setEvents(){
     //this.html.select.suite.addEventListener('change', () => this.changeSuite())
     //this.html.select.simulator.addEventListener('change', () => this.changeSimulator())
     this.html.btn.tabGeneral.addEventListener('click', () => this.switchGeneral())
     this.html.btn.tabTest.addEventListener('click', ()    => this.switchTest())
     this.html.btn.ok.addEventListener('click', ()     => this.saveConfig())
     this.html.btn.cancel.addEventListener('click', () => this.cancelConfig())
   }
   isInDom() {
      return document.body.contains(this.element)
   }
   getConfig(){
     return this.config;
   }
   setSuites(){
     this.removeOptions(this.html.select.suite);
     for (var i=0;i<this.suites.length;++i){
       var option = document.createElement("option");
       option.text = this.suites[i]['name'];
       this.html.select.suite.add(option);
     }
     this.setSimulators(this.suites,this.html.select.suite.value);
   }
   setSimulators(suites,suite){
     this.removeOptions(this.html.select.simulator);
     var simulators;
     for (var i=0;i<suites.length;++i){
       if(suites[i]['name'] == suite){
         simulators = suites[i]['simulators']
         break;
       }
     }
     for (var i=0;i<simulators.length;++i){
       var option = document.createElement("option");
       option.text = simulators[i]['name'];
       this.html.select.simulator.add(option);
     }
     this.setLanguages(simulators,this.html.select.simulator.value);
   }
   setLanguages(simulators,simulator){
     this.removeOptions(this.html.select.language);
     var languages;
     for (var i=0;i<simulators.length;++i){
       if(simulators[i]['name'] == simulator){
         languages = simulators[i]['languages']
         break;
       }
     }
     for (var i=0;i<languages.length;++i){
       var option = document.createElement("option");
       option.text = languages[i]['name'];
       this.html.select.language.add(option);
     }
   }
   removeOptions(select){
     for(var i=select.length-1;i>=0;--i){
       select.remove(i);
     }
   }
   /*------------------------------------------------------------------------*/
   /*----------------------------| button actions |--------------------------*/
   /*------------------------------------------------------------------------*/
   saveConfig(){
   }
   cancelConfig(){
   }
   switchGeneral(){
     this.html.tab.general.style.display = "block";
     this.html.tab.test.style.display = "none";
   }
   switchTest(){
     this.html.tab.general.style.display = "none";
     this.html.tab.test.style.display = "block";
   }
   changeSuite(){
     this.setSimulators(this.suites,this.html.select.suite.value);
   }
   changeSimulator(){
     var simulators;
     for (var i=0;i<suites.length;++i){
       if(suites[i]['name'] == suite){
         simulators = suites[i]['simulators']
         break;
       }
     }
     setLanguages(simulators,this.html.select.simulator.value);
   }





}

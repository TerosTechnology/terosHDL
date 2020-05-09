module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
         <!-- back / reload / refresh-on-save -->
         <button style="width: 49%" id="btn-load-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Load Project</button>
         <button style="width: 48%" id="btn-save-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Save Project</button>

         <button style="width: 49%"id="btn-configuration" class="btn"><i class="icon icon-gear"></i>Configuration</button>
         <button style="width: 48%"id="btn-save-doc-markdown" class="btn"><i class="icon icon-book"></i>Generate doc</button>

         <button style="width: 32%" id="btn-add-source" class="btn"><i class="icon icon-plus"></i>Source</button>
         <button style="width: 32%" id="btn-add-tb"     class="btn"><i class="icon icon-plus"></i>Test</button>
         <button style="width: 32%" id="btn-clear"      class="btn"><i class="icon icon-trashcan"></i>Clear</button>

         <button style="width: 32%;margin:0px"id="btn-play"        class="btn btn-success inline-block-tight"><i class="icon icon-playback-play"></i>Play</button>
         <button style="width: 32%;margin:0px"id="btn-stop"        class="btn btn-error inline-block-tight"><i class="icon icon-primitive-square"></i>Stop</button>
         <button style="width: 32%;margin:0px"id="btn-list-tests"  class="btn btn-list-test inline-block-tight"><i class="icon icon-list-ordered"></i>List</button>
       </atom-panel>
   `.trim()
}

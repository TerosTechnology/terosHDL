module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
         <!-- back / reload / refresh-on-save -->
         <button style="margin-rigth:1.5%" id="btn-load-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Load</button>
         <button style="margin-rigth:1.5%" id="btn-save-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Sav</button>
         <button style="margin-rigth:1.5%" id="btn-clear" class="btn"><i class="icon icon-trashcan"></i>Clear</button>
         <button style="margin-rigth:1.5%" id="btn-add-source" class="btn"><i class="icon icon-plus"></i>Src</button>
         <button style="margin-rigth:1.5%" id="btn-add-tb" class="btn"><i class="icon icon-plus"></i>Tb</button>
         <button style="margin-rigth:1.5%"id="btn-configuration" class="btn"><i class="icon icon-gear"></i></button>
         <button style="margin-rigth:1.5%"id="btn-play" class="btn btn-success inline-block-tight"><i class="icon icon-playback-play"></i></button>
         <button style="margin-rigth:1.5%"id="btn-stop" class="btn btn-error inline-block-tight"><i class="icon icon-primitive-square"></i></button>
         <button style="margin-rigth:1.5%"id="btn-list-tests" class="btn btn-list-test inline-block-tight"><i class="icon icon-primitive-circle"></i>List</button>
         <button style="margin-rigth:1.5%" id="btn-save-doc-markdown" class="btn"><i class="icon icon-file-symlink-directory"></i>Markdown</button>
       </atom-panel>
   `.trim()
}

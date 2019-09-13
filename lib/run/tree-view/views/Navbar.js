module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
         <!-- back / reload / refresh-on-save -->
         <button style="margin-rigth:1.5%" id="btn-load-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Load</button>
         <button style="margin-rigth:1.5%" id="btn-save-project" class="btn"><i class="icon icon-file-symlink-directory"></i>Save</button>
         <button style="margin-rigth:1.5%" id="btn-add-source" class="btn"><i class="icon icon-plus"></i>Src</button>
         <button style="margin-rigth:1.5%" id="btn-add-tb" class="btn"><i class="icon icon-plus"></i>Tb</button>
         <button style="margin-rigth:1.5%"id="btn-configuration" class="btn"><i class="icon icon-gear"></i></button>
      </atom-panel>
   `.trim()
}

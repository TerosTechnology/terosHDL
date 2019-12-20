module.exports = () => {
   return  `
      <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
         <!-- back / reload / refresh-on-save -->
         <button style="margin-rigth:1.5%" id="btn-markdown" class="btn"><i class="icon icon-markdown"></i>Markdown</button>
         <button style="margin-rigth:1.5%"id="btn-pdf" class="btn"><i class="icon icon-file-pdf"></i>PDF</button>
         <button style="margin-rigth:1.5%" id="btn-html" class="btn"><i class="icon icon-file"></i>HTML</button>
         <button style="margin-rigth:1.5%" id="btn-image" class="btn"><i class="icon icon-file-media"></i>Image</button>
      </atom-panel>
   `.trim()
}

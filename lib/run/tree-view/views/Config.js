module.exports = () => {
   return  `
   <atom-panel id="atombrowser-navbar" class="padded native-key-bindings">
     <div style="display:inline" class="tab">
       <button class="btn btn-lg" style="width:50%" id="btn-tab-general">General</button>
       <button class="btn btn-lg" style="width:49%" id="btn-tab-test">Test</button>
     </div>

     <div id="tab-general" style="display:block">
       <section>
         <h2>Select suite: </h2>
         <p class="selected-placeholder"></p>
         <ul class="selected-modes"></ul>
       </section>
       <section>
         <div class="mode-select-wrapper">
           <div class="settings-view">
             <select id="config-select-suite" class="mode-select form-control">
             </select>
           </div>
         </div>
       </section>

       <section>
         <h2>Select simulator: </h2>
         <p class="selected-placeholder"></p>
         <ul class="selected-modes"></ul>
       </section>
       <section>
         <div class="mode-select-wrapper">
          <div class="settings-view">
             <select id="config-select-simulator" class="mode-select form-control">
             </select>
           </div>
         </div>
       </section>

       <section>
         <h2>Select Language: </h2>
         <p class="selected-placeholder"></p>
         <ul class="selected-modes"></ul>
       </section>
       <section>
         <div class="mode-select-wrapper">
          <div class="settings-view">
             <select id="config-select-language" class="mode-select form-control">
             </select>
           </div>
         </div>
       </section>
     </div>

     <div id="tab-test" style="display:none">
       <section>
         <h2>Test name: </h2>
         <input class='input-text' type='text' id='text-test-name' type='search' placeholder='Test name'>
       </section>
       <section>
         <h2>Top level: </h2>
         <input class='input-text' type='text' id='text-top-level' type='search' placeholder='Select top level from click right in the project manager or in the dependency viewer.' disabled>
       </section>
       <section>
         <h2>Working directory: </h2>
         <textarea id='text-working-directory' class="list-module input-textarea" type="text" readonly></textarea>
         <button id='btn-directory-select' class="module-sources-button btn btn-default">Select</button>
         <!-- <button id='btn-directory-clear' class="clean-button-src n icon icon-trashcan btn btn-success selected inline-block-tight">Clear</button> -->
       </section>
       <p></p>
       <section>
         <button style="width:100%" id="btn-config-gtkwave" class="btn icon icon-pulse inline-block-tight">GTKWave config</button>
       </section>

     </div>

     <section>
       </br>
       <div class="controls">
         <button id="config-ok" class="do-init btn btn-lg btn-primary">Ok</button>
         <button id="config-cancel" class="cancel btn btn-lg btn-link">Cancel</button>
       </div>
     </section>
    </atom-panel>

   `.trim()
}

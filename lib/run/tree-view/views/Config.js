module.exports = () => {
   return  `
     <div class="tab">
       <button id="btn-tab-general">General</button>
       <button id="btn-tab-test">Test</button>
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
         <input id='text-test-name' type='search' placeholder='Test name'>
       </section>
       <section>
         <h2>Top level: </h2>
         <input id='text-top-level' type='search' placeholder='Top level'>
       </section>
       <section>
         <h2>Working directory: </h2>
         <input id='text-working-directory' type='search' placeholder='Working directory'>
       </section>
     </div>

     <section>
       </br>
       <div class="controls">
         <button id="config-ok" class="do-init btn btn-lg btn-primary">Ok</button>
         <button id="config-cancel" class="cancel btn btn-lg btn-link">Cancel</button>
       </div>
     </section>

   `.trim()
}

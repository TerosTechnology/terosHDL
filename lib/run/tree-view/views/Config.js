module.exports = () => {
   return  `

     <section>
       <h2>Select suite: </h2>
       <p class="selected-placeholder"></p>
       <ul class="selected-modes"></ul>
     </section>
     <section>
       <div class="mode-select-wrapper">
         <div class="settings-view">
           <select id="config-select-suite" class="mode-select form-control">
             <option value="terminal">Terminal</option>
             <option value="pepe">Pepe</option>
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
             <option value="terminal">Terminal</option>
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
             <option value="terminal">Terminal</option>
           </select>
         </div>
       </div>
     </section>

     <section>
       </br>
       <div class="controls">
         <button id="config-ok" class="do-init btn btn-lg btn-primary">Ok</button>
         <button id="config-cancel" class="cancel btn btn-lg btn-link">Cancel</button>
       </div>
     </section>

   `.trim()
}

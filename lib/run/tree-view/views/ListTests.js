module.exports = () => {
   return  `

   <div class="tests">
     <!-- Registers -->
     <sectionconfig-select-suite>
       <!-- Tittle -->
       <h1>Tests</h1>
       <div class="index-config">
       </div>
       </br>
       <!-- Controls -->
       <div class="controls">
         <div style="overflow:auto;height:500px;">
           <table class="table-table"></table>
         </div>
         <center>
         <div class="table-loadload"><span class='loading loading-spinner-large'></span></div>
         </center>
         <p></p>
         <p></p>
         <p></p>
         <button class="table-cancel btn btn-lg btn-link">Back</button>
         <button class="table-init btn btn-lg btn-primary">Apply</button>
       </div>
     </section>
   </div>

   `.trim()
}

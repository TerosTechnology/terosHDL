module.exports = () => {
   return  `
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

   <style>
     .teros-icon {
       content: url('/home/carlos/repositorios/terosHDL/lib/run/tree-view/views/icon.png');
       height: 27px;
       width: 27px;
     }
   </style>

   <label style="padding: 5%;float: right;" class='input-label'><input class='input-toggle' type='checkbox' checked>    </label>

   <ul class='list-tree has-collapsable-children'>
     <li class='list-nested-item'>
       <div class='list-item'>
         <span class='teros-icon'></span>
         <span>TerosHDL Project</span>
       </div>



       <ul class='list-tree'>
         <li class='list-nested-item' id="tree-src">
           <div class='list-item'>
             <span class='icon icon-file-directory'>Sources</span>
           </div>
         </li>

         <li class='list-nested-item' id="tree-tb">
           <div class='list-item'>
             <span class='icon icon-file-directory'>Testbenchs</span>
           </div>
         </li>
       </ul>



     </li>
   </ul>
   `.trim()
}

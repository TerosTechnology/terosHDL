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

   <ul class='list-tree has-collapsable-children'>
     <li class='list-nested-item'>
       <div class='list-item'>
         <span class='teros-icon'></span>
         <span>TerosHDL Project</span>
       </div>

       <ul class='list-tree'>
         <li class='list-nested-item'>
           <div class='list-item'>
             <span class='icon icon-file-directory'>Sources</span>
           </div>

           <ul class='list-tree'>
             <li class='list-item'>
               <span class='icon icon-file-text'>axi_lite.vhd</span>
             </li>
           </ul>
           <ul class='list-tree'>
             <li class='list-item'>
               <span class='icon icon-file-text'>top.vhd</span>
             </li>
           </ul>
         </li>

         <li class='list-nested-item'>
           <div class='list-item'>
             <span class='icon icon-file-directory'>Testbenchs</span>
           </div>

           <ul class='list-tree'>
             <li class='list-item'>
               <span class='icon icon-file-text'>top_tb.vhd</span>
             </li>
           </ul>
         </li>
       </ul>
     </li>

     <li class='list-item'>
       <span class='icon icon-file-text'>.icon-file-text</span>
     </li>

     <li class='list-item'>
       <span class='icon icon-file-symlink-file'>.icon-file-symlink-file</span>
     </li>
   </ul>
   `.trim()
}

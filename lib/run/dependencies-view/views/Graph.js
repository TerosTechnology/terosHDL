// module.exports = () => {
//    return  `
//    <atom-panel id="atombrowser-navbar" class="padded native-key-bindings" style="background-color:white;width:1080px;height:1080px">
//    </atom-panel>
//    `.trim()
// }


module.exports = () => {
   return  `
   <atom-panel id="atombrowser-navbar" class="padded native-key-bindings" style="background-color:white;width:100%;height:100%">
     <div style="background-color:white;width:100%;height:100%" id="graph" style="text-align: center;"></div>
   </atom-panel>
   `.trim()
}

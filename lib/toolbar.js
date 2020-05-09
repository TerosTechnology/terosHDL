function setToolbar(toolBar) {

  toolBar.addButton({
    text: '<b>Teros</b>HDL',
    html: true,
    callback: 'TerosHDL:repo',
    priority: 210
  });

  //Spacer
  toolBar.addSpacer({
    priority: 220 })
    //Spacer
    toolBar.addSpacer({
      priority: 220 })

  toolBar.addButton({
    text: '<b>S</b>upport <b>u</b>s',
    html: true,
    callback: 'TerosHDL:donate',
    priority: 999
  });

  //Spacer
  toolBar.addSpacer({
    priority: 220 })

  //Initialize project
  buttonComponent = toolBar.addButton({
     icon: 'file-code',
     tooltip: 'Project viewer',
     callback: 'TerosHDL:initialize-project',
     priority: 225
   });

  //Component
  buttonComponent = toolBar.addButton({
     icon: 'checklist',
     tooltip: 'Beautifuler',
     callback: 'TerosHDL:beautify',
     priority: 230
   });

  //Doc
  toolBar.addButton({
    icon: 'book',
    callback: 'TerosHDL:copy-as-image',
    tooltip: 'Show documentation',
    priority: 320
  })

  //Doc
  toolBar.addButton({
    icon: 'database',
    callback: 'TerosHDL:dependencies-view',
    tooltip: 'Dependencies viewer',
    priority: 321
  })

  //Spacer
  toolBar.addSpacer({
    priority: 330 })

  //Info
  toolBar.addButton({
    icon: 'info',
    tooltip: 'Help',
    callback: 'TerosHDL:info',
    priority: 360
  })

  return toolbar;
}

module.exports = {
  setToolbar : setToolbar
}

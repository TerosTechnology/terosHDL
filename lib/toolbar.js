function setToolbar(toolBar) {

  toolBar.addButton({
    text: '<b>Teros</b>HDL',
    html: true,
    callback: 'TerosHDL:repo',
    priority: 210
  });

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
     tooltip: 'Initialize project/Add module',
     callback: 'TerosHDL:initialize-project',
     priority: 225
   });

  //Component
  buttonComponent = toolBar.addButton({
     text: '<b>C</b>',
     html: true,
     tooltip: 'Copy as component',
     callback: 'TerosHDL:copy-as-component',
     priority: 230
   });

  //Instance
  toolBar.addButton({
    text: '<b>I</b>',
    html: true,
    tooltip: 'Copy as instance',
    callback: 'TerosHDL:copy-as-instance',
    priority: 240
  });
  //Signal
  toolBar.addButton({
    text: '<b>S</b>',
    html: true,
    tooltip: 'Copy as signal',
    callback: 'TerosHDL:copy-as-signals',
    priority: 250
   });

  //Testbenchcopy-as-component
  toolBar.addButton({
    text: '<b>Tb</b>',
    html: true,
    tooltip: 'Copy as testbench',
    callback: 'TerosHDL:copy-as-tb',
    priority: 260
  });

  //Vunit
  toolBar.addButton({

    text: '<b>V</b>',
    html: true,
    tooltip: 'Create VUnit file',
    callback: 'TerosHDL:create-run',
    priority: 270
  });

  //Tree
  toolBar.addButton({
    icon: 'eye',
    callback: 'TerosHDL:show-structure',
    tooltip: 'Code structure.',
    priority: 271
  })

  //Spacer
  toolBar.addSpacer({
    priority: 280 })

  //Spacer
  toolBar.addSpacer({
    priority: 310 })

  //Diagram
  toolBar.addButton({
    icon: 'file-media',
    callback: 'TerosHDL:copy-as-image',
    tooltip: 'Copy as diagram',
    priority: 320
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

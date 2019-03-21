# User manual

## Introduction

The idea is that the toolbar has the main functionalities. Each of them is represented as an icon.

![Toolbar](./images/toolbar.png)

This is a representation of the IDE workflow from left to right.

1. Create repository
2. Create files/testbench.
3. Create Vunit file.
4. Run test.
5. Document design.

## Create repository

![repository](./images/toolbar_repo.png)

Add files or creates a repository estructure with an example design.

## Create component

![repository](./images/toolbar_component.png)

Put the mouse inside an VHDL entity and click the button. This will copy to clipboard a component estructure of the entity.

## Create instance

![repository](./images/toolbar_instance.png)

Put the mouse inside an VHDL entity and click the button. This will copy to clipboard an instance of the entity.

## Create signals

![repository](./images/toolbar_signals.png)

Put the mouse inside an VHDL entity and click the button. This will copy to clipboard the signals of the entity ports.

## Create testbench

![repository](./images/toolbar_testbench.png)

Put the mouse inside an VHDL entity and click the button. This will copy to clipboard a template to create a testbench of the entity with Vunit framework.
If AXI lite is being used the testbench will include code to test the bus with UVVM libraries.

## Create run.py

![repository](./images/toolbar_vunit.png)

This will open a dialog to select the source files and the testbench files. You can also select the location of the file, the name and to include libraries for simulation.
You can also mark other checks if you wish to modify the python file manually and add more complex test.

## Run.py arguments configuration

![repository](./images/toolbar_configtest.png)

Here you can configure some things about run.py:
1. Add custom arguments to be executed each time the run test button is pressed.
2. Select the run.py file for run test button
3. Select which test should be executed.
4. Select the oputput of the test Terminal or waveform.
5. Select the waveform file to be opened automatically to view the results.

![repository](./images/run_test_config.png)

![repository](./images/test_selection.png)

## Run test

![repository](./images/toolbar_runtest.png)

This is the button used to run the test in your design with the previous configuration.

![repository](./images/test_output.png)

## Recompile

Sometimes you need to recompile the whole design, it can be done that with this button.

![repository](./images/toolbar_refresh.png)

## Browse code coverage report

Take into acount that the code coverage is the sum of all the test run

![repository](./images/toolbar_coverage.png)

## Switch simulator.

Switch between simulators just pressing this button.

![repository](./images/toolbar_simulator.png)

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

## Code structure

![repository](./images/toolbar_ctags.png)

This button open or close the structure view panel.

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

## Stop test

![repository](./images/toolbar_stoptest.png)

If you wish to cancel the a launched test you can use this button.

## Recompile

![repository](./images/toolbar_refresh.png)

Sometimes you need to recompile the whole design, it can be done that with this button.

## Browse code coverage report

![repository](./images/toolbar_coverage.png)

Take into acount that the code coverage is the sum of all the test run.

***It is necessary to recompile if you want to update the code coverage.***

## Switch simulator.

![repository](./images/toolbar_simulator.png)

Switch between simulators just pressing this button.

## Symbolator view.

![repository](./images/toolbar_symbolator.png)

![repository](./images/symbolator_component.png)

Here you can create an image of the inputs and outputs of the module. You just need to put the cursor selecting the component of a module you want to draw.

## Copy as doc.

![repository](./images/toolbar_portdoc.png)

With this button you will get a port table in markdown format of an entity of your choice.

| Port name | Type                          | Description |
| --------- | ----------------------------- | ----------- |
| clk       | std_logic                     |   N/A       |
| reset     | std_logic                     |   N/A       |
| in_1      | std_logic_vector (4 downto 0) |   N/A       |
| in_2      | std_logic_vector (4 downto 0) |   N/A       |
| in_3      | std_logic_vector (4 downto 0) |   N/A       |
| sum       | std_logic_vector (7 downto 0) |   N/A       |


## Link to this manual.

![repository](./images/toolbar_usermanual.png)

You will be redirected to the last versión of the manual. Make sure it matches with your TerosHDL version.


## Toggle console.

![repository](./images/toolbar_toggleconsole.png)

Pressing this button you can show or hide the console panel.

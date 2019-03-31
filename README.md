<img src="./doc/images/teros_logo.png" align="right" width=15%>

# TerosHDL

**Our philosophy is: think in hardware, develop hardware, [take advantage of software tools.](https://github.com/qarlosalberto/fpga-knife)**

The goal of TerosHDL is make the FPGA development easier and reliable.  It is a powerful open source IDE.


Currently we support:

- Ghdl.
- ModelSim.
- Vhdl
- VUnit.

Soon we will support Verilog, Windows and others simulators.


## Dependencies

- Symbolator:
```pip install symbolator```
- TerosHDLbackend >= 0.1.0:
```pip install TerosHDL```
- VUnit:
```pip install vunit_hdl```

For simulation:

- Ghdl/Modelsim

For code coverage:

- Ghdl with GCC backend.

For waveform:

- GTKWave/ModelSim

## Installation

```apm install terosHDL```

## Getting started guide

### Runing test

![Running_test](https://raw.githubusercontent.com/TerosTechnology/terosHDL/develop/doc/images/run_test.gif
)

### Code coverage

![Code_coverage](https://raw.githubusercontent.com/TerosTechnology/terosHDL/develop/doc/images/code_coverage_1.gif
)

### Creating component diagram

![diagram](https://raw.githubusercontent.com/TerosTechnology/terosHDL/develop/doc/images/diagram.gif)

### Structure view

![diagram](https://raw.githubusercontent.com/TerosTechnology/terosHDL/develop/doc/images/view.gif)

### State machine diagram

This is an experimental feature. Not all state machines are supported.

![diagram](https://raw.githubusercontent.com/TerosTechnology/terosHDL/develop/doc/images/state_machine.gif
)

## User Manual

You have a complete [user manual.](https://github.com/TerosTechnology/terosHDL/blob/master/doc/User_Manual.md)

# License

Copyright (c) 2018-Present
- Carlos Alberto Ruiz Naranjo, <carlosruiznaranjo@gmail.com>
- Ismael Pérez Rojo, <ismaelprojo@gmail.com>

TerosHDL is licensed under GPLv3.

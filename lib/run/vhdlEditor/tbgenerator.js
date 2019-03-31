"use babel"

// Copyright 2018 DAS Photonics
// Carlos Alberto Ruiz Naranjo, Ismael Pérez Rojo
//
// This file is part of ATOMato.
//
// TerosHDL is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TerosHDL is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TerosHDL.  If not, see <https://www.gnu.org/licenses/>.

import {$, CompositeDisposable} from "atom";
import {longestinArray,rpad} from "./utils"
import {componentTemplateTb} from "./main"

export function tbAXI(entity, options = DEFAULT_OPTIONS) {
  let library = "use ieee.numeric_std.all;"
  if (entity.libraryNoStandard == true){
    library = "use ieee.std_logic_arith.all;"
  }
  let text = ""

  text += `  --! Standard library.
  library ieee;
  --! Logic elements.
  use ieee.std_logic_1164.all;
  --! Arithmetic functions.
  ${library}
  --
  library std;
  use std.textio.all;
  --
  library src_lib;
  -- use src_lib.types_declaration_${entity.name}_pkg.all;
  --
  library bitvis_vip_axilite;
  use bitvis_vip_axilite.axilite_bfm_pkg.all;
  --
  library uvvm_util;
  context uvvm_util.uvvm_util_context;
  use uvvm_util.methods_pkg.all;
  -- vunit
  library vunit_lib;
  context vunit_lib.vunit_context;
  -- use vunit_lib.array_pkg.all;
  -- use vunit_lib.lang.all;
  -- use vunit_lib.string_ops.all;
  -- use vunit_lib.dictionary.all;
  -- use vunit_lib.path.all;
  -- use vunit_lib.log_types_pkg.all;
  -- use vunit_lib.log_special_types_pkg.all;
  -- use vunit_lib.log_pkg.all;
  -- use vunit_lib.check_types_pkg.all;
  -- use vunit_lib.check_special_types_pkg.all;
  -- use vunit_lib.check_pkg.all;
  -- use vunit_lib.run_types_pkg.all;
  -- use vunit_lib.run_special_types_pkg.all;
  -- use vunit_lib.run_base_pkg.all;
  -- use vunit_lib.run_pkg.all;

  entity ${entity.name}_tb is
    --vunit
    generic (runner_cfg : string);
  end;

  architecture bench of ${entity.name}_tb is
  `
  // text+=` ${componentTemplateTb(entity)}`
  text+=`
    -- clock period
    constant axi_aclk_period : time := 5 ns;
    constant clk_period      : time := axi_aclk_period;
    -- Signal ports
  `

  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `    signal ${name} : ${port.type};\n`
    }
  }

  text += `
    subtype ST_AXILite_32 is t_axilite_if  (
      write_address_channel (
          awaddr(31 downto 0)  ),
      write_data_channel (
          wdata(31 downto 0),
          wstrb(3 downto 0)  ),
      read_address_channel (
          araddr(31 downto 0)  ),
      read_data_channel (
          rdata(31 downto 0)  )
    );
    constant C_AXILITE_BFM_CONFIG : t_axilite_bfm_config := (
      max_wait_cycles            => 10,
      max_wait_cycles_severity   => TB_FAILURE,
      clock_period               => 5 ns,
      expected_response          => OKAY,
      expected_response_severity => TB_FAILURE,
      protection_setting         => UNPRIVILIGED_UNSECURE_DATA,
      num_aw_pipe_stages         => 1,
      num_w_pipe_stages          => 1,
      num_ar_pipe_stages         => 1,
      num_r_pipe_stages          => 1,
      num_b_pipe_stages          => 1,
      id_for_bfm                 => ID_BFM,
      id_for_bfm_wait            => ID_BFM_WAIT,
      id_for_bfm_poll            => ID_BFM_POLL
    );
    signal axilite_if : ST_AXILite_32;
    constant BASEADDR : integer := to_integer(unsigned'(x"00000164"));

  begin
    -- Instance
  `
  text += `  ${entity.name}_i : entity src_lib.${entity.name}`
  if (entity.generics.length > 0) {
    text += `\n    generic map (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `      ${name} => ${generic.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n    )`
  }

  if (entity.ports.length > 0) {
    text += `\n    port map (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
        if (name.indexOf("axi_aclk")!=-1){
          text += `      axi_aclk       => axi_aclk,
      axi_aresetn    => axi_aresetn,
      s_axi_awaddr   => axilite_if.write_address_channel.awaddr,
      s_axi_awprot   => axilite_if.write_address_channel.awprot,
      s_axi_awvalid  => axilite_if.write_address_channel.awvalid,
      s_axi_awready  => s_axi_awready,
      s_axi_wdata    => axilite_if.write_data_channel.wdata,
      s_axi_wstrb    => axilite_if.write_data_channel.wstrb,
      s_axi_wvalid   => axilite_if.write_data_channel.wvalid,
      s_axi_wready   => s_axi_wready,
      s_axi_araddr   => axilite_if.read_address_channel.araddr,
      s_axi_arprot   => s_axi_arprot,
      s_axi_arvalid  => axilite_if.read_address_channel.arvalid,
      s_axi_arready  => s_axi_arready,
      s_axi_rdata    => s_axi_rdata,
      s_axi_rresp    => s_axi_rresp,
      s_axi_rvalid   => s_axi_rvalid,
      s_axi_rready   => axilite_if.read_data_channel.rready,
      s_axi_bresp    => s_axi_bresp,
      s_axi_bvalid   => s_axi_bvalid,
      s_axi_bready   => axilite_if.write_response_channel.bready,
`
        }
        else if(name.indexOf("axi_")==-1){
          text += `      ${name} => ${port.name},\n`
        }
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n    )`
  }

  text += `;\n`

  text += `\n    -- Generics\n`
  if (entity.generics.length > 0) {
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      if (generic.type == "integer" || generic.type == "unsigned" || generic.type == "signed"){
        text += `    constant ${name} : ${generic.type} := 0;\n`
      }
      else if (generic.type == "std_logic"){
        text += `    constant ${name} : ${generic.type} := '0';\n`
      }
      else if (generic.type == "std_logic_vector"){
        text += `    constant ${name} : ${generic.type} := (OTHERS => '0');\n`
      }
      else{
        text += `    constant ${name} : ${generic.type};\n`
      }
    }
  }

  text +=
  `
    main : process
      variable data_read  : std_logic_vector(31 downto 0);
      variable add        : unsigned(31 downto 0) := unsigned'(x"00000000");
    begin
      test_runner_setup(runner, runner_cfg);
      while test_suite loop
        if run("test_alive") then
          info("Hello world test_alive");

          wait for 5*axi_aclk_period;
          -- AXI bus reset.
          axilite_if  <= init_axilite_if_signals(32, 32);
          wait for 1*axi_aclk_period;
          -- Ask for Version.
          add := BASEADDR + VERSION_OFFSET;
          axilite_read(add,data_read,"read Version",axi_aclk,s_axi_arready,s_axi_rresp,s_axi_rvalid,s_axi_rdata,axilite_if,"AXILITE BFM",shared_msg_id_panel,C_AXILITE_BFM_CONFIG,"");
          axilite_if  <= init_axilite_if_signals(32, 32);
          check(unsigned(data_read)=VERSION,"Reading version error.");
          -- Ask for ConfigID
          add := BASEADDR + CONFIG_ID_OFFSET;
          axilite_read(add,data_read,"read ConfigID",axi_aclk,s_axi_arready,s_axi_rresp,s_axi_rvalid,s_axi_rdata,axilite_if,"AXILITE BFM",shared_msg_id_panel,C_AXILITE_BFM_CONFIG,"");
          axilite_if  <= init_axilite_if_signals(32, 32);
          check(unsigned(data_read)=CONFIG_ID,"Reading configID error.");

          test_runner_cleanup(runner);

        elsif run("test_0") then
          info("Hello world test_0");

          test_runner_cleanup(runner);
        end if;
      end loop;
    end process;

    axi_aclk_process :process
    begin
      axi_aclk <= '1';
      wait for axi_aclk_period/2;
      axi_aclk <= '0';
      wait for axi_aclk_period/2;
    end process;

    clk_process :process
    begin
      clk <= '1';
      wait for clk_period/2;
      clk <= '0';
      wait for clk_period/2;
    end process;

  end;
  `
  return text
}


export function tbNoAXI(entity, options = DEFAULT_OPTIONS) {
  let library = "use ieee.numeric_std.all;"
  if (entity.libraryNoStandard == true){
    library = "use ieee.std_logic_arith.all;"
  }
  let text = ""

  text += `  --! Standard library.
  library ieee;
  --! Logic elements.
  use ieee.std_logic_1164.all;
  --! Arithmetic functions.
  ${library}
  --
  library std;
  use std.textio.all;
  --
  library src_lib;
  -- use src_lib.types_declaration_${entity.name}_pkg.all;
  -- vunit
  library vunit_lib;
  context vunit_lib.vunit_context;
  -- use vunit_lib.array_pkg.all;
  -- use vunit_lib.lang.all;
  -- use vunit_lib.string_ops.all;
  -- use vunit_lib.dictionary.all;
  -- use vunit_lib.path.all;
  -- use vunit_lib.log_types_pkg.all;
  -- use vunit_lib.log_special_types_pkg.all;
  -- use vunit_lib.log_pkg.all;
  -- use vunit_lib.check_types_pkg.all;
  -- use vunit_lib.check_special_types_pkg.all;
  -- use vunit_lib.check_pkg.all;
  -- use vunit_lib.run_types_pkg.all;
  -- use vunit_lib.run_special_types_pkg.all;
  -- use vunit_lib.run_base_pkg.all;
  -- use vunit_lib.run_pkg.all;

  entity ${entity.name}_tb is
    --vunit
    generic (runner_cfg : string);
  end;

  architecture bench of ${entity.name}_tb is
  `
  // text+=` ${componentTemplateTb(entity)}`
  text+=`
    -- clock period
    constant clk_period : time := 5 ns;
    -- Signal ports
  `

  if (entity.ports.length > 0) {
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
      text += `    signal ${name} : ${port.type};\n`
    }
  }

  text += `\n    -- Generics\n`
  if (entity.generics.length > 0) {
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      if (generic.type == "integer" || generic.type == "unsigned" || generic.type == "signed"){
        text += `    constant ${name} : ${generic.type} := 0;\n`
      }
      else if (generic.type == "std_logic"){
        text += `    constant ${name} : ${generic.type} := '0';\n`
      }
      else if (generic.type == "std_logic_vector"){
        text += `    constant ${name} : ${generic.type} := (OTHERS => '0');\n`
      }
      else{
        text += `    constant ${name} : ${generic.type};\n`
      }
    }
  }

  text += `
  begin
    -- Instance
  `
  text += `  ${entity.name}_i : entity src_lib.${entity.name}`
  if (entity.generics.length > 0) {
    text += `\n    generic map (\n`
    const longest = longestinArray(entity.generics, "name")
    for (let generic of entity.generics) {
      const name = rpad(generic.name, longest)
      text += `      ${name} => ${generic.name},\n`
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n    )`
  }

  if (entity.ports.length > 0) {
    text += `\n    port map (\n`
    const longest = longestinArray(entity.ports, "name")
    for (let port of entity.ports) {
      const name = rpad(port.name, longest)
        if (name.indexOf("axi_aclk")!=-1){
          text += ``
        }
        else if(name.indexOf("axi_")==-1){
          text += `      ${name} => ${port.name},\n`
        }
    }
    // Strip the final comma
    text = text.slice(0, -2)
    text += `\n    )`
  }

  text += `;\n`


  text +=
  `
    main : process
    begin
      test_runner_setup(runner, runner_cfg);
      while test_suite loop
        if run("test_alive") then
          info("Hello world test_alive");
          wait for 100 ns;
          test_runner_cleanup(runner);

        elsif run("test_0") then
          info("Hello world test_0");
          wait for 100 ns;
          test_runner_cleanup(runner);
        end if;
      end loop;
    end process;

    -- clk_process :process
    -- begin
    --   clk <= '1';
    --   wait for clk_period/2;
    --   clk <= '0';
    --   wait for clk_period/2;
    -- end process;

  end;
  `
  return text
}

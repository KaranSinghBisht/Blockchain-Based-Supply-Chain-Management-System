// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../src/SupplyChain.sol";
import "../lib/forge-std/src/Script.sol";

contract Deploy is Script {
  function run() external returns (SupplyChain supplyChain) {
    // Deploy the SupplyChain contract
    vm.startBroadcast();
    supplyChain = new SupplyChain();
    vm.stopBroadcast();
  }
}

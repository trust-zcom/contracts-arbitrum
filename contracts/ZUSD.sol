pragma solidity 0.5.13;

import "@openzeppelin/upgrades/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

contract ZUSD is AdminUpgradeabilityProxy {

    constructor(address _logic, address _admin, bytes memory _data) public payable AdminUpgradeabilityProxy(_logic, _admin, _data) {}
}
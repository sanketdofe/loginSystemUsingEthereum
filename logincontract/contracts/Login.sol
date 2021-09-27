// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Login {
  constructor() public {
  }

  event TryLogin(address sender, string challenge);

  function login(string memory challenge) public {
    emit TryLogin(msg.sender, challenge);
  }
}

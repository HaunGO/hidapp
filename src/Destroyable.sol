pragma solidity ^0.6.0;
//pragma solidity 0.5.12;
// pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract Destroyable is Ownable{
    
    function close() public onlyOwner { //onlyOwner is custom modifier
        address payable receiver = msg.sender;
        selfdestruct(receiver);
    }        
}
pragma solidity ^0.6.0;
//pragma solidity 0.5.12;
// pragma experimental ABIEncoderV2;

contract Ownable{

    address public owner;

    modifier onlyOwner(){
        require(msg.sender == owner, "Caller needs to be owner");
        _; //how we close modifiers.. continue execution.
    }
    
    constructor() public{
        owner = msg.sender;
    }

}
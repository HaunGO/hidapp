pragma solidity ^0.6.0;
// pragma solidity 0.5.12;
// pragma experimental ABIEncoderV2;
 
import "./Ownable.sol";
import "./Destroyable.sol";

contract hidapp is Ownable, Destroyable {

    struct Person {
        uint id;
        string name;
        uint number;
        bool senior;
    }
    
    event saidHello(string name);
    event personCreated(string name, uint number, bool senior);
    event personDeleted(string name, bool senior, address deletedBy);

    uint public balance;

    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    function sayHello() public pure returns( string memory hello) {
        return "Hello Hi Hey Yo!";
    }
    
    mapping (address => Person) public people;
    
    address[] private creators;
    
    function createPerson(string memory name, uint number) public payable costs(0.001 ether) {
        require(number < 999, "Numbe needs to be below 999");
        balance += msg.value;
        
        //This creates a person
        Person memory newPerson;
        newPerson.name = name;
        newPerson.number = number;
        
        if(number > 99){
           newPerson.senior = true;
        }
        else{
           newPerson.senior = false;
        }
        
        insertPerson(newPerson);
        creators.push(msg.sender);
        
        assert(
            keccak256(
                abi.encodePacked(
                    people[msg.sender].name,
                    people[msg.sender].number,
                    people[msg.sender].senior
                )
            )
            ==
            keccak256(
                abi.encodePacked(
                    newPerson.name,
                    newPerson.number,
                    newPerson.senior
                )
            )
        );
        emit personCreated(newPerson.name, newPerson.number, newPerson.senior);
    }
    
    function insertPerson(Person memory newPerson) private {
        address creator = msg.sender;
        people[creator] = newPerson;
    }
    
    function getPerson() public view returns(string memory name, uint number, bool senior){
        address creator = msg.sender;
        return (people[creator].name, people[creator].number, people[creator].senior);
    }
    
    function deletePerson(address creator) public onlyOwner {
        string memory name = people[creator].name;
        bool senior = people[creator].senior;
        delete people[creator]; 
        assert(people[creator].number == 0);
        emit personDeleted(name, senior, owner);
    }
   
    function getCreator(uint index) public view onlyOwner returns(address){
        return creators[index];
    }

    function withdrawAll() public onlyOwner returns(uint) {
        uint toTransfer = balance;
        balance = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
    }


    
    // function getWinner(uint mod) private view returns(uint) {
    //     return uint(keccak256(abi.encodePacked(now, block.difficulty, msg.sender))) % mod;
    // }

    function getRandom(uint mod) external view returns(uint) {
        return uint(keccak256(abi.encodePacked(now, block.difficulty, msg.sender))) % mod;
    }
    
}






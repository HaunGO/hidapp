console.log('Hi dApp! '); 

import {abi, address} from './abi.js';
// const address = "";//"0xd41c8c355C44087Dec5EA3dC1406c88022197122";//"0x70b1E0a47CE9095fe6d7ffa88FD1e792c9E59C8f";

const web3 = new Web3(Web3.givenProvider);
var myContract;
var account;
  
  
$(document).ready(function () {

    let contractBalance = 0;

    var sayHelloButton = document.getElementById('sayHello-button');
    var sayHelloLabel = document.getElementById('sayHelloSpan');
    
    var getPersonButton = document.getElementById('getPersonButton');
    var getPersonLabel = document.getElementById('getPersonSpan');
    
    var createName = document.getElementById('createName');
    var createNumber = document.getElementById('createNumber');
    var createLabel = document.getElementById('createSpan');
    var createButton = document.getElementById('createButton');
   
    var getCreatorLabel = document.getElementById('getCreatorSpan');
    var getCreatorButton = document.getElementById('getCreatorButton');
    
    var newestLabel = document.getElementById('newestSpan');
    var peopleList = document.getElementById('peopleList');

    var connectButton = document.getElementById('connectToDapp');

    connectButton.addEventListener('click', () => {
        window.ethereum.enable().then(function (accounts) {
            connectAccounts(accounts);
            connectButton.style.display = 'none';
            document.body.classList.add('connectedToNetwork');
        });
    });



 

    function connectAccounts(accounts){
        
        account = accounts[0];

        myContract = new web3.eth.Contract(abi, address, { from: accounts[0] });
        console.log(myContract._address);
        console.log(myContract.methods);

        document.getElementById('addressSpan').innerHTML = "<a href='https://ropsten.etherscan.io/address/" + myContract._address +"' target='_blank' >" + myContract._address + "</a>";
         

        sayHelloButton.addEventListener('click', () => { 
            console.log('say hello click');        
            myContract.methods.sayHello().call()
                .then(function (result) {
                    console.log(result);
                    sayHelloLabel.innerHTML = result;
                }).catch(console.log);
        });
        
        getPersonButton.addEventListener('click', () => {
            console.log('get person click');
            myContract.methods.getPerson().call()
                .then(function (result) {
                    getPersonLabel.innerHTML = result.name + ' ' + result.number;
                }).catch(console.log);
        });  

        getCreatorButton.addEventListener('click', () => {
            console.log('get creator click');

            myContract.methods.getCreator(0).call()
                .then(function (result) {
                    console.log(result);
                    getCreatorLabel.innerHTML = result;
                }).catch(console.log);
        });


          





        myContract.events.personCreated({}, (error, event) => { 
            console.log('~~~~~~~~~~~~~ PERSON CREATED EVENT ~~~~~~~~~~~~');
            console.log(event); 
            console.log(event.returnValues.name); 
            newestLabel.innerHTML = event.returnValues.name + ' ' + event.returnValues.number;
   
            let info = "<a href='https://ropsten.etherscan.io/tx/" + event.returnValues.transactionHash + "' target='_blank' >" + event.returnValues.name + " " + event.returnValues.number + "</a>";
            addToList(info);
            reflectBalance();
        });


        myContract.getPastEvents('personCreated', { fromBlock: 0, toBlock: 'latest' }, function (error, event) { })
            .then(function (event) {
                console.log(event);
                let n = event.length;
                for (var i = 0; i < n; i++) {
                    // console.log(event[i].returnValues.name, event[i].returnValues.number);
                    let info = "<a href='https://ropsten.etherscan.io/tx/" + event[i].transactionHash + "' target='_blank' >" + event[i].returnValues.name + " " + event[i].returnValues.number + "</a>";
                    addToList(info);
                }
            }).catch(console.log);
            

        function addToList(info){
            let li = document.createElement("li");
            li.innerHTML = info;
            peopleList.insertBefore(li, peopleList.firstChild );
        }





 

        TweenMax.set("#transactionLoader", { opacity: 0 });

        createButton.addEventListener('click', () => {
            console.log('create person click');
            let isValid = false;
            if ((createName.value != '') && (createNumber.value != '') ){
                isValid = true;
                TweenMax.to("#transactionLoader", 0.2, { opacity:1});
            }else{
                console.log('give me a name and number, bozo.');
            }
            if(isValid){
                let weiValue = Web3.utils.toWei('0.1', 'ether');                
                myContract.methods.createPerson(createName.value, createNumber.value).send({ 'value': weiValue})
                    .on('transactionHash', function (hash) {
                        console.log(hash);
                        // loader animation
                        TweenMax.fromTo("#transactionLoader", 2, { rotation: 0 }, { rotation: 360, repeat: -1, ease: Power1.easeInOut, yoyo: true });
                    })
                    .on('receipt', function(receipt) {
                        console.log("on receipt", receipt);
                        TweenMax.to("#transactionLoader", 0.3, { rotation:0, opacity:0 });                        
                        reflectBalance();
                        myContract.methods.getPerson().call()
                            .then(function (result) {
                                console.log(result.name);
                                createLabel.innerHTML = result.name + ' ' + result.number;
                            });
                        })
                    .on('error', function(error, receipt) { 
                        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                        console.log(error, receipt);
                    })
                
            }


        });
       
        




        document.getElementById('withdrawButton').addEventListener('click', () => {
            console.log('withdraw the funds !');
            TweenMax.to("#withdrawLoader", 0.2, { opacity: 1 });
            TweenMax.fromTo("#withdrawLoader", 2, { rotation: 0 }, { rotation: 360, repeat: -1, ease: Power1.easeInOut, yoyo: true });
            myContract.methods.withdrawAll().send()
                .then(function (result) {
                    TweenMax.to("#withdrawLoader", 0.3, { rotation: 0, opacity: 0 });                        
                    console.log(result);
                    reflectBalance();
                    document.getElementById('withdrawSpan').innerHTML = contractBalance + ' ETH has been withdrawn from contract into the creators address.';
                }).catch(function (err) {
                    TweenMax.to("#withdrawLoader", 0.3, { rotation: 0, opacity: 0 });                        
                    document.getElementById('withdrawSpan').innerHTML = 'Only the contract creator can withdraw these funds.';
                    console.log('//   you crazy.. i dont know who you think you are, but aint no way you comin up in here claimin all these funds without proper credentials.');
                    console.log(err);
                })
        });





        function reflectBalance() {
            // This returns value in WEI
            myContract.methods.balance().call()
                .then(function (result) {
                    let value = Web3.utils.fromWei(result, 'ether');
                    // console.log(value + ' ETH');
                    document.getElementById('balanceSpan').innerHTML = value + ' ETH';
                    contractBalance = value;
                }).catch(console.log);
        }
        reflectBalance();





    };
});
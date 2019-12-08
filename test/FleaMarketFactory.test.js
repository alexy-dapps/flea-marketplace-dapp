
//based on https://codeburst.io/javascript-unit-testing-using-mocha-and-chai-1d97d9f18e71

/*
 - 'assert' helps to determine the status of the test, it determines failure of the test.
 - 'describe' is a function which holds the collection of tests. It takes two parameters, first one is the meaningful name to functionality under test and second one is the function which contains one or multiple tests. 
 - 'it' is a function again which is actually a test itself and takes two parameters, first parameter is name to the test and second parameter is function which holds the body of the test.
  - 'beforeEach' set conditions before each test. is run before each test in a describe
  - 'before' set conditions before group of tests.  is run once before all the tests in a describe
*/

//based on https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/src/setup.js
//based on https://www.chaijs.com/plugins/chai-bn/
/*
Methods:

const actual = new BN('100000000000000000').plus(new BN('1'));
const expected = '100000000000000001';

actual.should.be.a.bignumber.that.equals(expected);
expect(actual).to.be.a.bignumber.that.is.at.most(expected);
(new BN('1000')).should.be.a.bignumber.that.is.lessThan('2000');
Properties:

(new BN('-100')).should.be.a.bignumber.that.is.negative;
expect(new BN('1').sub(new BN('1'))).to.be.a.bignumber.that.is.zero;
*/


var chai = require('chai');
chai.use(require('chai-as-promised')).should();

const BN = web3.utils.BN;
// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();

const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { getCurrentTime } = require('./helpers/time');

const FleaMarketFactory = artifacts.require("../contracts/FleaMarketFactory.sol");
const SafeRemotePurchase = artifacts.require("../contracts/SafeRemotePurchase.sol");

contract("FleaMarketFactory", accounts => {

    let [deployer, seller, buyer] = accounts;

    const IPFS_HASH = "QmdXUfpqeGQyvJ6xVouPLR65XtNp63TUHM937zPvg9dFrT";

    let factory;

    // display three test accounts
    console.log(`deployer account: ${deployer}`);
    console.log(`seller account: ${seller}`);
    console.log(`buyer account: ${buyer}`);

    /* 
   based on 
https://ethereum.stackexchange.com/questions/42094/should-i-use-new-or-deployed-in-truffle-unit-tests

deployed() behaves like a singleton. 
It will look if there is already an instance of the contract deployed to the blockchain. 
The information about which contract has which address on which network is stored in the build folder. 

'new()' will always create a new instance.

Some unit tests will require instantiating multiple instances of a smart contract and deploying each of them. 
In this case, new is the only option as deployed() simply retrieves 
the same already-deployed contract each time.
   */

    // beforeEach() is run before each test in a describe
    beforeEach(async () => {

        const time = await getCurrentTime();
        console.log(`current time: ${time}`);

        factory = await FleaMarketFactory.new();
    });


    it("deployed successfully", async () => {

        const address = await factory.address;
        console.log(`contract address: ${address}`);

        //make sure the address is real
        assert.notEqual(address, 0x0);
        assert.notEqual(address, "");
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    });


    it('it has the owner who is the deployer', async () => {
        const owner = await factory.owner()
        assert.equal(owner, deployer)
    })


    it('should create product', async () => {


        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = new BN(350);

        const receipt = await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: wei
        });

        //??? this way is not working -  explore
        //await factory.getContractCount().should.eventually.equal(new BN(1));
        expect(await factory.getContractCount()).to.be.a.bignumber.that.equal(new BN(1));


        // check for event fired
        /*
        has to comment 'key'  - because does not compare properly bytes32:
        + expected - actual
        -0x7465736c614379626572747275636b2d58303100000000000000000000000000
       +0x7465736c614379626572747275636b2d583031
        */
        expectEvent(receipt, 'LogCreatePurchaseContract', {
            sender: seller,
            // key: bytes32Key 
        });

        const logData = receipt.logs[2];
        const eventData = logData.args;
        assert.equal(web3.utils.hexToUtf8(eventData.key), 'teslaCybertruck-X01', "LogCreatePurchaseContract event logged did not have expected product key");

    })

    it('should not create product for empty key', async () => {

        const bytes32Key = web3.utils.utf8ToHex('');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = web3.utils.toBN(350);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: wei
        }).should.be.rejected;


    })

    it('product must have a unique key', async () => {

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = web3.utils.toBN(350);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: wei
        }).should.be.fulfilled;

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck II', IPFS_HASH, commission, {
            from: seller,
            value: wei
        }).should.be.rejected;

    })

    it('should not create product with zero commission', async () => {

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = new BN(0);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: wei
        }).should.be.rejected;

    })


    it('product must have price', async () => {

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const commission = new BN(350);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: 0
        }).should.be.rejected;

    })


    it('product must have the even price', async () => {

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const commission = new BN(350);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: 31313131317
        }).should.be.rejected;

    })


    it('validate product', async () => {

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = web3.utils.toBN(350);

        await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
            from: seller,
            value: wei
        }).should.be.fulfilled;

        const address = await factory.getContractByKey(bytes32Key);
        //assert.notEqual(address, 0x0);
        address.should.not.equal(0x0);


        // get instance of the SafeRemotePurchase contract by address
        const ins = await SafeRemotePurchase.at(address);

        // validate key
        const key = await ins.key();
        const keyAscii = web3.utils.hexToUtf8(key);
        keyAscii.should.equal('teslaCybertruck-X01');

        // validate seller
        expect(await ins.seller()).to.equal(seller);

        // validate owner
        expect(await ins.owner()).to.equal(deployer);

        // validate price
        const price = (new BN(wei)).div(new BN(2));
        expect(await ins.price()).to.be.a.bignumber.that.equal(price);

        // validate ballance  -  balance has to be 2x price
        expect(await ins.balanceOf()).to.be.a.bignumber.that.equal(price.mul(new BN(2)));

        // validate state - should be Created
        //note that Solidity enum are converted explicitly to uint ==> will be 
        //retrieved from web3 as BN. the enum values start from 0.
        expect(await ins.state()).to.be.a.bignumber.that.equal(new BN(0));

    })


    /*
            it('product purchase and delivery', async () => {
    
                const bytes32Key = web3.utils.fromAscii('sportBikeModelX01');
                const address = await contractInstance.getContractByKey(bytes32Key);
                // get instance of the SafeRemotePurchase contract by address
                const product = await SafeRemotePurchase.at(address);
    
                let tx, event, balanceBN, state;
    
    
                // Buyer makes purchase (2x of price)
                tx = await product.buyerConfirmPurchase({
                    from: buyer,
                    value: web3.utils.toWei('1.4', 'Ether')
                })
    
                // Check logs
                event = tx.logs[0];
                assert.equal(event.event, 'PurchaseConfirmed', 'event is correct')
    
                // validate ballance
                balanceBN = await product.balanceOf();
                const priceBN = await product.price();
                // balance has to be 4x price  = (2x from the seller and 2x from the buyer)
                assert.equal(balanceBN.eq(priceBN.mul(new BN(4))), true, 'balance is correct');
    
                // validate buyer
                const purchaser = await product.buyer();
                assert.equal(purchaser, buyer, 'purchaser is correct');
    
                // validate state
                state = (await product.state()).toString();
                assert.equal(state, '1', 'state Locked is correct');
    
    
                // Buyer confirm delivery
                const origSellerBalanceWei = await web3.eth.getBalance(seller);
                const origSellerBalanceBN = new BN(origSellerBalanceWei);
    
                tx = await product.buyerConfirmReceived({
                    from: buyer,
                })
    
                // Check logs
                event = tx.logs[0];
                assert.equal(event.event, 'ItemReceived', 'event is correct')
    
                // validate ballance
                balanceBN = await product.balanceOf();
                // balance has to be 0)
                assert.equal(balanceBN.eq(new BN(0)), true, 'balance is correct');
    
                //validate the seller balance
                const newSellerBalanceWei = await web3.eth.getBalance(seller);
                const newSellerBalanceBN = new BN(newSellerBalanceWei);
    
                // seller has to get back 3x price
                const expectedBalanceBN = origSellerBalanceBN.add(priceBN.mul(new BN(3)));
                assert.equal(newSellerBalanceBN.eq(expectedBalanceBN), true, 'seller balance is correct');
    
                // validate state
                state = (await product.state()).toString();
                assert.equal(state, '2', 'state Inactive is correct');
    
            })
    
    
            it('product purchase failure', async () => {
    
                const bytes32Key = web3.utils.fromAscii('sportBikeModelX01');
                const address = await contractInstance.getContractByKey(bytes32Key);
                // get instance of the SafeRemotePurchase contract by address
                const product = await SafeRemotePurchase.at(address);
    
    
                // Buyer tries to buy without enough ether (must be 2x of price)
                await product.buyerConfirmPurchase({
                    from: buyer,
                    value: web3.utils.toWei('1', 'Ether')
                }).should.be.rejected;
    
                //  ... add more later such as the seller can't  buy and so on
                */
})



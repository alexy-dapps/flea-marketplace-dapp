
//based on https://codeburst.io/javascript-unit-testing-using-mocha-and-chai-1d97d9f18e71

/*
 - 'assert' helps to determine the status of the test, it determines failure of the test.
 - 'describe' is a function which holds the collection of tests. It takes two parameters, first one is the meaningful name to functionality under test and second one is the function which contains one or multiple tests. 
 - 'it' is a function which is actually is a test itself and takes two parameters, first parameter is name to the test and second parameter is function which holds the body of the test.
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

// custom function to calculate amount of ether spent on the transaction
// here txInfo is the transaction results
//based on https://www.trufflesuite.com/docs/truffle/getting-started/interacting-with-your-contracts#processing-transaction-results
// and https://ethereum.stackexchange.com/questions/42950/how-to-get-the-transaction-cost-in-a-truffle-unit-test
async function getGasCoast(txInfo) {
    const tx = await web3.eth.getTransaction(txInfo.tx);
    const gasCost = (new BN(tx.gasPrice)).mul(new BN(txInfo.receipt.gasUsed));

    return gasCost;
}

contract("FleaMarketFactory", accounts => {

    const [deployer, seller, buyer, buddy] = accounts;
    const IPFS_HASH = "QmdXUfpqeGQyvJ6xVouPLR65XtNp63TUHM937zPvg9dFrT";

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

    describe('deployment of FleaMarketFactory contract', async () => {

        let factory;
        before(async () => {

            factory = await FleaMarketFactory.new();
        });

        beforeEach(async () => {

            const time = await getCurrentTime();
            console.log(`current time: ${time}`);

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


    })

    describe('creating a new instance of SafeRemotePurchase contract', async () => {

        let factory;

        beforeEach(async () => {

            const time = await getCurrentTime();
            console.log(`current time: ${time}`);

            factory = await FleaMarketFactory.new();

        });

        it('should create a valid product', async () => {


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

            const address = await factory.getContractByKey(bytes32Key);

            expectEvent(receipt, 'LogCreatePurchaseContract', {
                sender: seller,
                contractAddress: address
                // key: bytes32Key 
            });

            const logData = receipt.logs[2];
            const eventData = logData.args;
            assert.equal(web3.utils.hexToUtf8(eventData.key), 'teslaCybertruck-X01', "LogCreatePurchaseContract event logged did not have expected product key");

        })

        it('should not create a product for empty key', async () => {

            const bytes32Key = web3.utils.utf8ToHex('');
            const wei = web3.utils.toWei('1.4', 'Ether');
            const commission = web3.utils.toBN(350);

            await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
                from: seller,
                value: wei
            }).should.be.rejected;


        })

        it('should not create a product with the same key', async () => {

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


        it('should not able to create a product with zero purchase price', async () => {

            const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
            const commission = new BN(350);

            await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
                from: seller,
                value: 0
            }).should.be.rejected;

        })


        it('should not able to create a product having not even price', async () => {

            const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
            const commission = new BN(350);

            await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
                from: seller,
                value: 31313131317
            }).should.be.rejected;

        })

    })


    describe('business logic for purchase and delivery the product', async () => {

        let product;

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = web3.utils.toBN(350);

        beforeEach(async () => {
            const time = await getCurrentTime();
            console.log(`current time: ${time}`);

            const factory = await FleaMarketFactory.new();

            await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
                from: seller,
                value: wei
            }).should.be.fulfilled;

            const address = await factory.getContractByKey(bytes32Key);
            //assert.notEqual(address, 0x0);
            address.should.not.equal(0x0);


            // get instance of the SafeRemotePurchase contract by address
            product = await SafeRemotePurchase.at(address);

        });


        it('is a valid product', async () => {

            // validate key
            const key = await product.key();
            const keyAscii = web3.utils.hexToUtf8(key);
            keyAscii.should.equal('teslaCybertruck-X01');

            // validate seller
            expect(await product.seller()).to.equal(seller);

            // validate owner
            expect(await product.owner()).to.equal(deployer);

            // validate price
            const price = (new BN(wei)).div(new BN(2));
            expect(await product.price()).to.be.a.bignumber.that.equal(price);

            // validate ballance  -  balance has to be 2x price
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(price.mul(new BN(2)));

            // validate state - should be Created
            //note that Solidity enum are converted explicitly to uint ==> will be 
            //retrieved from web3 as BN. the enum values start from 0.
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(0));

            // check for commission value
            expect(await product.commissionRate({
                from: deployer
            })).to.be.a.bignumber.that.equal(commission);


        })

        it('the buyer should be able to purchase and confirm delivery of product', async () => {

            // Buyer makes purchase (put 2x of price)
            let txInfo = await product.buyerPurchase({
                from: buyer,
                value: wei
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogPurchaseConfirmed', {
                sender: buyer,
                amount: wei   //could be an instance of BN or string
            });

            // validate buyer
            expect(await product.buyer()).to.equal(buyer);

            // validate state - should be Locked
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(1));

            // validate smart contract ballance
            // balance has to be 4x price  = (2x from the seller and 2x from the buyer)
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal((new BN(wei)).mul(new BN(2)));

            // Buyer confirm delivery
            const buyerBalanceBefore = new BN(
                await web3.eth.getBalance(buyer)
            );

            const price = (new BN(wei)).div(new BN(2));
            txInfo = await product.buyerConfirmReceived({
                from: buyer
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogReceivedByBuyer', {
                sender: buyer,
                amount: price   // could be an instance of BN or string
            });

            const buyerBalanceAfter = new BN(
                await web3.eth.getBalance(buyer)
            );

            // calculate amount money the buyer spend on the transaction
            const gasCost = await getGasCoast(txInfo);

            // validate that the buyer gets his escrow money back
            expect(buyerBalanceAfter).to.be.a.bignumber.that.equal(buyerBalanceBefore.add(price).sub(gasCost));

            // validate state - should be ItemReceived
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(3));

            // validate smart contract ballance
            // balance has to be 3x price  = (1x went back to the buyer)
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(price.mul(new BN(3)));

        })

        it('the seller and then the deployer should be able to withdraw their money', async () => {

            // Buyer makes purchase (put 2x of price)
            await product.buyerPurchase({
                from: buyer,
                value: wei
            })
            // buyer confirm delivery
            await product.buyerConfirmReceived({
                from: buyer
            });

            const sellerBalanceBefore = new BN(
                await web3.eth.getBalance(seller)
            );

            // seller withdraw his escrow money
            let txInfo = await product.withdrawBySeller({
                from: seller
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogWithdrawBySeller', {
                sender: seller
            });

            const sellerBalanceAfter = new BN(
                await web3.eth.getBalance(seller)
            );

            // calculate amount money the seller spent on the transaction
            let gasCost = await getGasCoast(txInfo);

            const price = (new BN(wei)).div(new BN(2));
            // calculate amount money the seller spent on the commission
            const commissionCost = (price.mul(commission)).div(new BN(10000));

            // validate the seller ballance after he withdraw escrow and purchased product money from the contract
            expect(sellerBalanceAfter).to.be.a.bignumber.that.equal(sellerBalanceBefore.add(price.mul(new BN(3))).sub(gasCost).sub(commissionCost));

            // validate state - should be SellerPaid
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(4));

            // validate smart contract ballance
            // balance has to have only the commission to be paid to the deployer
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(commissionCost);

            const deployerBalanceBefore = new BN(
                await web3.eth.getBalance(deployer)
            );

            // deployer withdraw his commission
            txInfo = await product.withdrawByOwner({
                from: deployer
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogWithdrawByOwner', {
                sender: deployer,
                amount: commissionCost
            });

            const deployerBalanceAfter = new BN(
                await web3.eth.getBalance(deployer)
            );

            gasCost = await getGasCoast(txInfo);

            // validate the deployer ballance
            expect(deployerBalanceAfter).to.be.a.bignumber.that.equal(deployerBalanceBefore.add(commissionCost).sub(gasCost));

            // validate state - should be Completed
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(6));

            // validate smart contract ballance => has to be zero
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(new BN(0));

        })


        it('the deployer and then the seller should be able to withdraw their money', async () => {

            // Buyer makes purchase (put 2x of price)
            await product.buyerPurchase({
                from: buyer,
                value: wei
            })
            // buyer confirm delivery
            await product.buyerConfirmReceived({
                from: buyer
            });


            const deployerBalanceBefore = new BN(
                await web3.eth.getBalance(deployer)
            );

            // deployer withdraw his commission
            let txInfo = await product.withdrawByOwner({
                from: deployer
            }).should.be.fulfilled;

            // calculate the commission
            const price = (new BN(wei)).div(new BN(2));
            const commissionCost = (price.mul(commission)).div(new BN(10000));
            expectEvent(txInfo, 'LogWithdrawByOwner', {
                sender: deployer,
                amount: commissionCost
            });

            const deployerBalanceAfter = new BN(
                await web3.eth.getBalance(deployer)
            );

            let gasCost = await getGasCoast(txInfo);

            // validate the deployer ballance
            expect(deployerBalanceAfter).to.be.a.bignumber.that.equal(deployerBalanceBefore.add(commissionCost).sub(gasCost));

            // validate state - should be OwnerPaid
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(5));

            // validate smart contract ballance => should be 3x price minus commission paid to the deployer
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(price.mul(new BN(3)).sub(commissionCost));

            const sellerBalanceBefore = new BN(
                await web3.eth.getBalance(seller)
            );

            // seller withdraw his escrow money
            txInfo = await product.withdrawBySeller({
                from: seller
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogWithdrawBySeller', {
                sender: seller
            });

            const sellerBalanceAfter = new BN(
                await web3.eth.getBalance(seller)
            );

            // calculate amount money the seller spent on the transaction
            gasCost = await getGasCoast(txInfo);

            // validate the seller ballance after he withdraw escrow and the purchased product money from the contract
            expect(sellerBalanceAfter).to.be.a.bignumber.that.equal(sellerBalanceBefore.add(price.mul(new BN(3))).sub(gasCost).sub(commissionCost));

            // validate state - should be SellerPaid
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(6));

            // validate smart contract ballance
            // balance has to be zero
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(new BN(0));

        })

        it('the seller should be able to cancel a purchase contract and reclaim the escrow', async () => {

            const sellerBalanceBefore = new BN(
                await web3.eth.getBalance(seller)
            );

            txInfo = await product.abortBySeller({
                from: seller
            }).should.be.fulfilled;

            expectEvent(txInfo, 'LogCanceledBySeller', {
                sender: seller,
                amount: wei
            });

            const sellerBalanceAfter = new BN(
                await web3.eth.getBalance(seller)
            );

            // calculate amount money the seller spend on the transaction
            const gasCost = await getGasCoast(txInfo);

            // validate that the seller gets his escrow money back
            expect(sellerBalanceAfter).to.be.a.bignumber.that.equal(sellerBalanceBefore.add(new BN(wei)).sub(gasCost));

            // validate state - should be Canceled
            expect(await product.state()).to.be.a.bignumber.that.equal(new BN(2));

            // validate smart contract ballance - has to be 0
            expect(await product.balanceOf()).to.be.a.bignumber.that.equal(new BN(0));

        })


    })


    describe('some failure cases', async () => {

        let product;

        const bytes32Key = web3.utils.utf8ToHex('teslaCybertruck-X01');
        const wei = web3.utils.toWei('1.4', 'Ether');
        const commission = web3.utils.toBN(350);

        beforeEach(async () => {
            const time = await getCurrentTime();
            console.log(`current time: ${time}`);

            const factory = await FleaMarketFactory.new();

            await factory.createPurchaseContract(bytes32Key, 'Tesla Cybertruck', IPFS_HASH, commission, {
                from: seller,
                value: wei
            }).should.be.fulfilled;

            const address = await factory.getContractByKey(bytes32Key);
            //assert.notEqual(address, 0x0);
            address.should.not.equal(0x0);


            // get instance of the SafeRemotePurchase contract by address
            product = await SafeRemotePurchase.at(address);

        });

        it('the seller should not be able to cancel a purchase contract in the state other then Created', async () => {

            // Buyer makes purchase (put 2x of price)
            await product.buyerPurchase({
                from: buyer,
                value: wei
            })

            // the seller is trying to Abort contract - should be rejected
            await product.abortBySeller({
                from: seller
            }).should.be.rejected;

        })

        it('the buyer is trying to purchase a product with not enough ether', async () => {

            // Buyer makes purchase (must deposit 2x of price)
            await product.buyerPurchase({
                from: buyer,
                value: web3.utils.toWei('1', 'Ether')
            }).should.be.rejected;

        })

        it('someone else is trying to withdraw money after the buyer confirms the delivery', async () => {

            // Buyer makes purchase (put 2x of price)
            await product.buyerPurchase({
                from: buyer,
                value: wei
            })
            // buyer confirm delivery
            await product.buyerConfirmReceived({
                from: buyer
            });

            // request to withdraw came from the wrong account
            await product.withdrawBySeller({
                from: buddy
            }).should.be.rejected;

        })

        it('should reject if someone trying to view commission rate', async () => {

            // only deployer and seller allow
            await product.commissionRate({
                from: buddy
            }).should.be.rejected;

        })

        it('should reject if someone send ether to a purchase contract', async () => {

            await web3.eth.sendTransaction({ from: buddy, to: product.address, value: web3.utils.toWei('0.005', "ether") }).should.be.rejected;

        })

        it('should reject if someone try to withdraw ether from a purchase contract', async () => {

            // notice, we can not provide a contract type address in the 'from' parameter
            //otherwise someone would able to withdraw money from the contract
            //If we do, we get the error =>  'Error: Returned error: sender account not recognized'
            await web3.eth.sendTransaction({ from: product.address, to: buddy, value: web3.utils.toWei('0.00005', "ether") }).should.be.rejected;

        })

    })

})





pragma solidity ^0.5.11;

import "@openzeppelin/contracts/math/SafeMath.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol"; // for Remix
import "./Ownable.sol";


// based on https://solidity.readthedocs.io/en/latest/solidity-by-example.html
contract SafeRemotePurchase is Ownable {
    
    using SafeMath for uint256;
    
    uint256 private _commissionRate;  //for example, 350 ==>  (350/100) = 3.5%
    
    address payable public seller;
    address payable public buyer;
    uint256 public price;
    bytes32 public key;  //unique string identifier
    string public description;
    string public ipfsImageHash;
    
    enum State { Created, Locked, Canceled, BuyerPaid, SellerPaid, OwnerPaid, Completed}
    State public state;


    // Contract created by the seller
    // Ensure that `msg.value` is an even number.
    // Division will truncate if it is an odd number.
    // Check via multiplication that it wasn't an odd number.
    constructor(
        uint256 rate,
        address payable _seller, 
        bytes32 _key,
        string memory _description,
        string memory _ipfxImageHash) public payable {
            
        require(key != 0x0, "Key cannot be 0x0");
        require(bytes(_description).length > 0, "Description can't be empty");
        require(rate > 0, "Must specify the commission rate");
        require(_seller != address(0), "The seller is the zero address");
        
        _commissionRate = rate;
        seller = _seller;
        key = _key;
        ipfsImageHash = _ipfxImageHash;
        description = _description;
        price = msg.value.div(2);
 
        require(price > 0, "Must specify price");
        require((price * 2) == msg.value, "Price has to be even");
    }

    modifier condition(bool _condition) {
        require(_condition, "Condition is false");
        _;
    }

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this.");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this.");
        _;
    }

    modifier inState(State _state) {
        require(state == _state, "Invalid state.");
        _;
    }

    event LogCanceledBySeller(address indexed sender, uint256 amount, bytes32 key);
    event LogPurchaseConfirmed(address indexed sender, uint256 amount, bytes32 key);
    event LogReceivedByBuyer(address indexed sender, uint256 amount, bytes32 key);
    event LogWithdrawBySeller(address indexed sender, uint256 amount, bytes32 key);
    event LogWithdrawByOwner(address indexed sender, uint256 amount, bytes32 key);

    // Confirm the purchase as buyer.
    // Transaction has to include `2 * value` ether.
    // The ether will be locked until confirmReceived
    // is called.
    function buyerPurchase() external inState(State.Created)
        condition(msg.value == price.mul(2))
        payable returns (bool result)
    {
        buyer = msg.sender;
        state = State.Locked;
        
        emit LogPurchaseConfirmed(msg.sender, msg.value, key);
        return true;
    }

    // Confirm that the buyer received the item from the seller.
    // This will release the locked ether.
    function buyerConfirmReceived() external onlyBuyer
        inState(State.Locked) returns (bool result)
    {
        state = State.BuyerPaid;
        buyer.transfer(price);

        emit LogReceivedByBuyer(msg.sender, price, key);
        return true;
    }
    
    // The seller has changed his mind and does not want to sell the item
    // Cancel the purchase contract and reclaim the ether.
    // Can only be called by the seller if the contract is Created
    function abortBySeller() external onlySeller
        inState(State.Created) returns (bool result)
    {
        uint256 amount = balanceOf();
        
        state = State.Canceled;
        seller.transfer(amount);

        emit LogCanceledBySeller(msg.sender, amount, key);
        return true;
    }
    
    function withdrawBySeller() external onlySeller
        condition(state == State.BuyerPaid || state == State.OwnerPaid ) returns (bool result)
        {
        
            if (state == State.OwnerPaid) {
                
                uint256 amount = balanceOf();
                
                state = State.Completed;
                seller.transfer(amount);

                emit LogWithdrawBySeller(msg.sender, amount, key);     
                return true;
                
            } else if (state == State.BuyerPaid) {
                
                //calculate commission part
                uint256 commission  = (price.mul(_commissionRate)).div(10000);
                
                // subtracts commission part: 3.5% ==> 350 /100
                uint256 amount = (price.mul(3)).sub(commission);
                 
                state = State.SellerPaid;
                seller.transfer(amount);
            
                emit LogWithdrawBySeller(msg.sender, amount, key); 
                return true;
    
            } else {
                
                return false;
            }
            

        }

    function withdrawByOwner() external onlyOwner
        condition(state == State.BuyerPaid || state == State.SellerPaid ) returns (bool result)
        {
        
            if (state == State.SellerPaid) {
                
                uint256 amount = balanceOf();
                   
                state = State.Completed;
                seller.transfer(amount);

                emit LogWithdrawByOwner(msg.sender, amount, key);    
                return true;
                
            } else if (state == State.BuyerPaid) {
                
                //calculate commission part: 3.5% ==> 350 /100
                uint256 commission  = (price.mul(_commissionRate)).div(10000);
                  
                state = State.OwnerPaid;
                owner().transfer(commission);
                
                emit LogWithdrawByOwner(msg.sender, commission, key);
                return true;
    
            } else {
                
                return false;
            }   

        }


    //get balance of the contract
    function balanceOf() public view returns(uint) {
        return address(this).balance;
    }

   
}
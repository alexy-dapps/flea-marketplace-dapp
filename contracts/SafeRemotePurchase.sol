/**
based on
1. https://solidity.readthedocs.io/en/latest/solidity-by-example.html#safe-remote-purchase
*/

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/math/SafeMath.sol"; // for Remix
import "./Ownable.sol";


contract SafeRemotePurchase is Ownable {
    using SafeMath for uint256;

    uint256 private _commissionRate; // for example, 350 ==>  (350/100) = 3.5%

    address payable public seller;
    address payable public buyer;
    uint256 public price;
    bytes32 public key; // unique string identifier
    string public description;
    string public ipfsImageHash;

    enum State {
        Created,
        Locked,
        Canceled,
        ItemReceived,
        SellerPaid,
        OwnerPaid,
        Completed
    }
    State public state;

    // Contract created by the seller
    // Ensure that `msg.value` is an even number.
    // Division will truncate if it is an odd number.
    // Check via multiplication that it wasn't an odd number.
    constructor(
        uint256 _rate,
        address payable _seller,
        bytes32 _key,
        string memory _description,
        string memory _ipfxImageHash
    ) public payable {
        require(_key != 0x0, "Key cannot be 0x0");
        require(bytes(_description).length > 0, "Description can't be empty");
        require(_rate > 0, "Must specify the commission rate");
        require(_seller != address(0), "The seller is the zero address");

        _commissionRate = _rate;
        seller = _seller;
        key = _key;
        ipfsImageHash = _ipfxImageHash;
        description = _description;
        price = msg.value.div(2);

        require(price > 0, "Must specify price");
        require((price * 2) == msg.value, "Price has to be even");
    }

    modifier condition(bool _condition) {
        require(_condition, "Condition is not valid.");
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

    event LogCanceledBySeller(
        address indexed sender,
        uint256 amount,
        bytes32 key
    );
    event LogPurchaseConfirmed(
        address indexed sender,
        uint256 amount,
        bytes32 key
    );
    event LogReceivedByBuyer(
        address indexed sender,
        uint256 amount,
        bytes32 key
    );
    event LogWithdrawBySeller(
        address indexed sender,
        uint256 amount,
        bytes32 key
    );
    event LogWithdrawByOwner(
        address indexed sender,
        uint256 amount,
        bytes32 key
    );

    // Confirm the purchase as buyer.
    // Transaction has to include `2 * value` ether.
    // The ether will be locked until buyerConfirmReceived is called
    function buyerPurchase()
        external
        payable
        inState(State.Created)
        condition(msg.value == price.mul(2))
        returns (bool result)
    {
        buyer = msg.sender;
        state = State.Locked;
        emit LogPurchaseConfirmed(msg.sender, msg.value, key);

        return true;
    }

    // Confirm that the buyer received the item from the seller.
    // The buyer will receive the locked ether in the amount of the price.
    function buyerConfirmReceived()
        external
        onlyBuyer
        inState(State.Locked)
        returns (bool result)
    {
        state = State.ItemReceived;
        buyer.transfer(price);
        emit LogReceivedByBuyer(msg.sender, price, key);

        return true;
    }

    // Abort the purchase and reclaim the ether.
    // Can only be called by the seller before
    // the contract is locked.
    function abortBySeller()
        external
        onlySeller
        inState(State.Created)
        returns (bool result)
    {
        uint256 amount = balanceOf();
        state = State.Canceled;

        // We use transfer here directly. It is
        // reentrancy-safe, because it is the
        // last call in this function and we
        // already changed the state.
        seller.transfer(amount);
        emit LogCanceledBySeller(msg.sender, amount, key);

        return true;
    }

    function withdrawBySeller()
        external
        onlySeller
        condition(state == State.ItemReceived || state == State.OwnerPaid)
        returns (bool result)
    {
        if (state == State.OwnerPaid) {
            uint256 amount = balanceOf();

            state = State.Completed;
            seller.transfer(amount);

            emit LogWithdrawBySeller(msg.sender, amount, key);
            return true;
        } else if (state == State.ItemReceived) {
            // calculate commission part
            uint256 commission = (price.mul(_commissionRate)).div(10000);

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

    function withdrawByOwner()
        external
        onlyOwner
        condition(state == State.ItemReceived || state == State.SellerPaid)
        returns (bool result)
    {
        if (state == State.SellerPaid) {
            uint256 amount = balanceOf();

            state = State.Completed;
            owner().transfer(amount);

            emit LogWithdrawByOwner(msg.sender, amount, key);

            return true;
        } else if (state == State.ItemReceived) {
            // calculate commission part: 3.5% ==> 350 /100
            uint256 commission = (price.mul(_commissionRate)).div(10000);

            state = State.OwnerPaid;
            owner().transfer(commission);

            emit LogWithdrawByOwner(msg.sender, commission, key);
            return true;
        } else {
            return false;
        }
    }

    // only owner (==deployer) and seller can see it
    function commissionRate()
        external
        view
        condition(isOwner() || msg.sender == seller)
        returns (uint256 commission)
    {
        return _commissionRate;
    }

    // Get balance of the contract
    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }

    // Prevent someone sending ether to the contract
    // It will cause an exception,
    // because the fallback function does not have the 'payable'
    // modifier.
    fallback() external {
        revert("No Ether excepted");
    }
}

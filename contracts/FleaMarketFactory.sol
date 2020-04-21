
pragma solidity ^0.6.0;

/*
- Functions can be specified as being external, public, internal or private, where the default is public.
 - For state variables, external is not possible and the default is internal.

 -  For public state variables (!! not external), an automatic getter function (see below) is generated.

  - internal:
Those functions and state variables can only be accessed internally
(i.e. from within the current contract or contracts deriving from it), without using this.
*/


import "./HitchensUnorderedKeySet.sol";
import "./SafeRemotePurchase.sol";
import "./Ownable.sol";

contract FleaMarketFactory is Ownable {

    using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
        HitchensUnorderedKeySetLib.Set private widgetSet;

    string public contractName;

    struct WidgetStruct {
        // pointer on the child contract
        address purchaseContract;
    }

    mapping(bytes32 => WidgetStruct) private widgets;

    constructor() public {
        contractName = "FleaMarket Smart Contract";
    }

    event LogCreatePurchaseContract(address sender, bytes32 key, address contractAddress);
    event LogRemovePurchaseContract(address sender, bytes32 key);


    // deploy a new purchase contract
    // payable for functions: Allows them to receive Ether together with a call.
    // commissionRate, for example, 350 ==>  (350/100) = 3.5%
    function createPurchaseContract(bytes32 key, string calldata description, string calldata ipfsImageHash,
        uint256 commissionRate) external payable returns(bool createResult) {

        widgetSet.insert(key); // Note that this will fail automatically if the key already exists.
        WidgetStruct storage wgt = widgets[key];
		/*
		  When a new contract is created with the 'new' keyword, for example
		     Token token = new Token;

          This line fires a transaction which deploys the child Token contract
          and returns the address for that contract.
          In Solidity contracts are directly convertible to addresses.
          The newer compiler wants to see that explicitly, like return address(token);
		*/

        // msg.sender would be the seller
        SafeRemotePurchase c = (new SafeRemotePurchase).value(msg.value)(commissionRate, msg.sender, key, description, ipfsImageHash);


        /*
        !!! Important notice.
        When a new children contract is created the msg.sender value passed to the Ownable
        is the address of the parent contract.
        So we need to tell the child contract who is the contract manager
        */
        c.transferOwnership(owner());


        // cast contract pointer to address
        address newContract = address(c);
        wgt.purchaseContract = newContract;

        emit LogCreatePurchaseContract(msg.sender, key, newContract);

        return true;
    }

    function getContractCount() public view returns(uint contractCount) {
        return widgetSet.count();
    }

    function getContractKeyAtIndex(uint index) external view returns(bytes32 key) {
        return widgetSet.keyAtIndex(index);
    }

    function getContractByKey(bytes32 key) external view returns(address contractAddress) {
        require(widgetSet.exists(key), "Can't get a widget that doesn't exist.");
        WidgetStruct storage w = widgets[key];
        return (w.purchaseContract);
    }

    function removeContractByKey(bytes32 key) external onlyOwner returns(bool result) {
        // Note that this will fail automatically if the key doesn't exist
        widgetSet.remove(key);
        delete widgets[key];
        emit LogRemovePurchaseContract(msg.sender, key);
        return true;
    }

}

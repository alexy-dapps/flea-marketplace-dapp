
import { Injectable } from '@angular/core';
import { MarketPlaceAnchorModule } from '../market-place-anchor.module';
import { EthersWeb3Token } from './tokens/ethers-web3-token';
import { Observable, from, of, zip } from 'rxjs';
import { map, mapTo, tap, switchMap, catchError } from 'rxjs/operators';
import { ethers, Contract, utils } from 'ethers';
import { PurchaseContractModel, ContractState } from '../models';

@Injectable({ providedIn: MarketPlaceAnchorModule })
export class PurchaseContractService {

  private readonly abi = [
    'function key() view returns(bytes32 key)',
    'function description() view returns(string description)',
    'function seller() view returns(address sellerAddress)',
    'function buyer() view returns(address buyerAddress)',
    'function owner() view returns(address ownerAddress)',
    'function price()  view returns(uint weiPrice)',
    'function balanceOf() view returns(uint weiBalance)',
    'function ipfsImageHash() view returns(string ipfsHash)',
    'function state() view returns(uint8 state)',
    'function commissionRate() view returns (uint commission)',

    'event LogCanceledBySeller(address indexed sender, uint256 amount, bytes32 key)',
    'function abortBySeller() returns (bool result)',

    'event LogPurchaseConfirmed(address indexed sender, uint256 amount, bytes32 key)',
    'function buyerPurchase() payable returns (bool result)',

    'event LogReceivedByBuyer(address indexed sender, uint256 amount, bytes32 key)',
    'function buyerConfirmReceived() returns (bool result)',

    'event LogWithdrawBySeller(address indexed sender, uint256 amount, bytes32 key)',
    'function withdrawBySeller() returns (bool result)',

    'event LogWithdrawByOwner(address indexed sender, uint256 amount, bytes32 key)',
    'function withdrawByOwner() returns (bool result)',

  ];

  constructor(private provider: EthersWeb3Token) {
  }

  public loadPurchaseContract(contractAddress: string): Observable<PurchaseContractModel> {

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    const crObservable: Observable<number | null> = from(contract.commissionRate()).pipe(
      map((commission: ethers.utils.BigNumber) => commission.toNumber()),

      // only account with deployer or seller can retrieve this value,
      // otherwise the contract will throw error.
      catchError((err: Error) => of(null))
    );

    // based on https://scotch.io/tutorials/rxjs-operators-for-dummies-forkjoin-zip-combinelatest-withlatestfrom
    return zip(
      from(contract.key()),
      from(contract.seller()),
      from(contract.buyer()),
      from(contract.owner()),
      from(contract.price()),
      from(contract.balanceOf()),
      from(contract.description()),
      from(contract.ipfsImageHash()),
      from(contract.state()),
      from(crObservable),

    )
      .pipe(

        map(([key, sellerAddress, buyerAddress, ownerAddress, weiPrice, weiBalance, description, ipfsHash, state, commission]) => {

          console.log(`key: ${key}, weiPrice: ${weiPrice}, state: ${state}, commission: ${commission}`);
          // key: 0x706967794d6f64656c3030303500000000000000000000000000000000000000, weiPrice: 500000000000000, state: 0
          const product: PurchaseContractModel = {

            productKey: utils.parseBytes32String(key as ethers.utils.Arrayish),
            contractAddress,
            sellerAddress: sellerAddress as string,
            buyerAddress: (buyerAddress === ethers.constants.AddressZero) ? null : buyerAddress as string,
            ownerAddress: ownerAddress as string,
            price: utils.formatEther(weiPrice as ethers.utils.BigNumberish),  // $ETH
            balance: utils.formatEther(weiBalance as ethers.utils.BigNumberish),  // $ETH
            description: description as string,
            ipfsHash: ipfsHash as string,
            state: state as ContractState,
            commission: commission ? commission as number : null
          };

          return product;

        }),

      );

  }


  public abortPurchaseContract(contractAddress: string): Observable<string> {

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = contract.abortBySeller();
    // 'from' operator can be used to convert a promise to an observable
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('abortBySeller Tx:', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('txReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogCanceledBySeller"
            // is the last event.
            map(txReceipt => txReceipt.events.pop()),
            tap(txEvent => console.log('event: ', txEvent.event)),
            mapTo(contractAddress),

          );
        }));

  }

  public confirmPurchase(contractAddress: string, etherValue: string): Observable<string> {

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    const wei = utils.parseEther(etherValue);
    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = contract.buyerPurchase({
      value: wei
    });

    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('buyerConfirmPurchase Tx:', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('txReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogPurchaseConfirmed"
            // call is the last event.
            map(txReceipt => txReceipt.events.pop()),
            tap(txEvent => console.log('event: ', txEvent.event)),
            mapTo(contractAddress),

          );
        }));
  }


  public confirmDelivery(contractAddress: string): Observable<string> {

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = contract.buyerConfirmReceived();
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('buyerConfirmReceived Tx:', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('txReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogReceivedByBuyer"
            // call is the last event.
            map(txReceipt => txReceipt.events.pop()),
            tap(txEvent => console.log('event: ', txEvent.event)),
            mapTo(contractAddress),

          );
        }));

  }

  public withdrawBySeller(contractAddress: string): Observable<string> {

    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = contract.withdrawBySeller();
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('withdrawBySeller Tx:', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('txReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogWithdrawBySeller"
            //  is the last event.
            map(txReceipt => txReceipt.events.pop()),
            // tslint:disable-next-line:max-line-length
            tap(txEvent => console.log(`event: ${txEvent.event}, sent by: ${txEvent.args.sender}, withdrawal amount: ${txEvent.args.amount}`)),
            map(txEvent => ethers.utils.formatEther(txEvent.args.amount))

          );
        }));

  }

  public withdrawByOwner(contractAddress: string): Observable<string> {

    const contract: Contract = new ethers.Contract(contractAddress, this.abi, this.provider.getSigner());

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = contract.withdrawByOwner();
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('withdrawByOwner Tx:', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('txReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogWithdrawBySeller"
            //  is the last event.
            map(txReceipt => txReceipt.events.pop()),
            // tslint:disable-next-line:max-line-length
            tap(txEvent => console.log(`event: ${txEvent.event}, sent by: ${txEvent.args.sender}, withdrawal amount: ${txEvent.args.amount}`)),
            map(txEvent => ethers.utils.formatEther(txEvent.args.amount))

          );
        }));

  }


}





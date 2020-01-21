
import { Injectable } from '@angular/core';
import { MarketPlaceAnchorModule } from '../market-place-anchor.module';
import { FleaMarketContractToken } from './tokens/flea-market-contract-token';
import { Observable, from, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, exhaustMap } from 'rxjs/operators';
import { ethers, utils } from 'ethers';
import { PurchaseWidgetModel } from '../models';

@Injectable({ providedIn: MarketPlaceAnchorModule })
export class FleaMarketContractService {
  constructor(private contractToken: FleaMarketContractToken) {
  }

  public createPurchaseContract(product: any): Observable<string> {

    const commission = Math.floor(parseFloat(product.commission) * 100);
    const bytes32Key = utils.formatBytes32String(product.productKey);
    const wei = utils.parseEther(product.etherValue);

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token =
      this.contractToken.createPurchaseContract(bytes32Key, product.description, product.ipfsHash, commission, {
        value: wei
      });
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('Transaction', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('TransactionReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted 'event LogCreatePurchaseContract(address sender, address contractAddress)'.
            map(txReceipt => txReceipt.events.pop()),
            map(txEvent => txEvent.args.contractAddress),
            tap(address => console.log('address: ', address)));
        }));

  }

  // based on https://stackoverflow.com/questions/52118806/how-to-use-result-of-first-observable-into-next-observables
  private widgetObservable = (id: number): Observable<PurchaseWidgetModel> =>
    from(this.contractToken.getContractKeyAtIndex(id)).pipe(
      switchMap(key => from(this.contractToken.getContractByKey(key)).pipe(
        map(address => {

          const widget: PurchaseWidgetModel = {
            productKey: utils.parseBytes32String(key as ethers.utils.Arrayish),
            contractAddress: address as string
          };

          return widget;

        })
      ))
    )

  // based on https://www.learnrxjs.io/operators/combination/forkjoin.html
  // Example 3: Making a variable number of requests
  public getPurchaseContractList(): Observable<PurchaseWidgetModel[]> {

    return from(this.contractToken.getContractCount()).pipe(

      map((bigNumber: ethers.utils.BigNumber) => bigNumber.toNumber()),
      tap((contractCount: number) => console.log('contractCount: ', contractCount)),

      switchMap((contractCount: number) => {

        if (contractCount === 0) {
          return of([]);
        } else {
          // we get array [0,1,....contractCount-1]
          const countArr: number[] = Array.from(Array(contractCount)).map((e, i) => i);
          const source = of(countArr);

          return source.pipe(
            mergeMap(ids => forkJoin(ids.map(this.widgetObservable)))

          );

        }
      })
    );
  }

  public getName(): Observable<string> {

    return from(this.contractToken.contractName()).pipe(
      map(name => name as string)
    );

  }

  public removePurchaseContract(productKey: string): Observable<string> {

    const bytes32Key = utils.formatBytes32String(productKey);

    // based on https://docs.ethers.io/ethers.js/html/cookbook-contracts.html
    // Call the contract method, getting back the transaction tx
    const token = this.contractToken.removeContractByKey(bytes32Key);
    return from(token)
      .pipe(
        switchMap((tx: any) => {

          console.log('removeContractByKey Transaction', tx);
          // Wait for transaction to be mined
          // Returned a Promise which would resolve to the TransactionReceipt once it is mined.
          return from(tx.wait()).pipe(
            tap((txReceipt: any) => console.log('TransactionReceipt: ', txReceipt)),

            // The receipt will have an "events" Array, which will have
            // the emitted event from the Contract. The "LogRemovePurchaseContract(address sender, bytes32 key))
            // call is the last event.
            map(txReceipt => txReceipt.events.pop()),
            tap(txEvent => console.log('txEvent: ', txEvent)),
            map(txEvent => {
              // retrieve the key parameter value from the event
              const key = txEvent.args.key;
              return utils.parseBytes32String(key as ethers.utils.Arrayish);
            }),

          );
        }));

  }


}





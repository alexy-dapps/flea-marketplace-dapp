import { Injectable } from '@angular/core';
import { ethers, Signer } from 'ethers';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { EthersWeb3Provider } from './ethers-web3-provider';

@Injectable({providedIn: 'root'})
export class EthersProviderService {

   private signer: Signer;

   constructor(private provider: EthersWeb3Provider) {
      this.signer = provider.getSigner();
     }

    public getSelectedAddress(): Observable<string> {

        return from(this.signer.getAddress()).pipe(
          tap(address => console.log('address', address))
        );
    }

    public getNetwork(): Observable<string> {

      return from(this.provider.getNetwork()).pipe(
        map( network => network.name),
        tap(network => console.log('network', network))
      );
  }

    public getBalance(): Observable<string> {

      // getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
      return from(this.provider.getBalance(this.signer.getAddress())).pipe(
         tap(weiBalance => console.log('wei balance', weiBalance)),

         map(weiBalance => ethers.utils.formatEther(weiBalance)),
         tap(balance => console.log('eth balance', balance)),

       );
   }

}

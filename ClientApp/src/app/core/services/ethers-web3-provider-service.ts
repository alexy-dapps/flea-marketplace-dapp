import { Injectable, Inject } from '@angular/core';
import { ethers, utils, Signer } from 'ethers';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { EthereumProviderToken } from '../services/tokens';

@Injectable({ providedIn: 'root' })
export class EthersWeb3ProviderService {

  constructor(@Inject(EthereumProviderToken) private ethProvider) {
    // don't want to initialize Web3Provider here, because if MetaMask has not been install
    // the ethereum provider object  windows.ethereum will be null, and call to instantiate
    // Web3Provider will throw error. This error wil not be caught because the global error handler is not ready yet
    // due the fact that this service is { providedIn: 'root' } and is created during initialization of the app
  }

  // There is only ever up to one account in MetaMask exposed
  public getSelectedAddress(): Observable<string> {

    const web3Provider:ethers.providers.JsonRpcProvider = new ethers.providers.Web3Provider(this.ethProvider);
    const signer:Signer = web3Provider.getSigner();

    return from(signer.getAddress()).pipe(
      tap(address => console.log('account address', address))
    );
  }

  public getNetwork(): Observable<string> {

    const web3Provider: ethers.providers.JsonRpcProvider = new ethers.providers.Web3Provider(this.ethProvider);

    return from(web3Provider.getNetwork()).pipe(
      map(network => network.name),
      tap(name => console.log(`network name: ${name}`))
    );
  }

  public getBalance(): Observable<string> {

    const web3Provider: ethers.providers.JsonRpcProvider = new ethers.providers.Web3Provider(this.ethProvider);
    const signer: Signer = web3Provider.getSigner();

    // getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber>;
    return from(web3Provider.getBalance(signer.getAddress())).pipe(
      tap(weiBalance => console.log('wei balance', weiBalance)),

      map(weiBalance => utils.formatEther(weiBalance)),
      tap(balance => console.log('eth balance', balance)),

    );
  }

}

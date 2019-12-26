
import { Injectable, Inject } from '@angular/core';
import { providers } from 'ethers';
import { MetamaskEthereumToken } from './tokens';


@Injectable({ providedIn: 'root' })
export class EthersWeb3Provider extends providers.Web3Provider {
  constructor(@Inject(MetamaskEthereumToken) web3Provider) {
    super(web3Provider);
  }
}


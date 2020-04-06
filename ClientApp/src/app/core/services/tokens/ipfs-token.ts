
import { InjectionToken } from '@angular/core';
import IpfsHttpClient from 'ipfs-http-client';

export const ipfsToken = new InjectionToken('The IPFS Token', {
  providedIn: 'root',
  factory: () => {

    try {
      return new IpfsHttpClient({
        host: 'ipfs.infura.io',
        port: '5001',
        protocol: 'https'
      });
    } catch (err) {
      console.log('IPFS Token Error', err);
      throw new Error('Unable to access IPFS node daemon on Infura network');
    }
  }
});


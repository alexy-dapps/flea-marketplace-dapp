import { Injectable, InjectionToken, Inject } from '@angular/core';
import { providers } from 'ethers';


export const MetamaskWeb3Token = new InjectionToken(
    'Metamask Web3 provider',
    {
        providedIn: 'root',
        factory: () => {
            const ethereum = (window as any).ethereum;

            if (!ethereum || !ethereum.isMetaMask) {
                throw new Error('Please install MetaMask.');
            }

            return ethereum;
        }
    }
);

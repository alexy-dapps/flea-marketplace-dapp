import { InjectionToken} from '@angular/core';


export const MetamaskEthereumToken = new InjectionToken(
    'Metamask Web3 provider',
    {
        providedIn: 'root',
        factory: () => {
            const ethereum = (window as any).ethereum;

            // Returns true or false, representing whether the user has MetaMask installed.
            if (!ethereum || !ethereum.isMetaMask) {
                throw new Error('Please install MetaMask.');
            }

            return ethereum;
        }
    }
);

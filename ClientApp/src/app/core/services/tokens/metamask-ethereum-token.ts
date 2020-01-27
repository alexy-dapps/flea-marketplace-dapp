import { InjectionToken} from '@angular/core';


export const MetamaskEthereumToken = new InjectionToken(
    'Metamask Web3 provider',
    {
        providedIn: 'root',
        factory: () => {

            // https://gist.github.com/rekmarks/d318677c8fc89e5f7a2f526e00a0768a
            const ethereum = (window as any).ethereum;
            // Returns true or false, representing whether the user has MetaMask installed.
            if (!ethereum || !ethereum.isMetaMask) {
                throw new Error('Please install MetaMask.');
            }

            return ethereum;
        }
    }
);

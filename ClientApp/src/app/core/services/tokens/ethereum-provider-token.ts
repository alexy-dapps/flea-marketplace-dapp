import { InjectionToken} from '@angular/core';

export const EthereumProviderToken = new InjectionToken(
    'Ethereum provider',
    {
        providedIn: 'root',
        factory: () => (window as any).ethereum
    }
);

import { ErrorEffects } from './error.effects';
import { SnackBarEffects } from './snack-bar.effect';
import { Web3ProviderEffects } from './web3-provider.effects';

export const effects: any[] = [ErrorEffects, SnackBarEffects, Web3ProviderEffects];

export * from './error.effects';
export * from './snack-bar.effect';
export * from './web3-provider.effects';

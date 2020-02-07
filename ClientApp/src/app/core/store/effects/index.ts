import { ErrorEffects } from './error.effects';
import { SnackBarEffects } from './snack-bar.effect';
import { Web3ProviderEffects } from './web3-provider.effects';
import { IpfsDaemonEffects } from './ipfs-daemon.effects';
import { SpinnerEffects } from './spinner.effect';

export const effects: any[] = [ErrorEffects, SnackBarEffects, SpinnerEffects,
    Web3ProviderEffects, IpfsDaemonEffects];

export * from './error.effects';
export * from './snack-bar.effect';
export * from './web3-provider.effects';
export * from './ipfs-daemon.effects';
export * from './spinner.effect';

import { ErrorEffects } from './error.effects';
import { SnackBarEffects } from './snack-bar.effects';
import { Web3ProviderEffects } from './web3-provider.effects';
import { IpfsDaemonEffects } from './ipfs-daemon.effects';
import { SpinnerEffects } from './spinner.effects';

export const effects: any[] = [ErrorEffects, SnackBarEffects, SpinnerEffects,
    Web3ProviderEffects, IpfsDaemonEffects];

export * from './error.effects';
export * from './snack-bar.effects';
export * from './web3-provider.effects';
export * from './ipfs-daemon.effects';
export * from './spinner.effects';

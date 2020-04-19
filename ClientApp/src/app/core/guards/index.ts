
import { MetaMaskConnectGuard} from './metamask-connect.guard';
import { IpfsConnectGuard } from './ipfs-connect.guard';

export const guards: any[] = [MetaMaskConnectGuard, IpfsConnectGuard];

export * from './metamask-connect.guard';
export * from './ipfs-connect.guard';

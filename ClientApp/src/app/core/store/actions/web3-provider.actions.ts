
import { createAction, props} from '@ngrx/store';

export const metamaskConnect = createAction('[Web3/Provider] MetaMask Connect');
export const metamaskConnectSuccess = createAction('[Web3/Provider] MetaMask Connect Success');

export const getNetwork = createAction('[Web3/Provider] Ethereum Network Request');
export const networkSuccess = createAction('[Web3/Provider] Ethereum Network Success',  props<{ network: string }>());

export const getAddress = createAction('[Web3/Provider] Selected Address Request');
export const addressSuccess = createAction('[Web3/Provider] Selected Address Success',  props<{ address: string }>());

export const getBalance = createAction('[Web3/Provider] Balance Request');
export const balanceSuccess = createAction('[Web3/Provider] Balance Success',  props<{ balance: string }>());

export const connectRedirect = createAction('[Web3/Provider] MetaMask Connect Redirect');
export const emptyAction = createAction('[Web3/Provider] Empty Action');

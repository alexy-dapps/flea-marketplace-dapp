
import { createAction, props } from '@ngrx/store';

export const ethereumInject = createAction('[Web3/Gateway] Ethereum Inject');
export const ethereumInjectSuccess = createAction('[Web3/Gateway] Ethereum Inject Success');

export const ethereumConnect = createAction('[Web3/Gateway] Ethereum Connect');
export const ethereumConnectSuccess = createAction('[Web3/Gateway] Ethereum Connect Success');

export const ethereumDisconnect = createAction('[Web3/Gateway] Ethereum Disconnect');
export const ethereumDisconnectSuccess = createAction('[Web3/Gateway] Ethereum Disconnect Success');

export const getNetwork = createAction('[Web3/Gateway] Ethereum Network Request');
export const networkSuccess = createAction('[Web3/Gateway] Ethereum Network Success', props<{ network: string }>());

export const getAccount = createAction('[Web3/Gateway] Selected Account Request');
export const accountSuccess = createAction('[Web3/Gateway] Selected Account Success', props<{ address: string }>());

export const getBalance = createAction('[Web3/Gateway] Balance Request');
export const balanceSuccess = createAction('[Web3/Gateway] Balance Success', props<{ balance: string }>());

export const ethereumConnectRedirect = createAction('[Web3/Gateway] Ethereum Connect Redirect');

import { createReducer, on } from '@ngrx/store';
import { Web3ProviderActions } from '../actions';

export interface Web3ProviderState {
  metamaskConnected: boolean;
  account: string;
  ethNetwork: string;
  balance: string;
}

const initialState: Web3ProviderState = {
  metamaskConnected: false,
  ethNetwork: null,
  account: null,
  balance: null
};

export const reducer = createReducer(
  initialState,
  on(Web3ProviderActions.metamaskConnectSuccess, state => ({
    ...state,
    metamaskConnected: true
  })),
  on(Web3ProviderActions.networkSuccess, (state, { network }) => ({
    ...state,
    ethNetwork: network
  })),
  on(Web3ProviderActions.addressSuccess, (state, { address }) => ({
    ...state,
    account: address
  })),
  on(Web3ProviderActions.balanceSuccess, (state, { balance }) => ({
    ...state,
    balance
  }))
);

export const getMetaMaskConnected = (state: Web3ProviderState) =>
  state.metamaskConnected;
export const getNetwork = (state: Web3ProviderState) => state.ethNetwork;
export const getAccount = (state: Web3ProviderState) => state.account;
export const getBalance = (state: Web3ProviderState) => state.balance;

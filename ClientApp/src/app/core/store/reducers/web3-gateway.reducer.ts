import { createReducer, on } from '@ngrx/store';
import { Web3GatewayActions } from '../actions';

export interface Web3GatewayState {
  ethereumInjected: boolean;  // check if MetaMask installed
  ethereumConnected: boolean;  // check if the user has any Ethereum account connected throw MetaMask
  account: string;
  ethereumNetwork: string;
  balance: string;
}

const initialState: Web3GatewayState = {
  ethereumInjected: false,
  ethereumConnected: false,
  ethereumNetwork: null,
  account: null,
  balance: null
};

export const reducer = createReducer(
  initialState,
  on(Web3GatewayActions.ethereumInjectSuccess, state => ({
    ...state,
    ethereumInjected: true
  })),
  on(Web3GatewayActions.ethereumConnectSuccess, state => ({
    ...state,
    ethereumConnected: true
  })),
  on(Web3GatewayActions.networkSuccess, (state, { network }) => ({
    ...state,
    ethereumNetwork: network
  })),
  on(Web3GatewayActions.accountSuccess, (state, { address }) => ({
    ...state,
    account: address
  })),
  on(Web3GatewayActions.balanceSuccess, (state, { balance }) => ({
    ...state,
    balance
  }))
);

export const getEthereumInjected = (state: Web3GatewayState) =>
  state.ethereumInjected;
export const getEthereumConnected = (state: Web3GatewayState) =>
  state.ethereumConnected;
export const getNetwork = (state: Web3GatewayState) => state.ethereumNetwork;
export const getAccount = (state: Web3GatewayState) => state.account;
export const getBalance = (state: Web3GatewayState) => state.balance;

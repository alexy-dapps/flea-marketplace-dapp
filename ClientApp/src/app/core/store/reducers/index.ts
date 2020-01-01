
import {
  createSelector,
  createFeatureSelector,
  ActionReducer,
  MetaReducer,
  Action,
  ActionReducerMap,
} from '@ngrx/store';
import { InjectionToken } from '@angular/core';
import * as fromRouter from '@ngrx/router-store';

import { environment } from '../../../../environments/environment';
import * as fromSpinner from './spinner.reducer';
import * as fromError from './error.reducer';
import * as fromWeb3Provider from './web3-provider.reducer';
import * as fromIpfsDaemon from './ipfs-daemon.reducer';


// nice moment here
// here is our root state, which also includes the route state
export interface AppState {
  router: fromRouter.RouterReducerState<any>;
  spinner: fromSpinner.SpinnerState;
  error: fromError.ErrorState;
  web3Provider: fromWeb3Provider.Web3ProviderState;
  ipfsDaemon: fromIpfsDaemon.IpfsDaemonState;

}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const ROOT_REDUCERS =
  new InjectionToken<ActionReducerMap<AppState, Action>>('Root reducers token', {
  factory: () => ({
    router: fromRouter.routerReducer,
    spinner: fromSpinner.reducer,
    error: fromError.reducer,
    web3Provider: fromWeb3Provider.reducer,
    ipfsDaemon: fromIpfsDaemon.reducer

  }),
});

// console.log all actions
export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state, action) => {
    const result = reducer(state, action);
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', result);
    console.groupEnd();

    return result;
  };
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger]
  : [];

export const selectRouterState = createFeatureSelector<AppState,
  fromRouter.RouterReducerState<any>>('router');

export const {
  selectQueryParams,    // select the current route query params
  selectRouteParams,    // select the current route params
  selectRouteData,      // select the current route data
  selectUrl,            // select the current url
} = fromRouter.getSelectors(selectRouterState);


export const selectSpinnerState = createFeatureSelector<AppState, fromSpinner.SpinnerState>(
  'spinner'
);
export const getSpinnerShow = createSelector(
  selectSpinnerState,
  fromSpinner.getSpinnerShow
);


export const selectErrorState = createFeatureSelector<AppState, fromError.ErrorState>(
  'error'
);

export const getError = createSelector(
  selectErrorState,
  fromError.getError
);

export const selectWeb3ProviderState = createFeatureSelector<AppState, fromWeb3Provider.Web3ProviderState>(
  'web3Provider'
);
export const getMetaMaskEnable = createSelector(
  selectWeb3ProviderState,
  fromWeb3Provider.getMetaMaskEnable
);

export const getAccount = createSelector(
  selectWeb3ProviderState,
  fromWeb3Provider.getAccount
);

export const getNetwork = createSelector(
  selectWeb3ProviderState,
  fromWeb3Provider.getNetwork
);

export const getBalance = createSelector(
  selectWeb3ProviderState,
  fromWeb3Provider.getBalance
);

export const selectIpfsDaemonState = createFeatureSelector<AppState, fromIpfsDaemon.IpfsDaemonState>(
  'ipfsDaemon'
);
export const getIpfsConnectStatus = createSelector(
  selectIpfsDaemonState,
  fromIpfsDaemon.getIpfsConnectStatus
);

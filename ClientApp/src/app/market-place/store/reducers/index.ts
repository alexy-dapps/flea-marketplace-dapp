
import {
  createSelector,
  createFeatureSelector,
  Action,
  combineReducers,
} from '@ngrx/store';

import * as fromRoot from '../../../core/store/reducers';
import * as fromIpfs from './ipfs-product-image.reducer';
import * as fromProducts from './purchase-contract.reducer';


export interface PurchaseContractState {
  ipfs: fromIpfs.State;
  products: fromProducts.State;
}


export interface AppState extends fromRoot.AppState {
  purchaseContract: PurchaseContractState;
}

export function reducers(state: PurchaseContractState | undefined, action: Action) {
  return combineReducers({
    ipfs: fromIpfs.reducer,
    products: fromProducts.reducer
  })(state, action);
}


export const selectPurchaseContractState = createFeatureSelector<AppState, PurchaseContractState>(
  'purchaseContract'
);

export const selectIpfsState = createSelector(selectPurchaseContractState, state => state.ipfs);

export const getIpfsUploadStatus = createSelector(selectIpfsState, fromIpfs.getIpfsUploadStatus);
export const getIpfsHash = createSelector(selectIpfsState, fromIpfs.getIpfsHash);
export const getImageBlob = createSelector(selectIpfsState, fromIpfs.getImageBlob);

// ********************************************************************************
export const getProductEntitiesState = createSelector(selectPurchaseContractState, state => state.products);


/**
 * Adapters created with @ngrx/entity generate
 * commonly used selector functions including
 * getting all ids in the record set, a dictionary
 * of the records by id, an array of records and
 * the total number of records. This reduces boilerplate
 * in selecting records from the entity state.
 */
export const {
  selectIds: getProductKeys,
  selectEntities: getProductEntities,
  selectAll: getAllProducts,
  selectTotal: getTotalProducts,
} = fromProducts.adapter.getSelectors(getProductEntitiesState);


export const isProductsLoaded = createSelector(getProductEntitiesState, state => state.loaded);
export const getSelectedPurchaseContract = createSelector(getProductEntitiesState, state => state.selectedPurchaseContract);


// select product widget entity based on the route param id
export const getSelectedProductWidget = createSelector(
  getProductEntities,
  fromRoot.selectRouteParams,
  (entities, params) => params && entities[params.id]
);



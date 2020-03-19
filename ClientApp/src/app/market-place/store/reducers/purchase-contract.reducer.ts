
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { PurchaseWidgetModel, PurchaseContractModel } from '../../models';
import { PurchaseContractActions } from '../actions';


export interface State extends EntityState<PurchaseWidgetModel> {
  loaded: boolean;
  selectedPurchaseContract: PurchaseContractModel;
}

export function sortByKey(a: PurchaseWidgetModel, b: PurchaseWidgetModel): number {
  return a.productKey.localeCompare(b.productKey);
}

// based on https://next.ngrx.io/guide/entity/adapter
export const adapter: EntityAdapter<PurchaseWidgetModel> = createEntityAdapter<PurchaseWidgetModel>({
  selectId: (product: PurchaseWidgetModel) => product.productKey,
  sortComparer: sortByKey,
});


export const initialState: State = adapter.getInitialState({
  loaded: false,
  selectedPurchaseContract: null
});

export const reducer = createReducer(
  initialState,
  /**
   * based on https://blog.angular-university.io/ngrx-entity/
   * addAll: replaces the whole collection with a new one
   *  If the collection is to be sorted, the adapter will
   * sort each record upon entry into the sorted array.
   */
  on(
    PurchaseContractActions.loadProductsSuccess,
    (state, { products }) => adapter.setAll(products, {

      ...state,
      loaded: true,
      selectedPurchaseContract: null
    })
  ),
  on(
    PurchaseContractActions.removePurchaseContractSuccess,
    (state, { key }) => adapter.removeOne(key, {

      ...state,
      selectedPurchaseContract: null
    })
  ),
  /**
   * The addOne function provided by the created adapter
   * adds one record to the entity dictionary
   * and returns a new state including that records if it doesn't
   * exist already. If the collection is to be sorted, the adapter will
   * insert the new record into the sorted array.
   */
  on(PurchaseContractActions.createPurchaseContractSuccess, (state, { product }) => adapter.addOne(product, state)),
  on(PurchaseContractActions.loadPurchaseContractSuccess, (state, { contract }) => ({
    ...state,
    selectedPurchaseContract: contract,

  })),


);


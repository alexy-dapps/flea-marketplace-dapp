
import { createAction, props} from '@ngrx/store';
import { PurchaseWidgetModel, PurchaseContractModel } from '../../models';

export const createPurchaseContract = createAction('[PurchaseContract/API] Create Purchase Contract', props<{ payload: any }>());

export const createPurchaseContractSuccess =
createAction('[PurchaseContract/Command] Create Purchase Contract Success', props<{ product: PurchaseWidgetModel}>());


export const loadProducts = createAction('[Product/API] Load Products');
export const loadProductsSuccess = createAction('[Product/Command] Load Products Success', props<{ products: PurchaseWidgetModel[] }>());

export const loadPurchaseContract = createAction('[PurchaseContract/API] Load Purchase Contract', props<{ address: string }>());
export const loadPurchaseContractSuccess =
createAction('[PurchaseContract/Command] Load Purchase Contract Success', props<{ contract: PurchaseContractModel }>());

export const removePurchaseContract = createAction('[PurchaseContract/API] Remove Purchase Contract', props<{ key: string }>());
export const removePurchaseContractSuccess =
createAction('[PurchaseContract/Command] Remove Purchase Contract Success', props<{ key: string }>());

export const abortSelectedPurchaseContract = createAction('[PurchaseContract/API] Abort Purchase Contract');
export const abortSelectedPurchaseContractSuccess = createAction('[PurchaseContract/Command] Abort Purchase Contract Success');

export const confirmBuy = createAction('[PurchaseContract/API] Confirm Buy', props<{ eth: string }>());
export const confirmBuySuccess = createAction('[PurchaseContract/Command] Confirm Buy Success');

export const confirmDelivery = createAction('[PurchaseContract/API] Confirm Product Delivery');
export const confirmDeliverySuccess = createAction('[PurchaseContract/Command] Confirm Product Delivery Success');

export const releaseEscrow = createAction('[PurchaseContract/API] Withdraw Escrow By Seller');
// tslint:disable-next-line:max-line-length
export const releaseEscrowSuccess = createAction('[PurchaseContract/Command] Withdraw Escrow By Seller Success', props<{ amount: string }>());

export const withdrawByOwner = createAction('[PurchaseContract/API] Withdraw By Owner');
export const withdrawByOwnerSuccess = createAction('[PurchaseContract/Command] Withdraw By Owner Success', props<{ amount: string }>());


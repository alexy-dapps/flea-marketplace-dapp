

export enum ContractState {
  'Created' = 0,
  'Locked',
  'Inactive',
  'Canceled'
}

export interface PurchaseContractModel {
    productKey: string;
    contractAddress: string;
    sellerAddress: string;
    buyerAddress?: string;   // optional as item may not under contract yet by the buyer
    price: string;  // $ETH
    balanceOf: string;  // $ETH
    title: string;
    ipfsHash: string;
    state: ContractState;
}

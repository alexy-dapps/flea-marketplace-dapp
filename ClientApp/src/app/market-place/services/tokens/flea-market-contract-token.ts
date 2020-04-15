import { Injectable } from '@angular/core';
import { Contract } from 'ethers';
import { EthersWeb3Token } from './ethers-web3-token';
import { MarketPlaceAnchorModule } from '../../market-place-anchor.module';
import { environment } from 'src/environments/environment';

const FLEA_MARKET_CONTRACT_ADDRESS = environment.fleaMarketContractAddress;
const abi = [
  'event LogCreatePurchaseContract(address sender, bytes32 key, address contractAddress)',
  'event LogRemovePurchaseContract(address sender, bytes32 key)',
  'function createPurchaseContract(bytes32 key, string description, string ipfsImageHash, uint256 commissionRate) payable returns(bool createResult)',
  'function getContractCount() view returns(uint contractCount)',
  'function getContractKeyAtIndex(uint index) view returns(bytes32 key)',
  'function getContractByKey(bytes32 key) view returns(address contractAddress)',
  'function contractName() view returns(string contractName)',
  'function removeContractByKey(bytes32 key) returns(bool result)'
];


@Injectable({ providedIn: MarketPlaceAnchorModule })
export class FleaMarketContractToken extends Contract {
  constructor(provider: EthersWeb3Token) {
    super(FLEA_MARKET_CONTRACT_ADDRESS, abi, provider.getSigner());
  }

}


import { createReducer, on } from '@ngrx/store';
import * as IpfsUploadActions from '../actions/ipfs-product-image.actions';

export enum FileUploadStatus {
  Pending = 'Pending',
  Success = 'Success',
  Error = 'Error',
  Progress = 'Progress',
}

export interface State {
    status: FileUploadStatus;
    ipfsHash: string | null;
    imageBlob?: Blob;
}

const initialState: State = {
    status: FileUploadStatus.Pending,
    ipfsHash: null,
    imageBlob: null
};

export const reducer = createReducer(
  initialState,
  on(IpfsUploadActions.reset, () => initialState),
  on(IpfsUploadActions.uploadImage, state => ({
    ...state,
    status: FileUploadStatus.Progress,
  })),
  on(IpfsUploadActions.uploadImageSuccess, (state, { ipfsHash }) => ({
    ...state,
    status: FileUploadStatus.Success,
    ipfsHash
  })),
  on(IpfsUploadActions.uploadImageFail, state => ({
    ...state,
    status: FileUploadStatus.Error,
    ipfsHash: null
  })),
  on(IpfsUploadActions.downloadImageSuccess, (state, { image }) => ({
    ...state,
    imageBlob: image
  })),

);

export const getIpfsUploadStatus = (state: State) => state.status;
export const getIpfsHash = (state: State) => state.ipfsHash;
export const getImageBlob =  (state: State) => state.imageBlob;

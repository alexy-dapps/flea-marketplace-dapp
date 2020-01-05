
import { createAction, props} from '@ngrx/store';

export const reset = createAction('[IPFS/Image] Reset');  // status Pending
export const uploadImage = createAction('[IPFS/Image] Upload', props<{file: File}>());  // status Progress

export const uploadImageSuccess = createAction('[IPFS/Image] Upload Success', props<{ ipfsHash: string }>()); // status Success
export const uploadImageFail = createAction('[IPFS/Image] Upload Fail'); // status Error
export const downloadImage =
createAction('[IPFS/Image] Download Image', props<{ ipfsHash: string }>()); // request to download image from IPFS

export const downloadImageSuccess = createAction('[IPFS/Image] Download Image Success', props<{image: Blob}>());

export const downloadImageError = createAction('[IPFS/Image] Download Image Error');

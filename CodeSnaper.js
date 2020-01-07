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
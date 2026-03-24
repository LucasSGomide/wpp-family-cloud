export interface FileStoragePort {
  saveFile(file: Buffer, filename: string): Promise<string>;
  getFileUrl(filename: string): Promise<string>;
  deleteFile(filename: string): Promise<void>;
}

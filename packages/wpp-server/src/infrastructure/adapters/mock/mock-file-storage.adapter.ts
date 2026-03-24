import { Injectable } from '@nestjs/common';
import { FileStoragePort } from '../../../domain/ports/file-storage.port.js';

@Injectable()
export class MockFileStorageAdapter implements FileStoragePort {
  private readonly storage = new Map<string, Buffer>();

  async saveFile(file: Buffer, filename: string): Promise<string> {
    this.storage.set(filename, file);
    return `mock://storage/${filename}`;
  }

  async getFileUrl(filename: string): Promise<string> {
    return `mock://storage/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    this.storage.delete(filename);
  }
}

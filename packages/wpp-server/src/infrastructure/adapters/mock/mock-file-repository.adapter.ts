import { Injectable } from '@nestjs/common';
import { FileEntryType, FileRepositoryPort } from '../../../domain/ports/file-repository.port.js';

@Injectable()
export class MockFileRepositoryAdapter implements FileRepositoryPort {
  private readonly entries: FileEntryType[] = [];

  async save(entry: FileEntryType): Promise<void> {
    this.entries.push(entry);
    console.log(JSON.stringify({ id: entry.id, category: entry.category, storageUrl: entry.storageUrl, savedAt: entry.savedAt }));
  }
}

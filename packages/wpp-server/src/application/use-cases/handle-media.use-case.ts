import { Inject, Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType } from '../../domain/models/incoming-message.model.js';
import type { FileRepositoryPort } from '../../domain/ports/file-repository.port.js';
import type { FileStoragePort } from '../../domain/ports/file-storage.port.js';
import type { MessagingPort } from '../../domain/ports/messaging.port.js';
import { FILE_REPOSITORY_PORT, FILE_STORAGE_PORT, MESSAGING_PORT } from '../../infrastructure/tokens/injection-tokens.js';

@Injectable()
export class HandleMediaUseCase {
  constructor(
    @Inject(MESSAGING_PORT) private readonly messaging: MessagingPort,
    @Inject(FILE_STORAGE_PORT) private readonly storage: FileStoragePort,
    @Inject(FILE_REPOSITORY_PORT) private readonly repository: FileRepositoryPort,
  ) {}

  async execute(message: IncomingMessageType, category: CategoryEnum): Promise<void> {
    const mediaFile = await this.messaging.downloadMedia(message.rawPayload);
    const filename = `${message.id}-${Date.now()}.${mediaFile.extension}`;
    const storageUrl = await this.storage.saveFile(mediaFile.buffer, filename);
    await this.repository.save({
      id: message.id,
      category,
      storageUrl,
      originalFilename: filename,
      savedAt: new Date(),
    });
    await this.messaging.sendText(message.from, `Saved to ${category}! S3: ${storageUrl}`);
  }
}

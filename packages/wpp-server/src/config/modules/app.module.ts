import { Module } from '@nestjs/common';
import { HandleCategorySelectionUseCase } from '../../application/use-cases/handle-category-selection.use-case.js';
import { HandleIncomingMessageUseCase } from '../../application/use-cases/handle-incoming-message.use-case.js';
import { HandleMediaUseCase } from '../../application/use-cases/handle-media.use-case.js';
import { WhatsAppService } from '../../application/whats-app.service.js';
import { BaileyConnectionAdapter } from '../../infrastructure/adapters/baileys/baileys-connection.adapter.js';
import { BaileyMessagingAdapter } from '../../infrastructure/adapters/baileys/baileys-messaging.adapter.js';
import { MockFileRepositoryAdapter } from '../../infrastructure/adapters/mock/mock-file-repository.adapter.js';
import { MockFileStorageAdapter } from '../../infrastructure/adapters/mock/mock-file-storage.adapter.js';
import {
  ALLOWED_NUMBER,
  FILE_REPOSITORY_PORT,
  FILE_STORAGE_PORT,
  MESSAGING_PORT,
} from '../../infrastructure/tokens/injection-tokens.js';

@Module({
  providers: [
    { provide: FILE_STORAGE_PORT, useClass: MockFileStorageAdapter },
    { provide: FILE_REPOSITORY_PORT, useClass: MockFileRepositoryAdapter },
    { provide: ALLOWED_NUMBER, useValue: process.env['ALLOWED_NUMBER'] ?? '' },
    BaileyConnectionAdapter,
    {
      provide: MESSAGING_PORT,
      useFactory: async (conn: BaileyConnectionAdapter) => {
        const socket = await conn.connect();
        return new BaileyMessagingAdapter(socket);
      },
      inject: [BaileyConnectionAdapter],
    },
    HandleCategorySelectionUseCase,
    HandleMediaUseCase,
    HandleIncomingMessageUseCase,
    WhatsAppService,
  ],
})
export class AppModule {}

import { Inject, Injectable } from '@nestjs/common';
import { isAllowed } from '../../domain/guards/allowlist.guard.js';
import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType } from '../../domain/models/incoming-message.model.js';
import { ALLOWED_NUMBER } from '../../infrastructure/tokens/injection-tokens.js';
import { HandleCategorySelectionUseCase } from './handle-category-selection.use-case.js';
import { HandleMediaUseCase } from './handle-media.use-case.js';

@Injectable()
export class HandleIncomingMessageUseCase {
  private readonly pendingSessions = new Map<string, CategoryEnum>();

  constructor(
    @Inject(ALLOWED_NUMBER) private readonly allowedNumber: string,
    private readonly handleCategorySelection: HandleCategorySelectionUseCase,
    private readonly handleMedia: HandleMediaUseCase,
  ) {}

  async execute(message: IncomingMessageType): Promise<void> {
    if (!isAllowed(message.from, this.allowedNumber)) return;

    const pendingCategory = this.pendingSessions.get(message.from);
    if (pendingCategory !== undefined && message.hasMedia) {
      await this.handleMedia.execute(message, pendingCategory);
      this.pendingSessions.delete(message.from);
      return;
    }

    const category = this.handleCategorySelection.handleSelection(message);
    if (category !== null) {
      this.pendingSessions.set(message.from, category);
      return;
    }

    await this.handleCategorySelection.promptSelection(message.from);
  }
}

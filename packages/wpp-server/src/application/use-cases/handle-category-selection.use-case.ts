import { Inject, Injectable } from '@nestjs/common';
import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType } from '../../domain/models/incoming-message.model.js';
import type { MessagingPort } from '../../domain/ports/messaging.port.js';
import { ListSectionType } from '../../domain/ports/messaging.port.js';
import { MESSAGING_PORT } from '../../infrastructure/tokens/injection-tokens.js';

@Injectable()
export class HandleCategorySelectionUseCase {
  constructor(
    @Inject(MESSAGING_PORT) private readonly messaging: MessagingPort,
  ) {}

  async promptSelection(to: string): Promise<void> {
    const sections: ListSectionType[] = [
      {
        title: 'Categories',
        rows: Object.values(CategoryEnum).map((value) => ({
          id: value,
          title: value,
        })),
      },
    ];
    await this.messaging.sendListMessage(to, 'Select a category', 'Choose', sections);
  }

  handleSelection(message: IncomingMessageType): CategoryEnum | null {
    if (!message.body) return null;
    const validValues = Object.values(CategoryEnum) as string[];
    if (!validValues.includes(message.body)) return null;
    return message.body as CategoryEnum;
  }
}

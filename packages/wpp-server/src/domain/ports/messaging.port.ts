import { MediaFileType } from '../models/media-file.model.js';

export type ListSectionType = {
  title: string;
  rows: Array<{ id: string; title: string; description?: string }>;
};

export interface MessagingPort {
  sendText(to: string, text: string): Promise<void>;
  sendListMessage(to: string, title: string, buttonText: string, sections: ListSectionType[]): Promise<void>;
  downloadMedia(rawPayload: unknown): Promise<MediaFileType>;
}

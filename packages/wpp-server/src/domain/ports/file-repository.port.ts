import { CategoryEnum } from '../models/category.model.js';

export type FileEntryType = {
  id: string;
  category: CategoryEnum;
  storageUrl: string;
  originalFilename: string;
  savedAt: Date;
};

export interface FileRepositoryPort {
  save(entry: FileEntryType): Promise<void>;
}

import { CategoryEnum } from '../../../domain/models/category.model.js';
import { FileEntryType } from '../../../domain/ports/file-repository.port.js';
import { MockFileRepositoryAdapter } from './mock-file-repository.adapter.js';

function makeSut() {
  const sut = new MockFileRepositoryAdapter();
  const mockEntry: FileEntryType = {
    id: '4ecbb9ca-9e84-4d5e-a7c9-e95ab91f2450',
    category: CategoryEnum.FamilyPics,
    storageUrl: 'any-storageUrl',
    originalFilename: 'any-originalFilename',
    savedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  return { sut, mockEntry };
}

describe('MockFileRepositoryAdapter', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('save', () => {
    it('should store the entry with all fields preserved', async () => {
      const { sut, mockEntry } = makeSut();
      await sut.save(mockEntry);
      // @ts-expect-error accessing private property for constructor verification
      const stored = sut.entries[0];
      expect(stored.id).toEqual(mockEntry.id);
      expect(stored.category).toEqual(mockEntry.category);
      expect(stored.storageUrl).toEqual(mockEntry.storageUrl);
      expect(stored.originalFilename).toEqual(mockEntry.originalFilename);
      expect(stored.savedAt).toEqual(mockEntry.savedAt);
    });

    it('should accumulate entries when called multiple times', async () => {
      const { sut, mockEntry } = makeSut();
      const secondEntry: FileEntryType = { ...mockEntry, id: 'b1c2d3e4-0000-0000-0000-000000000001' };
      await sut.save(mockEntry);
      await sut.save(secondEntry);
      // @ts-expect-error accessing private property for constructor verification
      expect(sut.entries).toHaveLength(2);
    });

    it('should not throw for valid FileEntryType input', async () => {
      const { sut, mockEntry } = makeSut();
      await expect(sut.save(mockEntry)).resolves.not.toThrow();
    });
  });
});

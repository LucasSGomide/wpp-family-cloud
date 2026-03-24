import { MockFileStorageAdapter } from './mock-file-storage.adapter.js';

function makeSut() {
  const sut = new MockFileStorageAdapter();
  const mockFilename = 'any-filename.jpg';
  const mockBuffer = Buffer.from('any-content');
  return { sut, mockFilename, mockBuffer };
}

describe('MockFileStorageAdapter', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('saveFile', () => {
    it('should return a URL in the mock://storage/<filename> format', async () => {
      const { sut, mockFilename, mockBuffer } = makeSut();
      const result = await sut.saveFile(mockBuffer, mockFilename);
      expect(result).toEqual(`mock://storage/${mockFilename}`);
    });

    it('should store the buffer internally', async () => {
      const { sut, mockFilename, mockBuffer } = makeSut();
      await sut.saveFile(mockBuffer, mockFilename);
      // @ts-expect-error accessing private property for constructor verification
      expect(sut.storage.get(mockFilename)).toEqual(mockBuffer);
    });

    it('should overwrite the previous buffer when called twice with the same filename', async () => {
      const { sut, mockFilename } = makeSut();
      const firstBuffer = Buffer.from('any-first-content');
      const secondBuffer = Buffer.from('any-second-content');
      await sut.saveFile(firstBuffer, mockFilename);
      await sut.saveFile(secondBuffer, mockFilename);
      // @ts-expect-error accessing private property for constructor verification
      expect(sut.storage.get(mockFilename)).toEqual(secondBuffer);
    });
  });

  describe('getFileUrl', () => {
    it('should return the mock://storage/<filename> URL pattern', async () => {
      const { sut, mockFilename } = makeSut();
      const result = await sut.getFileUrl(mockFilename);
      expect(result).toEqual(`mock://storage/${mockFilename}`);
    });
  });

  describe('deleteFile', () => {
    it('should remove the file from internal state', async () => {
      const { sut, mockFilename, mockBuffer } = makeSut();
      await sut.saveFile(mockBuffer, mockFilename);
      await sut.deleteFile(mockFilename);
      // @ts-expect-error accessing private property for constructor verification
      expect(sut.storage.has(mockFilename)).toBeFalsy();
    });
  });
});

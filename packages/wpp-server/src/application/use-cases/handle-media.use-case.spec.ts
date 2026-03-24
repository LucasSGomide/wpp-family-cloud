import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType, MediaTypeEnum } from '../../domain/models/incoming-message.model.js';
import { MediaFileType } from '../../domain/models/media-file.model.js';
import { FileRepositoryPort } from '../../domain/ports/file-repository.port.js';
import { FileStoragePort } from '../../domain/ports/file-storage.port.js';
import { MessagingPort } from '../../domain/ports/messaging.port.js';
import { HandleMediaUseCase } from './handle-media.use-case.js';

function makeSut() {
  const mockStorageUrl = 'mock://storage/any-file';
  const mockMediaFile: MediaFileType = {
    buffer: Buffer.from('any-content'),
    mimetype: 'image/jpeg',
    extension: 'jpeg',
  };
  const mockMessage: IncomingMessageType = {
    id: '4ecbb9ca-9e84-4d5e-a7c9-e95ab91f2450',
    from: 'any-from',
    body: null,
    hasMedia: true,
    mediaType: MediaTypeEnum.Image,
    rawPayload: { any: 'any-payload' },
  };

  const messaging = {
    sendText: jest.fn(),
    sendListMessage: jest.fn(),
    downloadMedia: jest.fn(),
  } as unknown as MessagingPort;
  const downloadMediaSpy = jest.spyOn(messaging, 'downloadMedia').mockResolvedValue(mockMediaFile);
  const sendTextSpy = jest.spyOn(messaging, 'sendText').mockResolvedValue(undefined);

  const storage = {
    saveFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
  } as unknown as FileStoragePort;
  const saveFileSpy = jest.spyOn(storage, 'saveFile').mockResolvedValue(mockStorageUrl);

  const repository = {
    save: jest.fn(),
  } as unknown as FileRepositoryPort;
  const saveSpy = jest.spyOn(repository, 'save').mockResolvedValue(undefined);

  const sut = new HandleMediaUseCase(messaging, storage, repository);

  return { sut, mockMessage, mockMediaFile, mockStorageUrl, downloadMediaSpy, sendTextSpy, saveFileSpy, saveSpy };
}

describe('HandleMediaUseCase', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('execute', () => {
    it('should call downloadMedia with message.rawPayload', async () => {
      const { sut, mockMessage, downloadMediaSpy } = makeSut();

      await sut.execute(mockMessage, CategoryEnum.Cats);

      expect(downloadMediaSpy).toHaveBeenCalledTimes(1);
      expect(downloadMediaSpy).toHaveBeenCalledWith(mockMessage.rawPayload);
    });

    it('should generate a filename containing message.id and the media extension', async () => {
      const { sut, mockMessage, mockMediaFile, saveFileSpy } = makeSut();

      await sut.execute(mockMessage, CategoryEnum.Cats);

      const filename = saveFileSpy.mock.calls[0][1] as string;
      expect(filename).toContain(mockMessage.id);
      expect(filename).toContain(mockMediaFile.extension);
    });

    it('should call storage.saveFile with the downloaded buffer and generated filename', async () => {
      const { sut, mockMessage, mockMediaFile, saveFileSpy } = makeSut();

      await sut.execute(mockMessage, CategoryEnum.Cats);

      expect(saveFileSpy).toHaveBeenCalledTimes(1);
      expect(saveFileSpy).toHaveBeenCalledWith(mockMediaFile.buffer, expect.any(String));
    });

    it('should call repository.save with the correct category, storageUrl, id, and originalFilename', async () => {
      const { sut, mockMessage, mockStorageUrl, saveFileSpy, saveSpy } = makeSut();
      const capturedFilename = () => saveFileSpy.mock.calls[0][1] as string;

      await sut.execute(mockMessage, CategoryEnum.FamilyPics);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: mockMessage.id,
        category: CategoryEnum.FamilyPics,
        storageUrl: mockStorageUrl,
        originalFilename: capturedFilename(),
      }));
    });

    it('should pass a Date instance as savedAt', async () => {
      const { sut, mockMessage, saveSpy } = makeSut();

      await sut.execute(mockMessage, CategoryEnum.Cats);

      const savedEntry = saveSpy.mock.calls[0][0];
      expect(savedEntry.savedAt).toBeInstanceOf(Date);
    });

    it('should call sendText with message.from and a reply containing the category and storageUrl', async () => {
      const { sut, mockMessage, mockStorageUrl, sendTextSpy } = makeSut();

      await sut.execute(mockMessage, CategoryEnum.ItaunaHouse);

      expect(sendTextSpy).toHaveBeenCalledTimes(1);
      expect(sendTextSpy).toHaveBeenCalledWith(
        mockMessage.from,
        expect.stringContaining(CategoryEnum.ItaunaHouse),
      );
      expect(sendTextSpy).toHaveBeenCalledWith(
        mockMessage.from,
        expect.stringContaining(mockStorageUrl),
      );
    });

    it('should not call sendText if downloadMedia throws', async () => {
      const { sut, mockMessage, downloadMediaSpy, sendTextSpy } = makeSut();
      downloadMediaSpy.mockRejectedValue(new Error('any-download-error'));

      await expect(sut.execute(mockMessage, CategoryEnum.Cats)).rejects.toThrow();

      expect(sendTextSpy).not.toHaveBeenCalled();
    });
  });
});

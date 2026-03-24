import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType } from '../../domain/models/incoming-message.model.js';
import { HandleCategorySelectionUseCase } from './handle-category-selection.use-case.js';
import { HandleIncomingMessageUseCase } from './handle-incoming-message.use-case.js';
import { HandleMediaUseCase } from './handle-media.use-case.js';

jest.mock('./handle-category-selection.use-case.js');
jest.mock('./handle-media.use-case.js');

function makeSut() {
  const mockAllowedNumber = '5531999999999';
  const mockMessage: IncomingMessageType = {
    id: '4ecbb9ca-9e84-4d5e-a7c9-e95ab91f2450',
    from: '5531999999999',
    body: null,
    hasMedia: false,
    mediaType: null,
    rawPayload: null,
  };

  const handleCategorySelection = new HandleCategorySelectionUseCase(null as any);
  const promptSelectionSpy = jest.spyOn(handleCategorySelection, 'promptSelection').mockResolvedValue(undefined);
  const handleSelectionSpy = jest.spyOn(handleCategorySelection, 'handleSelection').mockReturnValue(null);

  const handleMedia = new HandleMediaUseCase(null as any, null as any, null as any);
  const executeMediaSpy = jest.spyOn(handleMedia, 'execute').mockResolvedValue(undefined);

  const sut = new HandleIncomingMessageUseCase(mockAllowedNumber, handleCategorySelection, handleMedia);

  return { sut, mockMessage, handleCategorySelection, handleMedia, promptSelectionSpy, handleSelectionSpy, executeMediaSpy };
}

describe('HandleIncomingMessageUseCase', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('execute', () => {
    it('should return immediately without calling any downstream when sender is not allowed', async () => {
      const { sut, mockMessage, promptSelectionSpy, handleSelectionSpy, executeMediaSpy } = makeSut();

      await sut.execute({ ...mockMessage, from: '5531888888888' });

      expect(promptSelectionSpy).not.toHaveBeenCalled();
      expect(handleSelectionSpy).not.toHaveBeenCalled();
      expect(executeMediaSpy).not.toHaveBeenCalled();
    });

    it('should call promptSelection when sender has no pending session and handleSelection returns null', async () => {
      const { sut, mockMessage, promptSelectionSpy, handleSelectionSpy } = makeSut();

      await sut.execute(mockMessage);

      expect(handleSelectionSpy).toHaveBeenCalledTimes(1);
      expect(promptSelectionSpy).toHaveBeenCalledTimes(1);
      expect(promptSelectionSpy).toHaveBeenCalledWith(mockMessage.from);
    });

    it('should call handleSelection with the message when sender has no pending session', async () => {
      const { sut, mockMessage, handleSelectionSpy } = makeSut();
      const messageWithCategory = { ...mockMessage, body: CategoryEnum.Cats };
      handleSelectionSpy.mockReturnValue(CategoryEnum.Cats);

      await sut.execute(messageWithCategory);

      expect(handleSelectionSpy).toHaveBeenCalledTimes(1);
      expect(handleSelectionSpy).toHaveBeenCalledWith(messageWithCategory);
    });

    it('should store category in pendingSessions after valid selection', async () => {
      const { sut, mockMessage, handleSelectionSpy } = makeSut();
      handleSelectionSpy.mockReturnValue(CategoryEnum.FamilyPics);

      await sut.execute({ ...mockMessage, body: CategoryEnum.FamilyPics });

      // @ts-expect-error accessing private property for constructor verification
      expect(sut.pendingSessions.get(mockMessage.from)).toEqual(CategoryEnum.FamilyPics);
    });

    it('should call HandleMediaUseCase.execute with the correct category when sender has pending session and message has media', async () => {
      const { sut, mockMessage, handleSelectionSpy, executeMediaSpy } = makeSut();
      handleSelectionSpy.mockReturnValue(CategoryEnum.Company);
      await sut.execute({ ...mockMessage, body: CategoryEnum.Company });

      const mediaMessage = { ...mockMessage, hasMedia: true };
      await sut.execute(mediaMessage);

      expect(executeMediaSpy).toHaveBeenCalledTimes(1);
      expect(executeMediaSpy).toHaveBeenCalledWith(mediaMessage, CategoryEnum.Company);
    });

    it('should remove sender from pendingSessions after media is handled', async () => {
      const { sut, mockMessage, handleSelectionSpy } = makeSut();
      handleSelectionSpy.mockReturnValue(CategoryEnum.Cats);
      await sut.execute({ ...mockMessage, body: CategoryEnum.Cats });

      await sut.execute({ ...mockMessage, hasMedia: true });

      // @ts-expect-error accessing private property for constructor verification
      expect(sut.pendingSessions.has(mockMessage.from)).toBeFalsy();
    });

    it('should call promptSelection when message body is not a valid category', async () => {
      const { sut, mockMessage, promptSelectionSpy } = makeSut();

      await sut.execute({ ...mockMessage, body: 'any-invalid-body' });

      expect(promptSelectionSpy).toHaveBeenCalledTimes(1);
    });
  });
});

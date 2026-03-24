import { CategoryEnum } from '../../domain/models/category.model.js';
import { IncomingMessageType } from '../../domain/models/incoming-message.model.js';
import { ListSectionType, MessagingPort } from '../../domain/ports/messaging.port.js';
import { HandleCategorySelectionUseCase } from './handle-category-selection.use-case.js';

function makeSut() {
  const mockTo = 'any-to';
  const mockMessage: IncomingMessageType = {
    id: '4ecbb9ca-9e84-4d5e-a7c9-e95ab91f2450',
    from: 'any-from',
    body: null,
    hasMedia: false,
    mediaType: null,
    rawPayload: null,
  };

  const messaging = {
    sendText: jest.fn().mockResolvedValue(undefined),
    sendListMessage: jest.fn().mockResolvedValue(undefined),
    downloadMedia: jest.fn(),
  } as unknown as MessagingPort;

  const sendListMessageSpy = jest.spyOn(messaging, 'sendListMessage');

  const sut = new HandleCategorySelectionUseCase(messaging);

  return { sut, mockTo, mockMessage, messaging, sendListMessageSpy };
}

describe('HandleCategorySelectionUseCase', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('promptSelection', () => {
    it('should call sendListMessage exactly once with the correct to argument', async () => {
      const { sut, mockTo, sendListMessageSpy } = makeSut();

      await sut.promptSelection(mockTo);

      expect(sendListMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendListMessageSpy).toHaveBeenCalledWith(mockTo, expect.any(String), expect.any(String), expect.any(Array));
    });

    it('should pass all CategoryEnum values as rows across sections', async () => {
      const { sut, mockTo, sendListMessageSpy } = makeSut();

      await sut.promptSelection(mockTo);

      const sections = sendListMessageSpy.mock.calls[0][3] as ListSectionType[];
      const rowIds = sections.flatMap((s) => s.rows.map((r) => r.id));
      expect(rowIds).toEqual(expect.arrayContaining(Object.values(CategoryEnum)));
      expect(rowIds).toHaveLength(Object.values(CategoryEnum).length);
    });

    it('should use a non-empty buttonText', async () => {
      const { sut, mockTo, sendListMessageSpy } = makeSut();

      await sut.promptSelection(mockTo);

      const buttonText = sendListMessageSpy.mock.calls[0][2] as string;
      expect(buttonText.length).toBeGreaterThan(0);
    });
  });

  describe('handleSelection', () => {
    it('should return the matching CategoryEnum when body matches a valid value', () => {
      const { sut, mockMessage } = makeSut();

      const result = sut.handleSelection({ ...mockMessage, body: CategoryEnum.FamilyPics });

      expect(result).toEqual(CategoryEnum.FamilyPics);
    });

    it.each([
      ['a non-enum string', 'any-invalid-body'],
      ['null', null],
      ['an empty string', ''],
    ])('should return null when body is %s', (_label, body) => {
      const { sut, mockMessage } = makeSut();

      // @ts-expect-error testing invalid input
      const result = sut.handleSelection({ ...mockMessage, body });

      expect(result).toBeNull();
    });
  });
});

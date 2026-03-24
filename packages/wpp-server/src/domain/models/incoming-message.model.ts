export enum MediaTypeEnum {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
}

export type IncomingMessageType = {
  id: string;
  from: string;
  body: string | null;
  hasMedia: boolean;
  mediaType: MediaTypeEnum | null;
  rawPayload: unknown;
};

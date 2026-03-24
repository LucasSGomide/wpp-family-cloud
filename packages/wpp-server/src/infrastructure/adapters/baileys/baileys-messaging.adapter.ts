import { Injectable } from '@nestjs/common';
import { downloadMediaMessage, proto, WAMessage } from 'baileys';
import type { WASocket } from 'baileys';
import { randomUUID } from 'crypto';
import { MediaFileType } from '../../../domain/models/media-file.model.js';
import { ListSectionType, MessagingPort } from '../../../domain/ports/messaging.port.js';

@Injectable()
export class BaileyMessagingAdapter implements MessagingPort {
  constructor(private readonly socket: WASocket) {}

  async sendText(to: string, text: string): Promise<void> {
    await this.socket.sendMessage(to, { text });
  }

  async sendListMessage(
    to: string,
    title: string,
    buttonText: string,
    sections: ListSectionType[],
  ): Promise<void> {
    await this.socket.relayMessage(
      to,
      {
        listMessage: proto.Message.ListMessage.create({
          title,
          buttonText,
          listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
          sections: sections.map((s) => ({
            title: s.title,
            rows: s.rows.map((r) => ({
              rowId: r.id,
              title: r.title,
              description: r.description,
            })),
          })),
        }),
      },
      { messageId: randomUUID() },
    );
  }

  async downloadMedia(rawPayload: unknown): Promise<MediaFileType> {
    const msg = rawPayload as WAMessage;
    const buffer = (await downloadMediaMessage(msg, 'buffer', {})) as Buffer;

    const mimetype =
      msg.message?.imageMessage?.mimetype ??
      msg.message?.videoMessage?.mimetype ??
      msg.message?.audioMessage?.mimetype ??
      msg.message?.documentMessage?.mimetype ??
      'application/octet-stream';

    const extension = mimetype.split('/')[1]?.split(';')[0]?.trim() ?? 'bin';

    return { buffer, mimetype, extension };
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { WAMessage } from 'baileys';
import { randomUUID } from 'crypto';
import { IncomingMessageType, MediaTypeEnum } from '../domain/models/incoming-message.model.js';
import { BaileyConnectionAdapter } from '../infrastructure/adapters/baileys/baileys-connection.adapter.js';
import { HandleIncomingMessageUseCase } from './use-cases/handle-incoming-message.use-case.js';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  constructor(
    private readonly conn: BaileyConnectionAdapter,
    private readonly handleIncomingMessage: HandleIncomingMessageUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    const socket = this.conn.getSocket();
    if (!socket) return;

    socket.ev.on('messages.upsert', ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        this.handleIncomingMessage
          .execute(this.toIncomingMessage(msg))
          .catch((err) => console.error('Error handling message:', err));
      }
    });
  }

  private toIncomingMessage(msg: WAMessage): IncomingMessageType {
    const hasImage = !!msg.message?.imageMessage;
    const hasVideo = !!msg.message?.videoMessage;
    const hasAudio = !!msg.message?.audioMessage;
    const hasDocument = !!msg.message?.documentMessage;

    const mediaType = hasImage
      ? MediaTypeEnum.Image
      : hasVideo
        ? MediaTypeEnum.Video
        : hasAudio
          ? MediaTypeEnum.Audio
          : hasDocument
            ? MediaTypeEnum.Document
            : null;

    return {
      id: msg.key.id ?? randomUUID(),
      from: msg.key.remoteJid ?? '',
      body:
        msg.message?.conversation ??
        msg.message?.extendedTextMessage?.text ??
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ??
        null,
      hasMedia: hasImage || hasVideo || hasAudio || hasDocument,
      mediaType,
      rawPayload: msg,
    };
  }
}

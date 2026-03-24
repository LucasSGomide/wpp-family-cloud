import pino from 'pino';
import { Injectable } from '@nestjs/common';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from 'baileys';
import QRCode from 'qrcode';

@Injectable()
export class BaileyConnectionAdapter {
  private socket: WASocket | null = null;

  async connect(): Promise<WASocket> {
    const { state, saveCreds } = await useMultiFileAuthState(
      process.env['AUTH_STATE_DIR'] ?? './auth_state',
    );

    this.socket = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu('FamilyCloud'),
      logger: pino({ level: 'debug' }),
    });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on(
      'connection.update',
      ({ connection, lastDisconnect, qr }) => {
        if (qr) {
          QRCode.toString(qr, { type: 'terminal', small: true }, (err, str) => {
            if (!err) console.log(str);
          });
        }

        if (connection === 'close') {
          const statusCode = (
            lastDisconnect?.error as
              | { output?: { statusCode?: number } }
              | undefined
          )?.output?.statusCode;
          if (statusCode !== DisconnectReason.loggedOut) {
            this.connect().catch((err) =>
              console.error('Reconnect failed:', err),
            );
          } else {
            console.log('Logged out — not reconnecting');
          }
        } else if (connection === 'open') {
          console.log('Connected');
        }
      },
    );

    return this.socket;
  }

  getSocket(): WASocket | null {
    return this.socket;
  }
}

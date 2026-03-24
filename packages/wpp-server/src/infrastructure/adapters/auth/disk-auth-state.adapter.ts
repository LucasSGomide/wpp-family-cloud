import { useMultiFileAuthState } from 'baileys';

export class DiskAuthStateAdapter {
  load(dir: string) {
    return useMultiFileAuthState(dir);
  }
}

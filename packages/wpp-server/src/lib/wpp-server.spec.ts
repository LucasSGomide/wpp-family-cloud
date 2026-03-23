import { wppServer } from './wpp-server.js';

describe('wppServer', () => {
  it('should work', () => {
    expect(wppServer()).toEqual('wpp-server');
  });
});

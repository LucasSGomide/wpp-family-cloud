import { isAllowed, normalizeJid } from './allowlist.guard.js';

describe('normalizeJid', () => {
  it('should strip @s.whatsapp.net suffix', () => {
    expect(normalizeJid('5531999999999@s.whatsapp.net')).toEqual('5531999999999');
  });

  it('should strip + prefix', () => {
    expect(normalizeJid('+5531999999999')).toEqual('5531999999999');
  });

  it('should strip non-digit characters', () => {
    expect(normalizeJid('55 (31) 99999-9999')).toEqual('5531999999999');
  });

  it('should handle already-normalized input without double stripping', () => {
    expect(normalizeJid('5531999999999')).toEqual('5531999999999');
  });
});

describe('isAllowed', () => {
  it('should return true when both sides normalize to the same number', () => {
    expect(isAllowed('5531999999999', '5531999999999')).toBeTruthy();
  });

  it('should return false when numbers differ', () => {
    expect(isAllowed('5531999999999', '5531888888888')).toBeFalsy();
  });

  it('should return true when one side has @s.whatsapp.net and the other does not', () => {
    expect(isAllowed('5531999999999@s.whatsapp.net', '5531999999999')).toBeTruthy();
  });

  it('should return false when allowedNumber is empty string', () => {
    expect(isAllowed('5531999999999', '')).toBeFalsy();
  });
});

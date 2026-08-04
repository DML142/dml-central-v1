import { beforeEach, describe, expect, it, vi } from 'vitest';

const VALID = {
  TELEGRAM_BOT_TOKEN: '123456:dummy-token',
  TELEGRAM_CHAT_ID: '-1001234567890',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

async function loadParseEnv() {
  vi.stubEnv('TELEGRAM_BOT_TOKEN', VALID.TELEGRAM_BOT_TOKEN);
  vi.stubEnv('TELEGRAM_CHAT_ID', VALID.TELEGRAM_CHAT_ID);
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', VALID.NEXT_PUBLIC_SITE_URL);

  const { parseEnv } = await import('@/lib/env');
  return parseEnv;
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe('parseEnv', () => {
  it('returns the parsed values', async () => {
    const parseEnv = await loadParseEnv();

    expect(parseEnv(VALID)).toEqual(VALID);
  });

  it('rejects a missing token', async () => {
    const parseEnv = await loadParseEnv();

    expect(() => parseEnv({ ...VALID, TELEGRAM_BOT_TOKEN: undefined })).toThrow(
      /TELEGRAM_BOT_TOKEN/,
    );
  });

  it('rejects an empty chat id', async () => {
    const parseEnv = await loadParseEnv();

    expect(() => parseEnv({ ...VALID, TELEGRAM_CHAT_ID: '' })).toThrow(/TELEGRAM_CHAT_ID/);
  });

  it('rejects a site url that is not absolute', async () => {
    const parseEnv = await loadParseEnv();

    expect(() => parseEnv({ ...VALID, NEXT_PUBLIC_SITE_URL: 'localhost:3000' })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it('reports every problem at once', async () => {
    const parseEnv = await loadParseEnv();

    expect(() => parseEnv({})).toThrow(
      /TELEGRAM_BOT_TOKEN.*TELEGRAM_CHAT_ID.*NEXT_PUBLIC_SITE_URL/,
    );
  });

  it('never puts a secret in the thrown message', async () => {
    const parseEnv = await loadParseEnv();

    try {
      parseEnv({ ...VALID, NEXT_PUBLIC_SITE_URL: 'nope' });
      expect.unreachable('parseEnv should have thrown');
    } catch (error) {
      expect(String(error)).not.toContain(VALID.TELEGRAM_BOT_TOKEN);
      expect(String(error)).not.toContain(VALID.TELEGRAM_CHAT_ID);
    }
  });
});

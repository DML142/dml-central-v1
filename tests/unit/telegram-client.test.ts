import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { TelegramClient, TelegramDeliveryError } from '@/lib/telegram/client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('TelegramClient', () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('posts to the sendMessage endpoint with the html payload', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    await client.send('<b>hi</b>');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('fetch was not called');
    const [url, init] = call;
    expect(url).toBe('https://api.telegram.org/botabc123/sendMessage');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({
      chat_id: '-100',
      text: '<b>hi</b>',
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  });

  it('resolves without throwing on a successful response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    await expect(client.send('hi')).resolves.toBeUndefined();
  });

  it('retries once on 429, waiting the retry_after the api reports', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(429, { ok: false, description: 'flood', parameters: { retry_after: 2 } }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    const promise = client.send('hi');
    await vi.advanceTimersByTimeAsync(2000);
    await expect(promise).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('caps the 429 retry wait at 5 seconds', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(429, { ok: false, description: 'flood', parameters: { retry_after: 30 } }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    const promise = client.send('hi');
    await vi.advanceTimersByTimeAsync(5000);
    await expect(promise).resolves.toBeUndefined();
  });

  it('retries once on a 5xx response', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(503, { ok: false, description: 'down' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    await expect(client.send('hi')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 4xx other than 429', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { ok: false, description: 'bad request' }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    await expect(client.send('hi')).rejects.toThrow(TelegramDeliveryError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws after both attempts fail', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(500, { ok: false, description: 'down' }))
      .mockResolvedValueOnce(jsonResponse(500, { ok: false, description: 'still down' }));
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    await expect(client.send('hi')).rejects.toThrow(TelegramDeliveryError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws when the request exceeds the timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );
    const client = new TelegramClient({ token: 'abc123', chatId: '-100' });

    const promise = client.send('hi');
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(8000);

    await expect(promise).rejects.toThrow(TelegramDeliveryError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

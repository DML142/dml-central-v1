import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { ApiRequestError, postJson } from '@/lib/api-client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('postJson', () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('posts json and returns the parsed body', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await postJson<{ ok: boolean }>('/api/contact', { name: 'Tom' });

    expect(result).toEqual({ ok: true });
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error('fetch was not called');
    const [url, init] = call;
    expect(url).toBe('/api/contact');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({ 'content-type': 'application/json' });
    expect(JSON.parse(init?.body as string)).toEqual({ name: 'Tom' });
  });

  it('returns the parsed body even for a non-2xx response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(429, { ok: false, error: 'rate_limited' }));

    const result = await postJson('/api/contact', {});

    expect(result).toEqual({ ok: false, error: 'rate_limited' });
  });

  it('throws a network error when fetch rejects', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(postJson('/api/contact', {})).rejects.toMatchObject({ kind: 'network' });
  });

  it('throws a timeout error when the request is aborted', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );

    const promise = postJson('/api/contact', {}, { timeoutMs: 5000 });
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(5000);

    await expect(promise).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('throws a parse error when the response body is not valid json', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not json', { status: 200 }));

    await expect(postJson('/api/contact', {})).rejects.toMatchObject({ kind: 'parse' });
  });

  it('is an instance of ApiRequestError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(postJson('/api/contact', {})).rejects.toBeInstanceOf(ApiRequestError);
  });
});

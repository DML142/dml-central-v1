import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { ContactResponse } from '@/lib/validation/contact';

const ENV = {
  TELEGRAM_BOT_TOKEN: '123:dummy',
  TELEGRAM_CHAT_ID: '-100',
  NEXT_PUBLIC_SITE_URL: 'https://dml.dev',
};

const validPayload = {
  name: 'Maxim',
  email: 'someone@example.com',
  telegram: '@volnowan',
  message: 'A message that is comfortably past the ten character floor.',
  company: '',
  startedAt: Date.now() - 3000,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

async function readJson(response: Response): Promise<ContactResponse> {
  return (await response.json()) as ContactResponse;
}

function expectFailure(
  body: ContactResponse,
): asserts body is Extract<ContactResponse, { ok: false }> {
  expect(body.ok).toBe(false);
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function loadRoute() {
  vi.stubEnv('TELEGRAM_BOT_TOKEN', ENV.TELEGRAM_BOT_TOKEN);
  vi.stubEnv('TELEGRAM_CHAT_ID', ENV.TELEGRAM_CHAT_ID);
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', ENV.NEXT_PUBLIC_SITE_URL);

  const { POST } = await import('@/app/api/contact/route');
  return POST;
}

describe('POST /api/contact', () => {
  let fetchMock: Mock<typeof fetch>;

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    fetchMock = vi.fn();
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
  });

  it('delivers a valid submission and responds ok', async () => {
    const POST = await loadRoute();

    const response = await POST(makeRequest(validPayload, { 'x-forwarded-for': '1.1.1.1' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid submission without calling telegram', async () => {
    const POST = await loadRoute();

    const response = await POST(
      makeRequest({ ...validPayload, email: 'not-an-email' }, { 'x-forwarded-for': '1.1.1.2' }),
    );

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expectFailure(body);
    expect(body.error).toBe('validation');
    expect(body.error === 'validation' && body.fields.email).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a filled honeypot as a validation error, not a distinct shape', async () => {
    const POST = await loadRoute();

    const response = await POST(
      makeRequest({ ...validPayload, company: 'Acme' }, { 'x-forwarded-for': '1.1.1.3' }),
    );

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expectFailure(body);
    expect(body.error).toBe('validation');
    expect(body.error === 'validation' && body.fields.company).toBe('rejected');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a submission under the fill-time floor', async () => {
    const POST = await loadRoute();

    const response = await POST(
      makeRequest({ ...validPayload, startedAt: Date.now() }, { 'x-forwarded-for': '1.1.1.6' }),
    );

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expectFailure(body);
    expect(body.error === 'validation' && body.fields.startedAt).toBe('rejected');
  });

  it('rejects malformed json as a validation error', async () => {
    const POST = await loadRoute();
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.1.1.4' },
      body: '{not json',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await readJson(response);
    expectFailure(body);
    expect(body.error).toBe('validation');
  });

  it('returns a delivery error and never leaks the upstream message when telegram fails', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { ok: false, description: 'chat not found: -100' }),
    );
    const POST = await loadRoute();

    const response = await POST(makeRequest(validPayload, { 'x-forwarded-for': '1.1.1.5' }));

    expect(response.status).toBe(502);
    const body = await readJson(response);
    expect(body).toEqual({ ok: false, error: 'delivery' });
    expect(JSON.stringify(body)).not.toContain('chat not found');
  });

  it('rate limits the fourth valid submission from the same ip within the window', async () => {
    const POST = await loadRoute();
    const headers = { 'x-forwarded-for': '2.2.2.2' };

    await POST(makeRequest(validPayload, headers));
    await POST(makeRequest(validPayload, headers));
    await POST(makeRequest(validPayload, headers));
    const fourth = await POST(makeRequest(validPayload, headers));

    expect(fourth.status).toBe(429);
    expect(fourth.headers.get('Retry-After')).toBeTruthy();
    const body = await readJson(fourth);
    expectFailure(body);
    expect(body.error).toBe('rate_limited');
    expect(body.error === 'rate_limited' && typeof body.retryAfter).toBe('number');
  });

  it('does not rate limit a different ip', async () => {
    const POST = await loadRoute();

    await POST(makeRequest(validPayload, { 'x-forwarded-for': '3.3.3.3' }));
    await POST(makeRequest(validPayload, { 'x-forwarded-for': '3.3.3.3' }));
    await POST(makeRequest(validPayload, { 'x-forwarded-for': '3.3.3.3' }));
    const other = await POST(makeRequest(validPayload, { 'x-forwarded-for': '4.4.4.4' }));

    expect(other.status).toBe(200);
  });

  it('uses the first entry of a multi-hop x-forwarded-for header', async () => {
    const POST = await loadRoute();

    await POST(makeRequest(validPayload, { 'x-forwarded-for': '5.5.5.5, 9.9.9.9' }));
    await POST(makeRequest(validPayload, { 'x-forwarded-for': '5.5.5.5, 8.8.8.8' }));
    await POST(makeRequest(validPayload, { 'x-forwarded-for': '5.5.5.5, 7.7.7.7' }));
    const fourth = await POST(makeRequest(validPayload, { 'x-forwarded-for': '5.5.5.5, 6.6.6.6' }));

    expect(fourth.status).toBe(429);
  });

  it('does not let rejected submissions consume the rate limit budget', async () => {
    const POST = await loadRoute();
    const headers = { 'x-forwarded-for': '6.6.6.1' };
    const spam = { ...validPayload, company: 'bot' };

    await POST(makeRequest(spam, headers));
    await POST(makeRequest(spam, headers));
    await POST(makeRequest(spam, headers));
    const valid = await POST(makeRequest(validPayload, headers));

    expect(valid.status).toBe(200);
  });
});

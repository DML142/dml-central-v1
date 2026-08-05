const DEFAULT_TIMEOUT_MS = 10000;

export type ApiRequestErrorKind = 'network' | 'timeout' | 'parse';

export class ApiRequestError extends Error {
  constructor(public readonly kind: ApiRequestErrorKind) {
    super(`api request failed: ${kind}`);
    this.name = 'ApiRequestError';
  }
}

export interface PostJsonOptions {
  timeoutMs?: number;
}

/**
 * The one wrapper client fetches to internal routes go through: timeout via `AbortController`,
 * and every non-2xx-unaware failure (network down, aborted, unparsable body) normalised into an
 * `ApiRequestError`. A parsed response body — success or a typed error shape — is returned as-is,
 * since the route handlers already speak their own typed contract.
 */
export async function postJson<T>(
  url: string,
  body: unknown,
  options: PostJsonOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiRequestError('parse');
    }
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiRequestError('timeout');
    }
    throw new ApiRequestError('network');
  } finally {
    clearTimeout(timeout);
  }
}

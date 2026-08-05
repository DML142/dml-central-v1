const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_CAP_MS = 5000;

export interface TelegramClientConfig {
  token: string;
  chatId: string;
}

interface TelegramErrorBody {
  description?: string;
  parameters?: { retry_after?: number };
}

type Attempt =
  | { ok: true }
  | { ok: false; retryable: true; retryDelayMs: number; description: string }
  | { ok: false; retryable: false; description: string };

export class TelegramDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelegramDeliveryError';
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends the contact form notification to a Telegram chat. Constructed from validated env; `send`
 * retries once on 429 or 5xx (§7.4) and never leaks the token in a thrown message.
 */
export class TelegramClient {
  private readonly token: string;
  private readonly chatId: string;

  constructor(config: TelegramClientConfig) {
    this.token = config.token;
    this.chatId = config.chatId;
  }

  async send(text: string): Promise<void> {
    const first = await this.attempt(text);
    if (first.ok) return;
    if (!first.retryable) {
      throw new TelegramDeliveryError(first.description);
    }

    await delay(first.retryDelayMs);

    const second = await this.attempt(text);
    if (second.ok) return;
    throw new TelegramDeliveryError(second.description);
  }

  private async attempt(text: string): Promise<Attempt> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      if (response.ok) return { ok: true };

      const body = (await response.json().catch(() => null)) as TelegramErrorBody | null;
      const description = body?.description ?? `telegram responded ${response.status}`;

      if (response.status === 429) {
        const retryAfterSeconds = body?.parameters?.retry_after ?? 1;
        return {
          ok: false,
          retryable: true,
          retryDelayMs: Math.min(retryAfterSeconds * 1000, RETRY_DELAY_CAP_MS),
          description,
        };
      }

      if (response.status >= 500) {
        return { ok: false, retryable: true, retryDelayMs: 0, description };
      }

      return { ok: false, retryable: false, description };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ok: false, retryable: false, description: 'telegram request timed out' };
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

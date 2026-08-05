import { describe, expect, it } from 'vitest';

import { buildContactMessage, escapeTelegramHtml } from '@/lib/telegram/message-template';

describe('escapeTelegramHtml', () => {
  it('escapes ampersand, angle brackets and double quotes', () => {
    expect(escapeTelegramHtml('<b>Tom & "Jerry"</b>')).toBe(
      '&lt;b&gt;Tom &amp; &quot;Jerry&quot;&lt;/b&gt;',
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeTelegramHtml('Hello world')).toBe('Hello world');
  });
});

describe('buildContactMessage', () => {
  const meta = {
    timestamp: new Date('2026-08-05T12:34:56.000Z'),
    sourceUrl: 'https://dml.dev',
  };

  it('includes the escaped name, email and message body in a pre block', () => {
    const text = buildContactMessage(
      { name: 'Tom & Jerry', email: 'tom@example.com', telegram: '', message: 'Hi <there>' },
      meta,
    );

    expect(text).toContain('Tom &amp; Jerry');
    expect(text).toContain('tom@example.com');
    expect(text).toContain('<pre>Hi &lt;there&gt;</pre>');
  });

  it('includes the telegram handle line when provided', () => {
    const text = buildContactMessage(
      { name: 'Tom', email: 'tom@example.com', telegram: '@tomcat', message: 'Hi there' },
      meta,
    );

    expect(text).toContain('@tomcat');
  });

  it('omits the telegram handle line when not provided', () => {
    const text = buildContactMessage(
      { name: 'Tom', email: 'tom@example.com', telegram: '', message: 'Hi there' },
      meta,
    );

    expect(text).not.toMatch(/telegram/i);
  });

  it('renders the utc timestamp and source url in the footer', () => {
    const text = buildContactMessage(
      { name: 'Tom', email: 'tom@example.com', telegram: '', message: 'Hi there' },
      meta,
    );

    expect(text).toContain('2026-08-05');
    expect(text).toContain('https://dml.dev');
  });

  it('opens with a bold header line', () => {
    const text = buildContactMessage(
      { name: 'Tom', email: 'tom@example.com', telegram: '', message: 'Hi there' },
      meta,
    );

    expect(text.startsWith('<b>')).toBe(true);
  });
});

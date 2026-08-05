export function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ContactMessageInput {
  name: string;
  email: string;
  telegram: string;
  message: string;
}

export interface ContactMessageMeta {
  timestamp: Date;
  sourceUrl: string;
}

export function buildContactMessage(input: ContactMessageInput, meta: ContactMessageMeta): string {
  const lines = [
    '<b>New contact form submission</b>',
    '',
    `Name: ${escapeTelegramHtml(input.name)}`,
    `Email: ${escapeTelegramHtml(input.email)}`,
  ];

  if (input.telegram) {
    lines.push(`Telegram: ${escapeTelegramHtml(input.telegram)}`);
  }

  lines.push('', `<pre>${escapeTelegramHtml(input.message)}</pre>`, '');
  lines.push(`${meta.timestamp.toISOString()} · ${escapeTelegramHtml(meta.sourceUrl)}`);

  return lines.join('\n');
}

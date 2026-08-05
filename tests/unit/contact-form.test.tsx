import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ContactForm } from '@/features/contact/ContactForm';
import { ApiRequestError, postJson } from '@/lib/api-client';
import { MIN_FILL_MS } from '@/lib/validation/contact';

vi.mock('@/lib/api-client', () => ({
  postJson: vi.fn(),
  ApiRequestError: class ApiRequestError extends Error {
    constructor(public readonly kind: string) {
      super(kind);
    }
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const postJsonMock = vi.mocked(postJson);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Name/), 'Maxim');
  await user.type(screen.getByLabelText(/Email/), 'someone@example.com');
  await user.type(
    screen.getByLabelText(/Message/),
    'A message that is comfortably past the ten character floor.',
  );
}

describe('ContactForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // The fill-time floor (`MIN_FILL_MS`) is real anti-bot timing, not UI state to poll for, so a
  // genuine wait is the honest way past it — the e2e suite waits the same way.
  async function renderPastFillFloor(onSent: () => void) {
    const user = userEvent.setup();
    render(<ContactForm onSent={onSent} />);
    await new Promise((resolve) => setTimeout(resolve, MIN_FILL_MS + 100));
    return user;
  }

  it('calls onSent and toasts success when the server accepts the submission', async () => {
    postJsonMock.mockResolvedValueOnce({ ok: true });
    const onSent = vi.fn();
    const user = await renderPastFillFloor(onSent);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(onSent).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledTimes(1);
  });

  it('maps server validation errors onto the matching fields', async () => {
    postJsonMock.mockResolvedValueOnce({
      ok: false,
      error: 'validation',
      fields: { email: 'Enter a valid email address.' },
    });
    const onSent = vi.fn();
    const user = await renderPastFillFloor(onSent);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(onSent).not.toHaveBeenCalled();
  });

  it('shows the rate-limit message and does not treat it as a field error', async () => {
    postJsonMock.mockResolvedValueOnce({ ok: false, error: 'rate_limited', retryAfter: 120 });
    const user = await renderPastFillFloor(vi.fn());

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('2 min');
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('shows a delivery error and lets the user retry', async () => {
    postJsonMock.mockResolvedValueOnce({ ok: false, error: 'delivery' });
    const user = await renderPastFillFloor(vi.fn());

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('did not go through');
    expect(screen.getByRole('button', { name: /Send message/ })).toBeEnabled();
  });

  it('shows a network error when the request never reaches the server', async () => {
    postJsonMock.mockRejectedValueOnce(new ApiRequestError('network'));
    const user = await renderPastFillFloor(vi.fn());

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
  });
});

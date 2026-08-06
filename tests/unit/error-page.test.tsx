import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from '@/app/error';

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the error and shows a generic message, never the raw text', () => {
    const error = Object.assign(new Error('leaked internal detail'), { digest: 'abc123' });
    render(<ErrorPage error={error} reset={() => {}} />);

    expect(console.error).toHaveBeenCalledWith(error);
    expect(screen.queryByText('leaked internal detail')).not.toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('calls reset when the retry button is pressed', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledOnce();
  });
});

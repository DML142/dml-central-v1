import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { About } from '@/features/about/About';
import { useLocaleStore } from '@/stores/locale-store';

beforeEach(() => {
  window.localStorage.clear();
  useLocaleStore.setState({ locale: 'en' });
});

describe('LocaleSwitcher', () => {
  it('exposes the three locales in a labelled group', () => {
    render(<LocaleSwitcher />);

    const group = screen.getByRole('group', { name: 'Language' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'UA' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the locale and persists the choice', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'UA' }));

    expect(useLocaleStore.getState().locale).toBe('uk');
    expect(window.localStorage.getItem('dml-central.locale')).toBe('uk');
    expect(screen.getByRole('button', { name: 'UA' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('relabels the group itself in the chosen locale', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(screen.getByRole('group', { name: 'Язык' })).toBeInTheDocument();
  });

  it('survives being clicked repeatedly on the same option', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);
    const uk = screen.getByRole('button', { name: 'UA' });

    await user.click(uk);
    await user.click(uk);
    await user.click(uk);

    expect(useLocaleStore.getState().locale).toBe('uk');
    expect(uk).toHaveAttribute('aria-pressed', 'true');
  });

  it('is reachable and operable by keyboard alone', async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'EN' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'UA' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(useLocaleStore.getState().locale).toBe('uk');
  });
});

describe('translated sections', () => {
  it('re-renders section copy when the locale changes', async () => {
    const user = userEvent.setup();
    render(
      <>
        <LocaleSwitcher />
        <About />
      </>,
    );

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'UA' }));

    expect(screen.getByRole('heading', { name: 'Про мене' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument();
  });

  it('lists the About facts as a definition list', () => {
    const { container } = render(<About />);

    expect(container.querySelectorAll('dt')).toHaveLength(5);
    expect(container.querySelectorAll('dd')).toHaveLength(5);
    expect(screen.getByText('Ukraine · remote')).toBeInTheDocument();
  });
});

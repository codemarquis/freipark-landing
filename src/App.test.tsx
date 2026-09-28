import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WaitlistForm } from './App';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockFetch.mockReset();
});

async function submit(email = 'test@example.com') {
  const user = userEvent.setup();
  render(<WaitlistForm />);
  await user.type(screen.getByPlaceholderText('you@example.com'), email);
  await user.click(screen.getByRole('button', { name: /join the waitlist/i }));
}

describe('WaitlistForm', () => {
  it('shows a success message when the signup POST succeeds (201)', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 201 });
    await submit();
    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
  });

  it('treats a duplicate email (409, unique constraint) as success', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 409 });
    await submit();
    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
  });

  it('shows an error message for any other failed status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await submit();
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('shows an error message when the request itself throws (network failure)', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));
    await submit();
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('POSTs to the waitlist table with the entered email', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 201 });
    await submit('spot@freipark.com');
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toMatch(/\/rest\/v1\/waitlist$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'spot@freipark.com' });
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveFetch: (v: { ok: boolean; status: number }) => void = () => {};
    mockFetch.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
    const user = userEvent.setup();
    render(<WaitlistForm />);
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /join the waitlist/i }));
    expect(screen.getByRole('button', { name: /joining/i })).toBeDisabled();
    resolveFetch({ ok: true, status: 201 });
    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
  });
});

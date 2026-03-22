import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import BlurredProduct from './BlurredProduct';

describe('BlurredProduct', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders full variant with sign-in call to action', () => {
    const { container } = render(
      <MemoryRouter>
        <BlurredProduct index={2} />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link');
    expect(loginLink.getAttribute('href')).toBe('/login');
    expect(screen.getByText('Sign in to view products')).toBeTruthy();
    expect(container.querySelector('.blur-md')).toBeTruthy();
  });

  it('renders compact variant layout', () => {
    const { container } = render(
      <MemoryRouter>
        <BlurredProduct compact index={1} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe('/login');
    expect(screen.queryByText('Sign in to view products')).toBeNull();
    expect(container.querySelector('.blur')).toBeTruthy();
  });
});
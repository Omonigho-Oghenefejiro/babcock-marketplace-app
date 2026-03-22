import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button UI', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a button with selected variant and size and handles click', () => {
    const handleClick = vi.fn();

    render(
      <Button variant="secondary" size="sm" onClick={handleClick}>
        Press
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Press' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toContain('bg-secondary');
    expect(button.className).toContain('h-9');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders child element when asChild is enabled', () => {
    render(
      <Button asChild variant="link">
        <a href="/shop">Go to shop</a>
      </Button>
    );

    const anchor = screen.getByRole('link', { name: 'Go to shop' });
    expect(anchor.tagName).toBe('A');
    expect(anchor.className).toContain('underline-offset-4');
  });

  it('exposes button variant utility for external composition', () => {
    expect(buttonVariants({ variant: 'ghost', size: 'icon' })).toContain('hover:bg-accent');
    expect(buttonVariants({ variant: 'destructive', size: 'lg' })).toContain('h-11');
  });
});
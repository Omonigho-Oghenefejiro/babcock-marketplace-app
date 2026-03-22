import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge, badgeVariants } from './badge';

describe('Badge UI', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default badge styles', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge.className).toContain('bg-primary');
    expect(badge.className).toContain('border-transparent');
  });

  it('applies destructive variant and custom classes', () => {
    render(
      <Badge variant="destructive" className="custom-badge" data-testid="danger-badge">
        Danger
      </Badge>
    );

    const badge = screen.getByTestId('danger-badge');
    expect(badge.className).toContain('bg-destructive');
    expect(badge.className).toContain('custom-badge');
  });

  it('exposes variant utility output', () => {
    expect(badgeVariants({ variant: 'outline' })).toContain('text-foreground');
    expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary');
  });
});
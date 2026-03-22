import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

describe('Avatar UI', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders avatar root and fallback with merged class names', () => {
    render(
      <Avatar data-testid="avatar-root" className="custom-root">
        <AvatarFallback className="custom-fallback">AB</AvatarFallback>
      </Avatar>
    );

    const root = screen.getByTestId('avatar-root');
    expect(root.className).toContain('relative');
    expect(root.className).toContain('custom-root');

    const fallback = screen.getByText('AB');
    expect(fallback.className).toContain('bg-muted');
    expect(fallback.className).toContain('custom-fallback');
  });

  it('supports AvatarImage usage inside Avatar without crashing', () => {
    render(
      <Avatar data-testid="avatar-root-2">
        <AvatarImage alt="Profile image" src="/avatar.png" className="custom-image" />
      </Avatar>
    );

    expect(screen.getByTestId('avatar-root-2')).toBeTruthy();
    expect(screen.queryByAltText('Profile image')).toBeNull();
  });
});
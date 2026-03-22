import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu UI', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders open menu content with inset wrappers', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="menu-content" className="menu-extra-class">
          <DropdownMenuLabel inset data-testid="menu-label">
            Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator data-testid="menu-separator" />
          <DropdownMenuItem inset data-testid="menu-item">
            Profile
          </DropdownMenuItem>
          <DropdownMenuGroup>
            <DropdownMenuItem data-testid="group-item">Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset data-testid="sub-trigger">
              More
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent data-testid="sub-content" className="sub-extra-class">
              <DropdownMenuItem>Advanced</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const content = screen.getByTestId('menu-content');
    expect(content.className).toContain('menu-extra-class');
    expect(content.className).toContain('min-w-[8rem]');

    expect(screen.getByTestId('menu-label').className).toContain('pl-8');
    expect(screen.getByTestId('menu-item').className).toContain('pl-8');
    expect(screen.getByTestId('sub-trigger').className).toContain('pl-8');
    expect(screen.getByTestId('menu-separator').className).toContain('h-px');

    const subContent = screen.getByTestId('sub-content');
    expect(subContent.className).toContain('sub-extra-class');
    expect(screen.getByText('Advanced')).toBeTruthy();
  });

  it('renders non-inset item wrappers when inset is not provided', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel data-testid="plain-label">Label</DropdownMenuLabel>
          <DropdownMenuItem data-testid="plain-item">Item</DropdownMenuItem>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger data-testid="plain-sub-trigger">Sub</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Child</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByTestId('plain-label').className.includes('pl-8')).toBe(false);
    expect(screen.getByTestId('plain-item').className.includes('pl-8')).toBe(false);
    expect(screen.getByTestId('plain-sub-trigger').className.includes('pl-8')).toBe(false);
  });
});
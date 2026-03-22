import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input UI', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with provided type and custom class', () => {
    render(<Input type="email" className="custom-input" placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.className).toContain('h-10');
    expect(input.className).toContain('custom-input');
  });

  it('supports controlled input events and disabled state', () => {
    render(<Input placeholder="Search" disabled={false} />);

    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Laptop' } });
    expect(input.value).toBe('Laptop');

    render(<Input placeholder="Disabled input" disabled />);
    const disabledInput = screen.getByPlaceholderText('Disabled input') as HTMLInputElement;
    expect(disabledInput.disabled).toBe(true);
  });
});
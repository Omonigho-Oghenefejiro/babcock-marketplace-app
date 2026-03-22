import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins truthy class values', () => {
    expect(cn('p-4', false && 'hidden', undefined, 'text-sm')).toBe('p-4 text-sm');
  });

  it('merges tailwind conflicts using last class wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-left', 'text-center')).toBe('text-center');
  });
});
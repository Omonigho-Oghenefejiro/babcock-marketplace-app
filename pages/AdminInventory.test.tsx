import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminInventory from './AdminInventory';

const inventoryMocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  useStore: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: inventoryMocks.apiGet,
    post: inventoryMocks.apiPost,
  },
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => inventoryMocks.useStore(),
}));

describe('AdminInventory page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('returns null for non-admin users', () => {
    inventoryMocks.useStore.mockReturnValue({ user: { role: 'user' } });

    const { container } = render(<AdminInventory />);

    expect(container.innerHTML).toBe('');
    expect(inventoryMocks.apiGet).not.toHaveBeenCalled();
  });

  it('loads inventory and imports csv for admin users', async () => {
    inventoryMocks.useStore.mockReturnValue({ user: { role: 'admin' } });

    inventoryMocks.apiGet
      .mockResolvedValueOnce({
        data: [
          { _id: '1', title: 'Book', category: 'Textbooks', quantity: 7, inStock: true, isActive: true },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          items: [{ _id: '2', title: 'Lamp', category: 'Hostel Essentials', quantity: 2, inStock: true, isActive: true }],
        },
      })
      .mockResolvedValueOnce({
        data: [
          { _id: '1', title: 'Book', category: 'Textbooks', quantity: 10, inStock: true, isActive: true },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          items: [],
        },
      });

    inventoryMocks.apiPost.mockResolvedValueOnce({
      data: { message: 'Inventory import completed' },
    });

    render(<AdminInventory />);

    expect(screen.getByText('Inventory Management')).toBeTruthy();

    expect(await screen.findByText('Book')).toBeTruthy();
    expect(inventoryMocks.apiGet).toHaveBeenCalledWith('/admin/inventory');
    expect(inventoryMocks.apiGet).toHaveBeenCalledWith('/admin/inventory/low-stock?threshold=5');
    expect(screen.getByText('Lamp — 2 left')).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'title,quantity\nDesk,4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));

    expect(await screen.findByText('Inventory import completed')).toBeTruthy();
    expect(inventoryMocks.apiPost).toHaveBeenCalledWith('/admin/inventory/import', { csvData: 'title,quantity\nDesk,4' });
  }, 15000);

  it('uses fallback arrays and default import message when API payload shape varies', async () => {
    inventoryMocks.useStore.mockReturnValue({ user: { role: 'admin' } });

    inventoryMocks.apiGet
      .mockResolvedValueOnce({
        data: [
          { _id: '3', title: 'Fan', category: 'Hostel Essentials', quantity: 0, inStock: false, isActive: true },
        ],
      })
      .mockResolvedValueOnce({ data: { items: null } })
      .mockResolvedValueOnce({ data: { notArray: true } })
      .mockResolvedValueOnce({ data: { items: {} } });

    inventoryMocks.apiPost.mockResolvedValueOnce({ data: {} });

    render(<AdminInventory />);

    expect(await screen.findByText('Fan')).toBeTruthy();
    expect(screen.getByText('No')).toBeTruthy();
    expect(screen.getByText('0 item(s) need restocking.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Import CSV' }));

    expect(await screen.findByText('Inventory imported.')).toBeTruthy();
  });
});
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavBar from './NavBar';

const navMocks = vi.hoisted(() => ({
  useStore: vi.fn(),
  navigate: vi.fn(),
  logout: vi.fn(),
  setSearchQuery: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => navMocks.useStore(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navMocks.navigate,
  };
});

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.useStore.mockReturnValue({
      user: null,
      cart: [{ id: 'c1', title: 'Book', quantity: 2, price: 100, images: [], category: 'Textbooks', stock: 5 }],
      wishlist: [{ id: 'p1' }],
      searchQuery: '',
      setSearchQuery: navMocks.setSearchQuery,
      logout: navMocks.logout,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders guest navigation and updates search query', () => {
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Shop').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sell').length).toBeGreaterThan(0);

    const searchInputs = screen.getAllByPlaceholderText('Search products...');
    fireEvent.change(searchInputs[0], { target: { value: 'laptop' } });

    fireEvent.focus(searchInputs[0]);
    expect((searchInputs[0] as HTMLInputElement).style.background).toBe('rgb(255, 255, 255)');
    expect((searchInputs[0] as HTMLInputElement).style.borderColor).toBe('rgb(45, 106, 79)');

    fireEvent.blur(searchInputs[0]);
    expect((searchInputs[0] as HTMLInputElement).style.background).toBe('rgb(240, 235, 227)');
    expect((searchInputs[0] as HTMLInputElement).style.borderColor).toBe('transparent');

    fireEvent.focus(searchInputs[1]);
    expect((searchInputs[1] as HTMLInputElement).style.background).toBe('rgb(255, 255, 255)');
    expect((searchInputs[1] as HTMLInputElement).style.borderColor).toBe('rgb(45, 106, 79)');

    fireEvent.blur(searchInputs[1]);
    expect((searchInputs[1] as HTMLInputElement).style.background).toBe('rgb(240, 235, 227)');
    expect((searchInputs[1] as HTMLInputElement).style.borderColor).toBe('transparent');

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 32,
    });
    fireEvent.scroll(window);

    const nav = document.querySelector('nav.w-full') as HTMLElement;
    expect(nav.style.backdropFilter).toBe('blur(12px)');

    expect(navMocks.setSearchQuery).toHaveBeenCalledWith('laptop');
  });

  it('covers mobile guest search/menu toggles, overlay close, and drawer auth links', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/shop']}>
        <NavBar />
      </MemoryRouter>
    );

    const mobileIconButtons = container.querySelectorAll(
      'button[class*="p-2.5"][class*="rounded-xl"][class*="hover:bg-green-50"][class*="transition-colors"]'
    );

    const mobileSearchToggle = mobileIconButtons[0] as HTMLButtonElement;
    const mobileMenuToggle = mobileIconButtons[1] as HTMLButtonElement;

    fireEvent.click(mobileSearchToggle);
    const searchInputs = screen.getAllByPlaceholderText('Search products...');
    fireEvent.change(searchInputs[1], { target: { value: 'phone' } });
    expect(navMocks.setSearchQuery).toHaveBeenCalledWith('phone');

    fireEvent.click(mobileMenuToggle);
    const overlay = Array.from(container.querySelectorAll('div')).find((node) => {
      const bg = (node as HTMLDivElement).style.background;
      return bg === 'rgba(0, 0, 0, 0.4)' || bg === 'rgba(0,0,0,0.4)';
    }) as HTMLDivElement;
    fireEvent.click(overlay);

    fireEvent.click(mobileMenuToggle);

    const guestJoinLinks = screen.getAllByRole('link', { name: 'Join Free' });
    const guestSignInLinks = screen.getAllByRole('link', { name: 'Sign In' });

    fireEvent.click(guestJoinLinks[guestJoinLinks.length - 1]);
    fireEvent.click(guestSignInLinks[guestSignInLinks.length - 1]);
  });

  it('shows admin links and signs out authenticated user', () => {
    navMocks.useStore.mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@babcock.edu.ng',
        role: 'admin',
        isVerified: true,
      },
      cart: [],
      wishlist: [],
      searchQuery: '',
      setSearchQuery: navMocks.setSearchQuery,
      logout: navMocks.logout,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Admin/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Sign Out/i })[0]);

    expect(navMocks.logout).toHaveBeenCalled();
    expect(navMocks.navigate).toHaveBeenCalledWith('/');
  });

  it('covers non-admin user menu, outside click close, profile image, and mobile sign out', () => {
    navMocks.useStore.mockReturnValue({
      user: {
        id: 'user-22',
        name: 'Jane Doe',
        email: 'jane@babcock.edu.ng',
        role: 'user',
        isVerified: true,
        profileImage: 'https://example.com/jane.png',
      },
      cart: [{ id: 'c1', title: 'Book', quantity: 1, price: 100, images: [], category: 'Textbooks', stock: 5 }],
      wishlist: [{ id: 'w1' }, { id: 'w2' }],
      searchQuery: '',
      setSearchQuery: navMocks.setSearchQuery,
      logout: navMocks.logout,
    });

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getAllByAltText('Jane Doe').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Jane/i }));
    expect(screen.getByText('My Orders')).toBeTruthy();
    expect(screen.getByText('Purchased Items')).toBeTruthy();
    expect(screen.getByText('Sell an Item')).toBeTruthy();

    fireEvent.click(screen.getByText('My Orders'));

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('My Orders')).toBeNull();

    const signOutButtons = screen.getAllByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButtons[0]);

    expect(navMocks.logout).toHaveBeenCalled();
    expect(navMocks.navigate).toHaveBeenCalledWith('/');
  });

  it('covers mobile user drawer close and link click handlers', () => {
    navMocks.useStore.mockReturnValue({
      user: {
        id: 'user-88',
        name: 'Drawer User',
        email: 'drawer@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      cart: [{ id: 'c9', title: 'Cable', quantity: 0, price: 100, images: [], category: 'Tech', stock: 0 }],
      wishlist: [],
      searchQuery: '',
      setSearchQuery: navMocks.setSearchQuery,
      logout: navMocks.logout,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/shop']}>
        <NavBar />
      </MemoryRouter>
    );

    const mobileIconButtons = container.querySelectorAll(
      'button[class*="p-2.5"][class*="rounded-xl"][class*="hover:bg-green-50"][class*="transition-colors"]'
    );
    const mobileMenuToggle = mobileIconButtons[1] as HTMLButtonElement;

    fireEvent.click(mobileMenuToggle);

    const drawer = container.querySelector('div[style*="max-width: 300px"]') as HTMLDivElement;
    const drawerButtons = drawer.querySelectorAll('button');
    fireEvent.click(drawerButtons[0]);

    fireEvent.click(mobileMenuToggle);

    const mobileNav = drawer.querySelector('nav') as HTMLElement;
    const mobileLinks = mobileNav.querySelectorAll('a');

    fireEvent.click(Array.from(mobileLinks).find((link) => link.textContent === 'Shop') as HTMLElement);
    fireEvent.click(Array.from(mobileLinks).find((link) => link.textContent === 'Wishlist') as HTMLElement);
    fireEvent.click(Array.from(mobileLinks).find((link) => link.textContent === 'Dashboard') as HTMLElement);
  });

  it('falls back to Profile alt text when user name is empty and profile image exists', () => {
    navMocks.useStore.mockReturnValue({
      user: {
        id: 'user-99',
        name: '',
        email: 'profile@babcock.edu.ng',
        role: 'user',
        isVerified: true,
        profileImage: 'https://example.com/profile.png',
      },
      cart: [],
      wishlist: [],
      searchQuery: '',
      setSearchQuery: navMocks.setSearchQuery,
      logout: navMocks.logout,
    });

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <NavBar />
      </MemoryRouter>
    );

    expect(screen.getAllByAltText('Profile').length).toBeGreaterThan(0);
  });
});
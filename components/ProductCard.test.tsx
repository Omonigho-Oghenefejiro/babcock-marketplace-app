import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import ProductCard from './ProductCard';

const productCardMocks = vi.hoisted(() => ({
  useStore: vi.fn(),
  navigate: vi.fn(),
  addToCart: vi.fn(),
  toggleWishlist: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => productCardMocks.useStore(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => productCardMocks.navigate,
  };
});

const baseProduct: Product = {
  id: 'prod-1',
  title: 'Sample Product',
  description: 'A sample description',
  price: 4500,
  category: 'Electronics',
  images: ['https://placehold.co/400x400'],
  seller: {
    id: 'seller-1',
    name: 'Seller One',
    email: 'seller@babcock.edu.ng',
    role: 'seller',
    isVerified: true,
  },
  condition: 'Good',
  inStock: true,
  quantity: 3,
  ratings: 4.2,
  reviews: [],
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productCardMocks.useStore.mockReturnValue({
      user: null,
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('redirects to login when guest tries to add item in compact mode', () => {
    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} compact />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(productCardMocks.navigate).toHaveBeenCalledWith(
      '/login',
      expect.objectContaining({
        state: expect.objectContaining({
          message: 'Sign in to add items to your cart',
        }),
      })
    );
    expect(productCardMocks.addToCart).not.toHaveBeenCalled();
  });

  it('adds product to cart for signed-in users', () => {
    productCardMocks.useStore.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [],
    });

    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} compact />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(productCardMocks.addToCart).toHaveBeenCalledWith(baseProduct);
  });

  it('toggles wishlist in full mode for signed-in users', () => {
    productCardMocks.useStore.mockReturnValue({
      user: {
        id: 'user-2',
        name: 'Buyer',
        email: 'buyer@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [],
    });

    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Add to wishlist'));
    expect(productCardMocks.toggleWishlist).toHaveBeenCalledWith(baseProduct);
  });

  it('redirects guest users to login when toggling wishlist', () => {
    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('Add to wishlist'));

    expect(productCardMocks.navigate).toHaveBeenCalledWith(
      '/login',
      expect.objectContaining({
        state: expect.objectContaining({
          message: 'Sign in to save items to your wishlist',
        }),
      })
    );
    expect(productCardMocks.toggleWishlist).not.toHaveBeenCalled();
  });

  it('shows out-of-stock state and disables add button', () => {
    const outOfStockProduct: Product = {
      ...baseProduct,
      inStock: false,
      quantity: 0,
    };

    render(
      <MemoryRouter>
        <ProductCard product={outOfStockProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('OUT OF STOCK')).toBeTruthy();
    const addButton = screen.getByRole('button', { name: 'Add' }) as HTMLButtonElement;
    expect(addButton.disabled).toBe(true);

    fireEvent.mouseLeave(addButton);
    expect(addButton.style.background).toBe('rgb(229, 231, 235)');
  });

  it('defaults available quantity to 1 when quantity is missing but item is in stock', () => {
    const implicitQtyProduct: Product = {
      ...baseProduct,
      quantity: undefined,
      inStock: true,
    };

    render(
      <MemoryRouter>
        <ProductCard product={implicitQtyProduct} compact />
      </MemoryRouter>
    );

    expect(screen.getByText('1 available')).toBeTruthy();
  });

  it('covers compact fallback image/hover handlers and computed fallbacks', () => {
    const compactFallbackProduct: Product = {
      ...baseProduct,
      images: [],
      condition: 'Refurbished',
      ratings: 'not-a-number' as any,
      quantity: undefined,
      inStock: false,
    };

    render(
      <MemoryRouter>
        <ProductCard product={compactFallbackProduct} compact />
      </MemoryRouter>
    );

    expect(screen.getByText('0 available')).toBeTruthy();

    const compactImage = screen.getByAltText('Sample Product') as HTMLImageElement;
    expect(compactImage.getAttribute('src')).toContain('No+Image');

    const compactCard = compactImage.parentElement?.parentElement as HTMLDivElement;
    fireEvent.mouseEnter(compactCard);
    expect(compactCard.style.transform).toBe('translateY(-2px)');

    fireEvent.mouseLeave(compactCard);
    expect(compactCard.style.transform).toBe('translateY(0)');

    fireEvent.mouseEnter(compactImage);
    expect(compactImage.style.transform).toBe('scale(1.06)');

    fireEvent.mouseLeave(compactImage);
    expect(compactImage.style.transform).toBe('scale(1)');

    fireEvent.error(compactImage);
    expect(compactImage.getAttribute('src')).toContain('No+Image');
  });

  it('does not add to cart for signed-in users when compact item is out of stock', () => {
    productCardMocks.useStore.mockReturnValue({
      user: {
        id: 'user-9',
        name: 'Stock Tester',
        email: 'stock@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [],
    });

    const compactOutOfStock: Product = {
      ...baseProduct,
      inStock: false,
      quantity: 0,
    };

    render(
      <MemoryRouter>
        <ProductCard product={compactOutOfStock} compact />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(productCardMocks.addToCart).not.toHaveBeenCalled();
    expect(productCardMocks.navigate).not.toHaveBeenCalled();
  });

  it('covers wishlisted full-card state, image fallback, and cart-pop branches', () => {
    vi.useFakeTimers();

    productCardMocks.useStore.mockReturnValue({
      user: {
        id: 'user-10',
        name: 'Wishlist User',
        email: 'wish@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [{ id: baseProduct.id }],
    });

    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Remove from wishlist')).toBeTruthy();

    const fullImage = screen.getByAltText('Sample Product') as HTMLImageElement;
    fireEvent.error(fullImage);
    expect(fullImage.getAttribute('src')).toContain('No+Image');

    const title = screen.getByRole('heading', { name: 'Sample Product' }) as HTMLHeadingElement;
    fireEvent.mouseEnter(title);
    expect(title.style.color).toBe('rgb(45, 106, 79)');

    fireEvent.mouseLeave(title);
    expect(title.style.color).toBe('rgb(26, 26, 26)');

    const addButton = screen.getByRole('button', { name: 'Add' }) as HTMLButtonElement;
    fireEvent.mouseEnter(addButton);
    expect(addButton.style.background).toBe('rgb(45, 106, 79)');

    fireEvent.mouseLeave(addButton);
    expect(addButton.style.background).toBe('rgb(27, 67, 50)');

    fireEvent.click(addButton);
    expect(productCardMocks.addToCart).toHaveBeenCalledWith(baseProduct);
    expect(screen.getByRole('button', { name: 'Added ✓' })).toBeTruthy();
  });

  it('shows original price and updates pay button hover styles', () => {
    productCardMocks.useStore.mockReturnValue({
      user: {
        id: 'user-5',
        name: 'Hover Buyer',
        email: 'hover@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      addToCart: productCardMocks.addToCart,
      toggleWishlist: productCardMocks.toggleWishlist,
      wishlist: [],
    });

    const discountedProduct: Product = {
      ...baseProduct,
      originalPrice: 6000,
    };

    render(
      <MemoryRouter>
        <ProductCard product={discountedProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('₦6,000')).toBeTruthy();

    const payNowButton = screen.getByRole('button', { name: /Pay Now/i }) as HTMLButtonElement;

    fireEvent.mouseEnter(payNowButton);
    expect(payNowButton.style.background).toBe('rgb(216, 243, 220)');
    expect(payNowButton.style.color).toBe('rgb(27, 67, 50)');

    fireEvent.mouseLeave(payNowButton);
    expect(payNowButton.style.background).toBe('rgb(240, 250, 242)');
    expect(payNowButton.style.color).toBe('rgb(45, 106, 79)');
  });
});
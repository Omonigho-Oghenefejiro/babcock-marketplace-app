import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Reviews from './Reviews';

const reviewsMocks = vi.hoisted(() => ({
  useStore: vi.fn(),
  addReview: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
  useStore: () => reviewsMocks.useStore(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reviewsMocks.useStore.mockReturnValue({
      user: null,
      reviews: [],
      addReview: reviewsMocks.addReview,
    });
    reviewsMocks.addReview.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state and sign-in prompt when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Reviews productId="prod-1" />
      </MemoryRouter>
    );

    expect(screen.getByText('No reviews yet')).toBeTruthy();
    expect(screen.getByText('Sign in to leave a review')).toBeTruthy();
  });

  it('blocks listing owner from reviewing own product', () => {
    reviewsMocks.useStore.mockReturnValue({
      user: {
        id: 'seller-1',
        name: 'Seller One',
        email: 'seller@babcock.edu.ng',
        role: 'seller',
        isVerified: true,
      },
      reviews: [],
      addReview: reviewsMocks.addReview,
    });

    render(
      <MemoryRouter>
        <Reviews productId="prod-1" sellerId="seller-1" canWriteReview />
      </MemoryRouter>
    );

    expect(screen.getByText(/review your own listing/i)).toBeTruthy();
  });

  it('shows purchase-required message when user cannot write review yet', () => {
    reviewsMocks.useStore.mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Buyer',
        email: 'buyer@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      reviews: [],
      addReview: reviewsMocks.addReview,
    });

    render(
      <MemoryRouter>
        <Reviews productId="prod-1" sellerId="seller-1" canWriteReview={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Purchase required to review')).toBeTruthy();
  });

  it('renders plural review summary and review-list edge branches', () => {
    reviewsMocks.useStore.mockReturnValue({
      user: null,
      reviews: [
        {
          id: 'r10',
          productId: 'prod-1',
          userId: 'u10',
          userName: 'Alpha User',
          rating: 5,
          comment: 'Amazing quality',
          date: '2026-03-06',
        },
        {
          id: 'r11',
          productId: 'prod-1',
          userId: 'u11',
          userName: undefined,
          rating: 3,
          comment: 'Average overall',
          date: '2026-03-07',
        } as any,
      ],
      addReview: reviewsMocks.addReview,
    });

    render(
      <MemoryRouter>
        <Reviews productId="prod-1" />
      </MemoryRouter>
    );

    expect(screen.getByText('2 reviews')).toBeTruthy();
    expect(screen.getByText('Amazing quality')).toBeTruthy();
    expect(screen.getByText('Average overall')).toBeTruthy();
  });

  it('does not submit when comment is only whitespace', () => {
    reviewsMocks.useStore.mockReturnValue({
      user: {
        id: 'user-6',
        name: 'Whitespace User',
        email: 'white@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      reviews: [],
      addReview: reviewsMocks.addReview,
    });

    const { container } = render(
      <MemoryRouter>
        <Reviews productId="prod-1" sellerId="seller-9" canWriteReview />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText('What did you think? Was it as described? Would you recommend it?');
    fireEvent.change(textarea, { target: { value: '   ' } });

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(reviewsMocks.addReview).not.toHaveBeenCalled();
  });

  it('updates star, textarea, and submit button interaction styles', () => {
    reviewsMocks.useStore.mockReturnValue({
      user: {
        id: 'user-7',
        name: 'Interactive User',
        email: 'interactive@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      reviews: [],
      addReview: reviewsMocks.addReview,
    });

    const { container } = render(
      <MemoryRouter>
        <Reviews productId="prod-1" sellerId="seller-8" canWriteReview />
      </MemoryRouter>
    );

    const starButtons = Array.from(container.querySelectorAll('form button[type="button"]')) as HTMLButtonElement[];
    fireEvent.click(starButtons[0]);
    fireEvent.mouseEnter(starButtons[4]);
    expect(starButtons[4].style.transform).toBe('scale(1.15)');

    fireEvent.mouseLeave(starButtons[4]);
    expect(starButtons[4].style.transform).toBe('scale(1)');

    const textarea = screen.getByPlaceholderText('What did you think? Was it as described? Would you recommend it?');
    const textareaWrapper = textarea.parentElement as HTMLDivElement;
    const counterRow = textareaWrapper.querySelector('div') as HTMLDivElement;

    fireEvent.focus(textarea);
    expect(textareaWrapper.style.borderColor).toBe('rgb(45, 106, 79)');

    fireEvent.change(textarea, { target: { value: 'This review is intentionally longer than twenty characters.' } });
    expect(screen.getByText(/chars$/).style.color).toBe('rgb(45, 106, 79)');
    expect(counterRow.style.borderTopColor).toBe('rgb(216, 243, 220)');

    const submitButton = screen.getByRole('button', { name: /Submit Review/i }) as HTMLButtonElement;
    fireEvent.mouseEnter(submitButton);
    expect(submitButton.style.background).toBe('rgb(45, 106, 79)');

    fireEvent.mouseLeave(submitButton);
    expect(submitButton.style.background).toBe('rgb(27, 67, 50)');

    fireEvent.blur(textarea);
    expect(counterRow.style.borderTopColor).toBe('rgb(232, 226, 217)');
  });

  it('submits review when user is eligible', async () => {
    reviewsMocks.useStore.mockReturnValue({
      user: {
        id: 'user-2',
        name: 'Student Buyer',
        email: 'student@babcock.edu.ng',
        role: 'user',
        isVerified: true,
      },
      reviews: [
        {
          id: 'r1',
          productId: 'prod-1',
          userId: 'u1',
          userName: 'Existing User',
          rating: 4,
          comment: 'Nice product',
          date: '2026-03-06',
        },
      ],
      addReview: reviewsMocks.addReview,
    });

    render(
      <MemoryRouter>
        <Reviews productId="prod-1" sellerId="seller-1" canWriteReview />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Submit Review/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('What did you think? Was it as described? Would you recommend it?'), {
      target: { value: 'Great quality and as described.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));

    await waitFor(() => {
      expect(reviewsMocks.addReview).toHaveBeenCalledWith('prod-1', 5, 'Great quality and as described.');
    }, { timeout: 2000 });

    expect(await screen.findByText('✓ Review submitted — thank you!')).toBeTruthy();
  });
});
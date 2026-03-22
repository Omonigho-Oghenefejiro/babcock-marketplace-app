import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders primary footer columns and links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Marketplace')).toBeTruthy();
    expect(screen.getByText('Account')).toBeTruthy();
    expect(screen.getByText('Support')).toBeTruthy();
    expect(screen.getByText('Browse Products')).toBeTruthy();
    expect(screen.getByText('Sell an Item')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('shows social links and current year copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Twitter / X')).toBeTruthy();
    expect(screen.getByLabelText('Instagram')).toBeTruthy();
    expect(screen.getByLabelText('WhatsApp')).toBeTruthy();

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Babcock Campus Marketplace`))).toBeTruthy();
  });

  it('applies hover styles for social and footer links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const twitter = screen.getByLabelText('Twitter / X') as HTMLAnchorElement;
    fireEvent.mouseEnter(twitter);
    expect(twitter.style.background).toBe('rgb(244, 162, 38)');
    expect(twitter.style.color).toBe('rgb(255, 255, 255)');

    fireEvent.mouseLeave(twitter);
    expect(twitter.style.background).toBe('rgba(255, 255, 255, 0.08)');

    const browseProducts = screen.getByRole('link', { name: 'Browse Products' }) as HTMLAnchorElement;
    fireEvent.mouseEnter(browseProducts);
    expect(browseProducts.style.color).toBe('rgb(255, 255, 255)');

    fireEvent.mouseLeave(browseProducts);
    expect(browseProducts.style.color).toBe('rgba(255, 255, 255, 0.55)');

    const faq = screen.getByRole('link', { name: 'FAQ' }) as HTMLAnchorElement;
    fireEvent.mouseEnter(faq);
    expect(faq.style.color).toBe('rgb(255, 255, 255)');

    fireEvent.mouseLeave(faq);
    expect(faq.style.color).toBe('rgba(255, 255, 255, 0.55)');
  });

  it('routes support links to requested destinations', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const faq = screen.getByRole('link', { name: 'FAQ' });
    const privacy = screen.getByRole('link', { name: 'Privacy Policy' });
    const terms = screen.getByRole('link', { name: 'Terms of Service' });
    const contact = screen.getByRole('link', { name: 'Contact Us' });

    expect(faq.getAttribute('href')).toContain('https://youtu.be/dQw4w9WgXcQ?si=CkaKZVjAk7cgOKNL');
    expect(privacy.getAttribute('href')).toContain('https://youtu.be/dQw4w9WgXcQ?si=CkaKZVjAk7cgOKNL');
    expect(terms.getAttribute('href')).toContain('https://youtu.be/dQw4w9WgXcQ?si=CkaKZVjAk7cgOKNL');
    expect(contact.getAttribute('href')).toBe('mailto:meomonighooghenefejiro@gmail.com');

    expect(faq.getAttribute('target')).toBe('_blank');
    expect(faq.getAttribute('rel')).toBe('noreferrer noopener');
    expect(contact.getAttribute('target')).toBeNull();
    expect(contact.getAttribute('rel')).toBeNull();
  });
});
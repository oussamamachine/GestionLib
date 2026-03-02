import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText(/card title/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with default styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('renders title with proper styling', () => {
    render(<Card title="My Title">Content</Card>);
    const title = screen.getByText(/my title/i);
    expect(title).toHaveClass('text-xl', 'font-semibold', 'mb-4');
  });

  it('renders multiple children', () => {
    render(
      <Card>
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </Card>
    );
    expect(screen.getByText(/first paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/second paragraph/i)).toBeInTheDocument();
  });
});

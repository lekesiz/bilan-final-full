import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '../../core/components/ErrorState';

describe('ErrorState', () => {
  it('should render with default message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<ErrorState message="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(<ErrorState description="Error details here" />);
    expect(screen.getByText('Error details here')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render with custom retry text', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} retryText="Try Again" />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
});


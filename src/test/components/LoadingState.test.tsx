import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../../core/components/LoadingState';

describe('LoadingState', () => {
  it('should render with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingState message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingState size="small" />);
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingState size="large" />);
    const spinner = container.querySelector('.ant-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render full screen when fullScreen prop is true', () => {
    const { container } = render(<LoadingState fullScreen />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.minHeight || wrapper.style.height).toContain('100vh');
  });
});


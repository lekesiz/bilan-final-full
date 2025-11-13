import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../../core/components/EmptyState';

describe('EmptyState', () => {
  it('should render with default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display')).toBeInTheDocument();
  });

  it('should render with custom title and description', () => {
    render(
      <EmptyState
        title="No assessments"
        description="Create your first assessment to get started"
      />
    );
    expect(screen.getByText('No assessments')).toBeInTheDocument();
    expect(screen.getByText('Create your first assessment to get started')).toBeInTheDocument();
  });

  it('should render action button when actionLabel and onAction are provided', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        actionLabel="Create Assessment"
        onAction={onAction}
      />
    );
    expect(screen.getByText('Create Assessment')).toBeInTheDocument();
  });

  it('should call onAction when action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState
        actionLabel="Create Assessment"
        onAction={onAction}
      />
    );
    const button = screen.getByText('Create Assessment');
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when actionLabel is not provided', () => {
    render(<EmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});


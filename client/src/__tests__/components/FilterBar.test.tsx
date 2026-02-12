import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterBar from '@/components/FilterBar';

const mockCategories = [
  { id: '1', name: 'Technology', slug: 'tech' },
  { id: '2', name: 'Sports', slug: 'sports' },
];

const mockT = {
  common: { search: 'Search...' },
  events: { allCategories: 'All Categories' },
};

describe('FilterBar Component', () => {
  it('should render search input and category select', () => {
    const onFilterChange = jest.fn();
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        t={mockT}
        categories={mockCategories}
      />
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('should call onFilterChange with debounced search', async () => {
    jest.useFakeTimers();
    const onFilterChange = jest.fn();
    
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        t={mockT}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(onFilterChange).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        search: 'test',
        category: '',
      });
    });

    jest.useRealTimers();
  });

  it('should call onFilterChange when category changes', async () => {
    jest.useFakeTimers();
    const onFilterChange = jest.fn();
    
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        t={mockT}
        categories={mockCategories}
      />
    );

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        search: '',
        category: '1',
      });
    });

    jest.useRealTimers();
  });

  it('should render categories in select', () => {
    const onFilterChange = jest.fn();
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        t={mockT}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Sports')).toBeInTheDocument();
  });

  it('should show clear button when filters are active', () => {
    const onFilterChange = jest.fn();
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        t={mockT}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByTitle('Clear Filters')).toBeInTheDocument();
  });

  it('should clear filters when clear button is clicked', async () => {
    jest.useFakeTimers();
    const onFilterChange = jest.fn();
    const onClear = jest.fn();
    
    render(
      <FilterBar
        onFilterChange={onFilterChange}
        onClear={onClear}
        t={mockT}
        categories={mockCategories}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = screen.getByTitle('Clear Filters');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(onClear).toHaveBeenCalled();

    jest.useRealTimers();
  });
});

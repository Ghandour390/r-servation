import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StatusBadge from '@/components/dashboard/StatusBadge';
import languageReducer from '@/lib/redux/slices/languageSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      language: languageReducer,
    },
  });
};

describe('StatusBadge Component', () => {
  it('should render published status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="PUBLISHED" type="event" />
      </Provider>
    );

    const badge = screen.getByText(/published/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-published');
  });

  it('should render draft status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="DRAFT" type="event" />
      </Provider>
    );

    const badge = screen.getByText(/draft/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-draft');
  });

  it('should render confirmed status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="CONFIRMED" type="reservation" />
      </Provider>
    );

    const badge = screen.getByText(/confirmed/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-confirmed');
  });

  it('should render pending status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="PENDING" type="reservation" />
      </Provider>
    );

    const badge = screen.getByText(/pending/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-pending');
  });

  it('should render canceled status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="CANCELED" type="reservation" />
      </Provider>
    );

    const badge = screen.getByText(/cancelled/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-canceled');
  });

  it('should handle case insensitive status', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <StatusBadge status="confirmed" type="reservation" />
      </Provider>
    );

    const badge = screen.getByText(/confirmed/i);
    expect(badge).toHaveClass('badge-confirmed');
  });
});

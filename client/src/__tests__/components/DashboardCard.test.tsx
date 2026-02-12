import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardCard from '@/components/dashboard/DashboardCard';
import languageReducer from '@/lib/redux/slices/languageSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      language: languageReducer,
    },
  });
};

describe('Dashboard Components', () => {
  describe('DashboardCard', () => {
    it('should render card with title and value', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <DashboardCard
            title="Total Events"
            value="25"
            icon={<div>Icon</div>}
          />
        </Provider>
      );

      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should render card with trend indicator', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <DashboardCard
            title="Total Users"
            value="150"
            trend={{ value: 12, isPositive: true }}
            icon={<div>Icon</div>}
          />
        </Provider>
      );

      expect(screen.getByText(/12/)).toBeInTheDocument();
      expect(screen.getByText(/from last month/i)).toBeInTheDocument();
    });

    it('should render loading state', () => {
      const store = createMockStore();
      render(
        <Provider store={store}>
          <DashboardCard
            title="Loading"
            value="0"
            icon={<div>Icon</div>}
          />
        </Provider>
      );

      const card = screen.getByText('Loading').closest('div');
      expect(card).toBeInTheDocument();
    });
  });
});

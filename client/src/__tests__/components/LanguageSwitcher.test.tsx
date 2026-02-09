import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import languageReducer from '@/lib/redux/slices/languageSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      language: languageReducer,
    },
  });
};

describe('LanguageSwitcher Component', () => {
  it('should render language switcher button', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should open dropdown when clicked', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });

  it('should change language when option is selected', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    const state = store.getState();
    expect(state.language.language).toBe('fr');
  });

  it('should close dropdown after selecting language', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LanguageSwitcher />
      </Provider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const frenchOption = screen.getByText('Français');
    fireEvent.click(frenchOption);

    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });
});

import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTranslation } from '@/hooks/useTranslation';
import languageReducer from '@/lib/redux/slices/languageSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      language: languageReducer,
    },
    preloadedState: initialState,
  });
};

describe('useTranslation Hook', () => {
  it('should return default language (en)', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.direction).toBe('ltr');
    expect(result.current.t).toBeDefined();
  });

  it('should change language to French', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.changeLanguage('fr');
    });

    expect(result.current.language).toBe('fr');
    expect(result.current.direction).toBe('ltr');
  });

  it('should change language to Arabic with RTL direction', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.changeLanguage('ar');
    });

    expect(result.current.language).toBe('ar');
    expect(result.current.direction).toBe('rtl');
  });

  it('should provide translations object', () => {
    const store = createMockStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    expect(result.current.t).toHaveProperty('common');
    expect(result.current.t).toHaveProperty('auth');
  });
});

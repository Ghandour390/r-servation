import authReducer, { setUser, clearUser, loadUser, login } from '@/lib/redux/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';

describe('authSlice', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'PARTICIPANT',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoaded: false,
      loading: false,
      error: null,
    });
  });

  it('should handle setUser', () => {
    const actual = authReducer(
      undefined,
      setUser({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      })
    );

    expect(actual.user).toEqual(mockUser);
    expect(actual.accessToken).toBe(mockTokens.accessToken);
    expect(actual.refreshToken).toBe(mockTokens.refreshToken);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.isLoaded).toBe(true);
  });

  it('should handle clearUser', () => {
    const initialState = {
      user: mockUser,
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken,
      isAuthenticated: true,
      isLoaded: true,
      loading: false,
      error: null,
    };

    const actual = authReducer(initialState, clearUser());

    expect(actual.user).toBeNull();
    expect(actual.accessToken).toBeNull();
    expect(actual.refreshToken).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.isLoaded).toBe(true);
  });

  it('should handle login.pending', () => {
    const actual = authReducer(undefined, { type: login.pending.type });

    expect(actual.loading).toBe(true);
    expect(actual.error).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const payload = {
      user: mockUser,
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken,
    };

    const actual = authReducer(undefined, {
      type: login.fulfilled.type,
      payload,
    });

    expect(actual.user).toEqual(mockUser);
    expect(actual.accessToken).toBe(mockTokens.accessToken);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.loading).toBe(false);
    expect(actual.isLoaded).toBe(true);
  });

  it('should handle login.rejected', () => {
    const errorMessage = 'Login failed';
    const actual = authReducer(undefined, {
      type: login.rejected.type,
      payload: errorMessage,
    });

    expect(actual.loading).toBe(false);
    expect(actual.error).toBe(errorMessage);
  });
});

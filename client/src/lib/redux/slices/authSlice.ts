import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/lib/api/auth';
import Cookies from 'js-cookie';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoaded: boolean;
  loading: boolean;
  error: string | null;
}

// Helper function to safely get initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isLoaded: false,
      loading: false,
      error: null,
    };
  }
  
  try {
    const userStr = Cookies.get('user');
    const token = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    
    if (userStr && token && refreshToken) {
      return {
        user: JSON.parse(userStr),
        accessToken: token,
        refreshToken: refreshToken,
        isAuthenticated: true,
        isLoaded: true,
        loading: false,
        error: null,
      };
    }
  } catch (e) {
    console.error('Error loading auth state:', e);
  }
  
  return {
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isLoaded: true,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  isLoaded: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      
      if (!data.user || !data.access_token) {
        return rejectWithValue('Login failed');
      }
      
      return {
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || '',
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoaded = true;
      if (typeof window !== 'undefined') {
        Cookies.set('user', JSON.stringify(action.payload.user), { expires: 7 });
        Cookies.set('access_token', action.payload.accessToken, { expires: 7 });
        Cookies.set('refresh_token', action.payload.refreshToken, { expires: 7 });
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoaded = true;
      if (typeof window !== 'undefined') {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user');
      }
    },
    loadUser: (state) => {
      if (typeof window === 'undefined') {
        return;
      }
      try {
        const userStr = Cookies.get('user');
        const token = Cookies.get('access_token');
        const refreshToken = Cookies.get('refresh_token');
        
        if (userStr && userStr !== 'undefined' && token && refreshToken) {
          state.user = JSON.parse(userStr);
          state.accessToken = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
        }
        state.isLoaded = true;
      } catch (e) {
        console.error('Error loading user:', e);
        state.isLoaded = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.isLoaded = true;
        state.loading = false;
        if (typeof window !== 'undefined') {
          Cookies.set('user', JSON.stringify(action.payload.user), { expires: 7 });
          Cookies.set('access_token', action.payload.accessToken, { expires: 7 });
          Cookies.set('refresh_token', action.payload.refreshToken, { expires: 7 });
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, loadUser } = authSlice.actions;
export default authSlice.reducer;

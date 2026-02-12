import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const apiBaseUrl =
  typeof window === 'undefined'
    ? process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.URL_BACKEND ||
      'http://localhost:5000'
    : process.env.NEXT_PUBLIC_API_URL ||
      process.env.URL_BACKEND ||
      'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - add token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token: string | undefined;

    if (typeof window !== 'undefined') {
      // Client side
      token = Cookies.get('access_token');
    } else {
      // Server side (Server Actions)
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        token = cookieStore.get('access_token')?.value;
      } catch (error) {
        // Ignore error if not in Next.js server context
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
      if (skipRefreshPaths.some(path => originalRequest.url?.includes(path))) {
        return Promise.reject(error);
      }

      // Skip refresh logic on server side
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined'
          ? Cookies.get('refresh_token')
          : null;

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('access_token')}`,
            },
          }
        );

        const responseData = response.data.data || response.data;
        const { access_token, refresh_token: newRefreshToken } = responseData;

        Cookies.set('access_token', access_token, { expires: 7 });
        Cookies.set('refresh_token', newRefreshToken, { expires: 7 });

        if (responseData.user) {
          Cookies.set('user', JSON.stringify(responseData.user), { expires: 7 });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('auth:refresh', {
                detail: {
                  user: responseData.user,
                  accessToken: access_token,
                  refreshToken: newRefreshToken || refreshToken || '',
                },
              })
            );
          }
        }

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        if (typeof window !== 'undefined') {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('user');
          window.dispatchEvent(new CustomEvent('auth:clear'));
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

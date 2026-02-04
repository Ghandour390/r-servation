"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUser } from "@/lib/redux/slices/authSlice";
import axiosInstance from "@/lib/axios";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('📤 Sending login request...');
      const response = await axiosInstance.post('/auth/login', { email, password });
      console.log('✅ Response received:', response.data);
      
      const data = response.data.data || response.data; // Handle both formats
      const userData = data.user;
      const access_token = data.access_token;
      const refresh_token = data.refresh_token;

      console.log('📦 Extracted data:', {
        hasUser: !!userData,
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        userEmail: userData?.email
      });

      if (userData && access_token && refresh_token) {
        console.log('💾 Storing in localStorage...');
        
        // Store directly in localStorage FIRST before dispatch
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        console.log('✅ Data stored in localStorage');
        
        // Then dispatch to Redux
        dispatch(setUser({
          user: userData,
          accessToken: access_token,
          refreshToken: refresh_token
        }));
        
        console.log('✅ Data stored in Redux');
        console.log('Check localStorage:', {
          token: localStorage.getItem('access_token')?.substring(0, 20),
          refresh: localStorage.getItem('refresh_token')?.substring(0, 20),
          user: localStorage.getItem('user')?.substring(0, 50)
        });
        
        console.log('🔄 Redirecting...');
        // Small delay to ensure storage is complete
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        console.error('❌ Missing data in response');
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('❌ Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary text-center mb-8">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-tertiary border border-primary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-tertiary border border-primary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary"
                >
                  {showPassword ? "👁️" : "👁️🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Continue"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-tertiary">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
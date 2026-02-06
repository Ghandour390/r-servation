"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/lib/redux/hooks";
import { login } from "@/lib/redux/slices/authSlice";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    try {
      console.log('📤 Sending login request...');
      const result = await dispatch(login({ email: email.trim(), password }));

      if (login.fulfilled.match(result)) {
        console.log('🔄 Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        const message = (result.payload as string) || t.auth.errorGeneric;
        setError(message);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || t.auth.errorLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-primary text-center mb-8">
            {t.auth.loginTitle}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                {t.auth.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-tertiary border border-primary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={t.auth.emailPlaceholder}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                {t.auth.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-tertiary border border-primary rounded-lg text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={t.auth.passwordPlaceholder}
                  minLength={8}
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
              {loading ? t.auth.loginLoading : t.auth.loginButton}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-tertiary">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

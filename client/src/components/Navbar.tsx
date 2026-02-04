'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useTheme } from 'next-themes'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { loadUser, clearUser } from '@/lib/redux/slices/authSlice'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

export default function Navbar() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoaded } = useAppSelector((state) => state.auth)
  useEffect(() => {
    dispatch(loadUser())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(clearUser())
    window.location.href = '/login'
  }

  const navigation = [
    { name: t.navbar.home, href: '/' },
    { name: t.navbar.about, href: '/about' },
    { name: t.navbar.events, href: '/events' },
  ]
  console.log('user', user)
  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-sm border-b border-primary z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-primary">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''
                  }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className={`nav-link ${isActive('/dashboard/admin') ? 'active' : ''
                  }`}
              >
                {t.navbar.dashboard}
              </Link>
            )}
            {isAuthenticated && user?.role === 'PARTICIPANT' && (
              <Link
                href="/dashboard/participant"
                className={`nav-link ${isActive('/dashboard/participant') ? 'active' : ''
                  }`}
              >
                {t.navbar.dashboard}
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-tertiary hover:text-secondary transition-colors"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {isLoaded && (
              isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-tertiary" />
                    )}
                    <span className="text-secondary">{user.firstName}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-primary border border-primary rounded-lg shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-secondary hover:bg-secondary"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {t.navbar.profile}
                      </Link>
                      <Link
                        href="/my-events"
                        className="block px-4 py-2 text-secondary hover:bg-secondary"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {t.navbar.myEvents}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-secondary"
                      >
                        {t.navbar.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-outline">
                    {t.navbar.login}
                  </Link>
                  <Link href="/register" className="btn-primary">
                    {t.navbar.register}
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-tertiary hover:text-secondary"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-tertiary hover:text-secondary"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-primary">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${isActive(item.href)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-secondary'
                    : 'text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-secondary'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-primary">
                {isLoaded && (
                  isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2 flex items-center space-x-2">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={user.firstName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-tertiary" />
                        )}
                        <span className="text-secondary font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-base font-medium text-secondary hover:bg-secondary rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {t.navbar.profile}
                      </Link>
                      <Link
                        href="/my-events"
                        className="block px-3 py-2 text-base font-medium text-secondary hover:bg-secondary rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {t.navbar.myEvents}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:bg-secondary rounded-md"
                      >
                        {t.navbar.logout}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-secondary rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {t.navbar.login}
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 mt-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        {t.navbar.register}
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
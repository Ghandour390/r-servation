'use client'

import Link from 'next/link'
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              {t.home.heroTitle}
              <span className="text-indigo-600 dark:text-indigo-400"> {t.home.heroSubtitle}</span>
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto">
              {t.home.heroDescription}
            </p>
            <Link
              href="/events"
              className="btn-primary inline-flex items-center px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {t.home.browseEvents}
              <CalendarDaysIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t.home.featuresTitle}
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              {t.home.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-box">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDaysIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.home.easyBookingTitle}</h3>
              <p className="text-secondary">
                {t.home.easyBookingDesc}
              </p>
            </div>

            <div className="feature-box">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.home.localEventsTitle}</h3>
              <p className="text-secondary">
                {t.home.localEventsDesc}
              </p>
            </div>

            <div className="feature-box">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.home.communityTitle}</h3>
              <p className="text-secondary">
                {t.home.communityDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
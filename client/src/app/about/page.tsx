'use client'

import { CheckCircleIcon, ClockIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 sm:mb-6">
              {t.about.title.split(' ')[0]} <span className="text-indigo-600 dark:text-indigo-400">{t.about.title.split(' ')[1]}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-secondary max-w-3xl mx-auto">
              {t.about.subtitle} {t.about.description}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">
                {t.about.missionTitle}
              </h2>
              <p className="text-lg text-secondary mb-6">
                {t.about.missionDesc1}
              </p>
              <p className="text-lg text-secondary">
                {t.about.missionDesc2}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="text-center p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">10K+</div>
                <div className="text-xs sm:text-sm text-secondary">{t.about.statsEvents}</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">50K+</div>
                <div className="text-xs sm:text-sm text-secondary">{t.about.statsUsers}</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">500+</div>
                <div className="text-xs sm:text-sm text-secondary">{t.about.statsCities}</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99%</div>
                <div className="text-xs sm:text-sm text-secondary">{t.about.statsRate}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t.about.valuesTitle}
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              {t.about.valuesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.about.reliabilityTitle}</h3>
              <p className="text-secondary">
                {t.about.reliabilityDesc}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.about.speedTitle}</h3>
              <p className="text-secondary">
                {t.about.speedDesc}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.about.securityTitle}</h3>
              <p className="text-secondary">
                {t.about.securityDesc}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t.about.passionTitle}</h3>
              <p className="text-secondary">
                {t.about.passionDesc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
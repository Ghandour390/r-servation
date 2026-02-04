'use client'

import Link from 'next/link'
import { DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function UpcomingEvents({ stats }: { stats: DashboardStats }) {
    const { t, language } = useTranslation()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">{t.dashboard.statistics.upcomingEvents}</h3>
                <Link href="/dashboard/admin/events" className="text-sm text-indigo-600 hover:underline">
                    {t.common.viewAll}
                </Link>
            </div>
            <div className="space-y-3">
                {stats.upcomingEvents.length > 0 ? (
                    stats.upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center justify-between py-4 border-b border-primary last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors px-2 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden border border-primary shrink-0">
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                            {event.title[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-primary">{event.title}</p>
                                    <p className="text-xs text-tertiary">{formatDate(event.dateTime)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    {event.remainingPlaces}/{event.maxCapacity}
                                </p>
                                <p className="text-[10px] text-tertiary uppercase tracking-wider">{t.dashboard.statistics.spotsLeft}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-tertiary text-center py-4">{t.dashboard.statistics.noUpcomingEvents}</p>
                )}
            </div>
        </div>
    )
}

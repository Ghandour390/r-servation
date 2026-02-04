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
                            className="flex items-center justify-between py-3 border-b border-primary last:border-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-primary">{event.title}</p>
                                <p className="text-xs text-tertiary">{formatDate(event.dateTime)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-primary">
                                    {event.remainingPlaces}/{event.maxCapacity}
                                </p>
                                <p className="text-xs text-tertiary">{t.dashboard.statistics.spotsLeft}</p>
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

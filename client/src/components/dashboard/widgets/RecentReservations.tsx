'use client'

import Link from 'next/link'
import StatusBadge from '../StatusBadge'
import { DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function RecentReservations({ stats }: { stats: DashboardStats }) {
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
                <h3 className="text-lg font-semibold text-primary">{t.dashboard.statistics.recentReservations}</h3>
                <Link href="/dashboard/admin/reservations" className="text-sm text-indigo-600 hover:underline">
                    {t.common.viewAll}
                </Link>
            </div>
            <div className="space-y-3">
                {stats.recentReservations.length > 0 ? (
                    stats.recentReservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            className="flex items-center justify-between py-4 border-b border-primary last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors px-2 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden border border-primary shrink-0">
                                    {reservation.eventImageUrl ? (
                                        <img
                                            src={reservation.eventImageUrl}
                                            alt={reservation.eventTitle}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {reservation.eventTitle[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-primary">{reservation.userName}</p>
                                    <p className="text-xs text-tertiary">{reservation.eventTitle}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-tertiary mb-1">{formatDate(reservation.createdAt)}</p>
                                <span className={
                                    reservation.status === 'CONFIRMED'
                                        ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                }>
                                    {reservation.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-tertiary text-center py-4">{t.dashboard.statistics.noRecentReservations}</p>
                )}
            </div>
        </div>
    )
}

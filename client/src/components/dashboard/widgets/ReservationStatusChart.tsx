'use client'

import { DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function ReservationStatusChart({ stats }: { stats: DashboardStats }) {
    const { t } = useTranslation()

    return (
        <div className="dashboard-card lg:col-span-2">
            <h3 className="text-lg font-semibold text-primary mb-4">{t.dashboard.statistics.reservationStatistics}</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.confirmedReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">{t.common.status.confirmed}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.pendingReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">{t.common.status.pending}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {stats.cancelledReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">{t.common.status.cancelled}</p>
                </div>
            </div>
        </div>
    )
}

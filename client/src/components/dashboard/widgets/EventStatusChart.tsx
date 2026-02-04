'use client'

import { DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function EventStatusChart({ stats }: { stats: DashboardStats }) {
    const { t } = useTranslation()

    return (
        <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-primary mb-4">{t.dashboard.statistics.eventStatistics}</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-secondary">{t.common.status.published}</span>
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${stats.totalEvents > 0 ? (stats.publishedEvents / stats.totalEvents) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-primary">{stats.publishedEvents}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-secondary">{t.common.status.draft}</span>
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${stats.totalEvents > 0 ? (stats.draftEvents / stats.totalEvents) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-primary">{stats.draftEvents}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-secondary">{t.common.status.cancelled}</span>
                    <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${stats.totalEvents > 0 ? (stats.cancelledEvents / stats.totalEvents) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-primary">{stats.cancelledEvents}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

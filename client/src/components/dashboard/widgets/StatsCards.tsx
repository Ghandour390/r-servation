'use client'

import {
    CalendarDaysIcon,
    TicketIcon,
    UsersIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline'
import DashboardCard from '../DashboardCard'
import { DashboardStats } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function StatsCards({ stats }: { stats: DashboardStats }) {
    const { t } = useTranslation()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
                title={t.dashboard.admin.totalEvents}
                value={stats.totalEvents}
                icon={<CalendarDaysIcon className="h-6 w-6" />}
                description={`${stats.publishedEvents} ${t.dashboard.admin.published}`}
            />
            <DashboardCard
                title={t.dashboard.admin.totalReservations}
                value={stats.totalReservations}
                icon={<TicketIcon className="h-6 w-6" />}
                description={`${stats.confirmedReservations} ${t.dashboard.admin.confirmed}`}
                trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
                title={t.dashboard.admin.pendingReservations}
                value={stats.pendingReservations}
                icon={<ChartBarIcon className="h-6 w-6" />}
                description={t.dashboard.admin.awaiting}
            />
            <DashboardCard
                title={t.dashboard.admin.totalParticipants}
                value={stats.totalUsers}
                icon={<UsersIcon className="h-6 w-6" />}
                description={t.dashboard.admin.unique}
                trend={{ value: 8, isPositive: true }}
            />
        </div>
    )
}

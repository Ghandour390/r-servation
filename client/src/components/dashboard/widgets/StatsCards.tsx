import {
    CalendarDaysIcon,
    TicketIcon,
    UsersIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline'
import DashboardCard from '../DashboardCard'
import { DashboardStats } from '@/lib/actions/admin'

export default function StatsCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
                title="Total Events"
                value={stats.totalEvents}
                icon={<CalendarDaysIcon className="h-6 w-6" />}
                description={`${stats.publishedEvents} published`}
            />
            <DashboardCard
                title="Total Reservations"
                value={stats.totalReservations}
                icon={<TicketIcon className="h-6 w-6" />}
                description={`${stats.confirmedReservations} confirmed`}
                trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
                title="Pending Reservations"
                value={stats.pendingReservations}
                icon={<ChartBarIcon className="h-6 w-6" />}
                description="Awaiting confirmation"
            />
            <DashboardCard
                title="Total Participants"
                value={stats.totalUsers}
                icon={<UsersIcon className="h-6 w-6" />}
                description="Unique participants"
                trend={{ value: 8, isPositive: true }}
            />
        </div>
    )
}

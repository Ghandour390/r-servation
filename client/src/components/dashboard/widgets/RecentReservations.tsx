import Link from 'next/link'
import StatusBadge from '../StatusBadge'
import { DashboardStats } from '@/lib/actions/admin'

export default function RecentReservations({ stats }: { stats: DashboardStats }) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Recent Reservations</h3>
                <Link href="/dashboard/admin/reservations" className="text-sm text-indigo-600 hover:underline">
                    View All
                </Link>
            </div>
            <div className="space-y-3">
                {stats.recentReservations.length > 0 ? (
                    stats.recentReservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            className="flex items-center justify-between py-3 border-b border-primary last:border-0"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        {reservation.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary">{reservation.userName}</p>
                                    <p className="text-xs text-tertiary">{reservation.eventTitle}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <StatusBadge status={reservation.status} />
                                <p className="text-xs text-tertiary mt-1">{formatDate(reservation.createdAt)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-tertiary text-center py-4">No recent reservations</p>
                )}
            </div>
        </div>
    )
}

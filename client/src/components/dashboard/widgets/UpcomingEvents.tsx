import Link from 'next/link'
import { DashboardStats } from '@/lib/actions/admin'

export default function UpcomingEvents({ stats }: { stats: DashboardStats }) {
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
                <h3 className="text-lg font-semibold text-primary">Upcoming Events</h3>
                <Link href="/dashboard/admin/events" className="text-sm text-indigo-600 hover:underline">
                    View All
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
                                <p className="text-xs text-tertiary">spots left</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-tertiary text-center py-4">No upcoming events</p>
                )}
            </div>
        </div>
    )
}

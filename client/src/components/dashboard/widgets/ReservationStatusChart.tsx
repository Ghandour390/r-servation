import { DashboardStats } from '@/lib/actions/admin'

export default function ReservationStatusChart({ stats }: { stats: DashboardStats }) {
    return (
        <div className="dashboard-card lg:col-span-2">
            <h3 className="text-lg font-semibold text-primary mb-4">Reservation Status</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.confirmedReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">Confirmed</p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.pendingReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">Pending</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {stats.cancelledReservations}
                    </p>
                    <p className="text-sm text-secondary mt-1">Cancelled</p>
                </div>
            </div>
        </div>
    )
}

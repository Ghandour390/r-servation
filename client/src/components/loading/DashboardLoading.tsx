'use client'

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="dashboard-card">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-tertiary rounded" />
                                <div className="h-8 w-16 bg-tertiary rounded" />
                            </div>
                            <div className="h-12 w-12 bg-tertiary rounded-full" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="dashboard-card">
                    <div className="h-6 w-40 bg-tertiary rounded mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-primary">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-tertiary rounded-full" />
                                    <div className="space-y-1">
                                        <div className="h-4 w-32 bg-tertiary rounded" />
                                        <div className="h-3 w-24 bg-tertiary rounded" />
                                    </div>
                                </div>
                                <div className="h-6 w-20 bg-tertiary rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="h-6 w-40 bg-tertiary rounded mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-primary">
                                <div className="space-y-1">
                                    <div className="h-4 w-40 bg-tertiary rounded" />
                                    <div className="h-3 w-24 bg-tertiary rounded" />
                                </div>
                                <div className="h-4 w-16 bg-tertiary rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

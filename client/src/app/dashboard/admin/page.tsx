'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { getStatisticsAction, DashboardStats } from '@/lib/actions/admin'

// Lazy load widgets
const StatsCards = lazy(() => import('@/components/dashboard/widgets/StatsCards'))
const EventStatusChart = lazy(() => import('@/components/dashboard/widgets/EventStatusChart'))
const ReservationStatusChart = lazy(() => import('@/components/dashboard/widgets/ReservationStatusChart'))
const RecentReservations = lazy(() => import('@/components/dashboard/widgets/RecentReservations'))
const UpcomingEvents = lazy(() => import('@/components/dashboard/widgets/UpcomingEvents'))

// Skeleton loaders for widgets
const WidgetSkeleton = () => (
    <div className="dashboard-card animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
    </div>
)

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await getStatisticsAction()
                if (result.success && result.data) {
                    setStats(result.data)
                } else {
                    setError(result.error || 'Failed to load statistics')
                }
            } catch (err) {
                setError('Failed to load statistics')
                console.error('Error fetching stats:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return <DashboardLoading />
    }

    if (error || !stats) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 btn-primary"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
                <p className="text-secondary">Welcome back! Here's what's happening with your events.</p>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><WidgetSkeleton /><WidgetSkeleton /><WidgetSkeleton /><WidgetSkeleton /></div>}>
                <StatsCards stats={stats} />
            </Suspense>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Suspense fallback={<WidgetSkeleton />}>
                    <EventStatusChart stats={stats} />
                </Suspense>

                <Suspense fallback={<WidgetSkeleton />}>
                    <ReservationStatusChart stats={stats} />
                </Suspense>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<WidgetSkeleton />}>
                    <RecentReservations stats={stats} />
                </Suspense>

                <Suspense fallback={<WidgetSkeleton />}>
                    <UpcomingEvents stats={stats} />
                </Suspense>
            </div>
        </div>
    )
}


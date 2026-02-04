'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/dashboard/Sidebar'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { loadUser } from '@/lib/redux/slices/authSlice'

export default function ParticipantDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { user, isAuthenticated, isLoaded } = useAppSelector((state) => state.auth)

    useEffect(() => {
        dispatch(loadUser())
    }, [dispatch])

    useEffect(() => {
        if (isLoaded) {
            if (!isAuthenticated) {
                router.push('/login')
            } else if (user?.role === 'ADMIN') {
                // Admins can also access participant dashboard, but redirect to admin if they came directly
                // Uncomment below to force redirect admins:
                // router.push('/dashboard/admin')
            }
        }
    }, [isLoaded, isAuthenticated, user, router])

    // Show loading while checking auth
    if (!isLoaded || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary pt-16">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    role="PARTICIPANT"
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)]">
                    {/* Mobile header */}
                    <div className="lg:hidden flex items-center justify-between p-4 bg-primary border-b border-primary">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-tertiary hover:text-secondary"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-primary">My Dashboard</h1>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>

                    {/* Page content */}
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

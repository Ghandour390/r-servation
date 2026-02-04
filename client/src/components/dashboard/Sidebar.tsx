'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    CalendarDaysIcon,
    TicketIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
    Cog6ToothIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
    role: 'ADMIN' | 'PARTICIPANT'
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname()

    const adminLinks = [
        { name: 'Overview', href: '/dashboard/admin', icon: HomeIcon },
        { name: 'Events', href: '/dashboard/admin/events', icon: CalendarDaysIcon },
        { name: 'Reservations', href: '/dashboard/admin/reservations', icon: TicketIcon },
        { name: 'Statistics', href: '/dashboard/admin/statistics', icon: ChartBarIcon },
        { name: 'Export Data', href: '/dashboard/admin/export', icon: ArrowDownTrayIcon },
    ]

    const participantLinks = [
        { name: 'Overview', href: '/dashboard/participant', icon: HomeIcon },
        { name: 'My Reservations', href: '/dashboard/participant/reservations', icon: TicketIcon },
        { name: 'Browse Events', href: '/events', icon: CalendarDaysIcon },
    ]

    const links = role === 'ADMIN' ? adminLinks : participantLinks
    const dashboardTitle = role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'

    const isActive = (href: string) => {
        if (href === '/dashboard/admin' || href === '/dashboard/participant') {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        sidebar fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-primary">
                    <h2 className="text-lg font-bold text-primary">{dashboardTitle}</h2>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-tertiary hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon
                        const active = isActive(link.href)

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={onClose}
                                className={`
                  sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${active
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-secondary hover:bg-secondary hover:text-primary'
                                    }
                `}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 px-4 py-3 text-secondary hover:text-primary rounded-lg hover:bg-secondary transition-colors"
                    >
                        <HomeIcon className="h-5 w-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

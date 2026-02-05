'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    HomeIcon,
    CalendarDaysIcon,
    TicketIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    UserGroupIcon,
    TagIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

interface SidebarProps {
    role: 'ADMIN' | 'PARTICIPANT'
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { t } = useTranslation()

    const adminLinks = [
        { name: t.sidebar.dashboard, href: '/dashboard/admin', icon: HomeIcon },
        { name: t.sidebar.events, href: '/dashboard/admin/events', icon: CalendarDaysIcon },
        { name: t.sidebar.reservations, href: '/dashboard/admin/reservations', icon: TicketIcon },
        { name: t.sidebar.categories, href: '/dashboard/admin/categories', icon: TagIcon },
        { name: t.sidebar.users, href: '/dashboard/admin/users', icon: UserGroupIcon },
        { name: t.sidebar.statistics, href: '/dashboard/admin/statistics', icon: ChartBarIcon },
        { name: t.sidebar.export, href: '/dashboard/admin/export', icon: ArrowDownTrayIcon },
    ]

    const participantLinks = [
        { name: t.sidebar.dashboard, href: '/dashboard/participant', icon: HomeIcon },
        { name: t.sidebar.reservations, href: '/dashboard/participant/reservations', icon: TicketIcon },
        { name: t.sidebar.events, href: '/sidebar/events', icon: CalendarDaysIcon }, // Note: Need to check if 'Browse Events' maps to 'events' or new key
    ]
    // Fix for participant "Browse Events" -> let's map it to t.sidebar.events for now or add "browseEvents" key if needed.
    // Based on dictionary, we have 'events'. Let's use 'events' for simplicity or stick to hardcoded if distinct.
    // Let's assume 'Events' is close enough or use a new key?
    // In dictionary: events: "Events", "Événements", "الفعاليات"
    // Original was "Browse Events". Let's stick strictly to dictionary or simple match.
    // Let's use `t.sidebar.events` for "Browse Events" contextually or update dictionary later. 
    // Actually, looking at dictionary, I don't have "browseEvents". I'll use `t.sidebar.events` and maybe update dictionary later if user wants specific text.

    // Updating participantLinks with correct keys
    const participantLinksRefined = [
        { name: t.sidebar.dashboard, href: '/dashboard/participant', icon: HomeIcon },
        { name: t.sidebar.reservations, href: '/dashboard/participant/reservations', icon: TicketIcon },
        { name: t.sidebar.events, href: '/events', icon: CalendarDaysIcon },
    ]

    const navigation = role === 'ADMIN' ? adminLinks : participantLinksRefined
    const commonNavigation = [
        { name: t.navbar.profile, href: '/dashboard/profile', icon: UserCircleIcon },
    ]

    const fullNavigation = [...navigation, ...commonNavigation]
    const dashboardTitleTranslated = t.sidebar.dashboard

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
                    <h2 className="text-lg font-bold text-primary">{dashboardTitleTranslated}</h2>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-tertiary hover:text-secondary"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {fullNavigation.map((link) => {
                        const Icon = link.icon
                        const active = isActive(link.href)

                        return (
                            <Link
                                key={link.href}
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
                        <span className="font-medium">{t.sidebar.backToHome}</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

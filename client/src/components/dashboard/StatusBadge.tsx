'use client'

import { useTranslation } from '@/hooks/useTranslation'

interface StatusBadgeProps {
    status: string
    type?: 'event' | 'reservation'
}

export default function StatusBadge({ status, type = 'reservation' }: StatusBadgeProps) {
    const { t } = useTranslation()

    const getStatusClasses = () => {
        const normalizedStatus = status.toUpperCase()

        switch (normalizedStatus) {
            case 'PUBLISHED':
                return 'badge-published'
            case 'DRAFT':
                return 'badge-draft'
            case 'CONFIRMED':
                return 'badge-confirmed'
            case 'PENDING':
                return 'badge-pending'
            case 'CANCELED':
            case 'CANCELLED':
                return 'badge-canceled'
            case 'REFUSED':
                return 'badge-canceled'
            default:
                return 'badge-draft'
        }
    }

    const getStatusLabel = () => {
        const normalizedStatus = status.toUpperCase()

        switch (normalizedStatus) {
            case 'PUBLISHED':
                return t.common.status.published
            case 'DRAFT':
                return t.common.status.draft
            case 'CONFIRMED':
                return t.common.status.confirmed
            case 'PENDING':
                return t.common.status.pending
            case 'CANCELED':
            case 'CANCELLED':
                return t.common.status.cancelled
            case 'REFUSED':
                return t.common.status.refused
            default:
                return status
        }
    }

    return (
        <span className={getStatusClasses()}>
            {getStatusLabel()}
        </span>
    )
}

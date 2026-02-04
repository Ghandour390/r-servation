'use client'

interface StatusBadgeProps {
    status: string
    type?: 'event' | 'reservation'
}

export default function StatusBadge({ status, type = 'reservation' }: StatusBadgeProps) {
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
            case 'CANCELED':
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
                return 'Published'
            case 'DRAFT':
                return 'Draft'
            case 'CONFIRMED':
                return 'Confirmed'
            case 'PENDING':
                return 'Pending'
            case 'CANCELED':
            case 'CANCELED':
                return 'Cancelled'
            case 'REFUSED':
                return 'Refused'
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

'use client'

import { ReactNode } from 'react'

interface DashboardCardProps {
    title: string
    value: string | number
    icon: ReactNode
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
}

export default function DashboardCard({
    title,
    value,
    icon,
    description,
    trend,
    className = '',
}: DashboardCardProps) {
    return (
        <div className={`dashboard-card ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-tertiary">{title}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{value}</p>
                    {description && (
                        <p className="text-xs text-tertiary mt-1">{description}</p>
                    )}
                    {trend && (
                        <p className={`text-xs mt-1 flex items-center ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                            <span className="mr-1">
                                {trend.isPositive ? '↑' : '↓'}
                            </span>
                            {trend.value}% from last month
                        </p>
                    )}
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface Column<T> {
    key: keyof T | string
    header: string
    render?: (item: T) => React.ReactNode
    sortable?: boolean
}

interface DataTableResponsiveProps<T> {
    columns: Column<T>[]
    data: T[]
    keyField: keyof T
    pageSize?: number
    onRowClick?: (item: T) => void
    emptyMessage?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTableResponsive<T extends Record<string, any>>({
    columns,
    data,
    keyField,
    pageSize = 10,
    onRowClick,
    emptyMessage = 'No data available',
}: DataTableResponsiveProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0
        const aValue = a[sortColumn as keyof T]
        const bValue = b[sortColumn as keyof T]
        if (aValue === bValue) return 0
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        const comparison = aValue < bValue ? -1 : 1
        return sortDirection === 'asc' ? comparison : -comparison
    })

    const totalPages = Math.ceil(sortedData.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(columnKey)
            setSortDirection('asc')
        }
    }

    const getValue = (item: T, key: string): unknown => {
        const keys = key.split('.')
        let value: unknown = item
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k]
            } else {
                return undefined
            }
        }
        return value
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-tertiary">
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary">
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-tertiary uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:text-secondary' : ''}`}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.header}</span>
                                        {column.sortable && sortColumn === String(column.key) && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary">
                        {paginatedData.map((item) => (
                            <tr
                                key={String(item[keyField])}
                                className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className="px-4 py-4 text-sm text-secondary whitespace-nowrap"
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String(getValue(item, String(column.key)) ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {paginatedData.map((item) => (
                    <div
                        key={String(item[keyField])}
                        className={`dashboard-card p-4 ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => onRowClick?.(item)}
                    >
                        {columns.map((column) => (
                            <div key={String(column.key)} className="flex justify-between items-start py-2 border-b border-primary last:border-b-0">
                                <span className="text-xs font-semibold text-tertiary uppercase">{column.header}</span>
                                <span className="text-sm text-secondary text-right ml-4">
                                    {column.render
                                        ? column.render(item)
                                        : String(getValue(item, String(column.key)) ?? '')}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-primary mt-4">
                    <div className="text-sm text-tertiary text-center sm:text-left">
                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, data.length)} of {data.length} results
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-tertiary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>

                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${currentPage === pageNum
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-tertiary hover:text-secondary hover:bg-secondary'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-tertiary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

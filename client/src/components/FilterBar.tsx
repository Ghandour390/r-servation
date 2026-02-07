'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Category } from '@/lib/actions/categories'

interface FilterBarProps {
    onFilterChange: (filters: { search: string; category: string }) => void
    placeholder?: string
    t: any // Translation object
    categories?: Category[]
    extra?: ReactNode
    extraActive?: boolean
    onClear?: () => void
}

export default function FilterBar({ onFilterChange, placeholder, t, categories = [], extra, extraActive = false, onClear }: FilterBarProps) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search, category })
        }, 500)

        return () => clearTimeout(timer)
    }, [search, category])

    const handleClear = () => {
        setSearch('')
        setCategory('')
        onClear?.()
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-tertiary" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder || t.common?.search || 'Search...'}
                    className="block w-full pl-10 pr-3 py-2.5 bg-primary border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-primary"
                />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-tertiary" />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-primary border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-primary appearance-none"
                >
                    <option value="">{t.events?.allCategories || 'All Categories'}</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {extra}

            {/* Clear Button */}
            {(search || category || extraActive) && (
                <button
                    onClick={handleClear}
                    className="flex items-center justify-center p-2.5 text-tertiary hover:text-red-500 transition-colors"
                    title="Clear Filters"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            )}
        </div>
    )
}

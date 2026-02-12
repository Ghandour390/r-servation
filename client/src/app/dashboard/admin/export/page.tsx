'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { exportEventsAction, exportReservationsAction } from '@/lib/actions/admin'
import { useTranslation } from '@/hooks/useTranslation'

export default function ExportDataPage() {
    const [exporting, setExporting] = useState<'events' | 'reservations' | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { t } = useTranslation()

    const handleExport = async (type: 'events' | 'reservations') => {
        setExporting(type)
        setSuccess(null)
        setError(null)

        try {
            const action = type === 'events' ? exportEventsAction : exportReservationsAction
            const result = await action()

            if (result.success && result.data) {
                // Create a blob and download
                const blob = new Blob([result.data], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                setSuccess(`${type === 'events' ? t.export.eventsData : t.export.reservationsData} ${t.export.success}`)
            } else {
                setError(`${t.export.error} ${type}`)
            }
        } catch (err) {
            setError(`${t.export.error} ${type}`)
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-primary">{t.export.title}</h1>
                <p className="text-secondary">{t.export.description}</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Events */}
                <div className="dashboard-card">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary">{t.export.eventsData}</h3>
                            <p className="text-sm text-tertiary">{t.export.eventsDesc}</p>
                        </div>
                    </div>
                    <p className="text-sm text-secondary mb-4">
                        {t.export.eventsNote}
                    </p>
                    <button
                        onClick={() => handleExport('events')}
                        disabled={exporting !== null}
                        className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {exporting === 'events' ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.export.exporting}
                            </span>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>{t.export.exportEvents}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Export Reservations */}
                <div className="dashboard-card">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <DocumentTextIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary">{t.export.reservationsData}</h3>
                            <p className="text-sm text-tertiary">{t.export.reservationsDesc}</p>
                        </div>
                    </div>
                    <p className="text-sm text-secondary mb-4">
                        {t.export.reservationsNote}
                    </p>
                    <button
                        onClick={() => handleExport('reservations')}
                        disabled={exporting !== null}
                        className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {exporting === 'reservations' ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.export.exporting}
                            </span>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                <span>{t.export.exportReservations}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="dashboard-card !bg-blue-50 dark:!bg-blue-900/20 !border-blue-200 dark:!border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📊 {t.export.formatInfo}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t.export.formatDesc}
                </p>
            </div>
        </div>
    )
}

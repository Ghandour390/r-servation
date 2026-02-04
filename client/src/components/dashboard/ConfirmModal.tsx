'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null

    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                }
            case 'warning':
                return {
                    icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                    button: 'bg-amber-600 hover:bg-amber-700 text-white',
                }
            case 'info':
                return {
                    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white',
                }
            default:
                return {
                    icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                }
        }
    }

    const variantClasses = getVariantClasses()

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-primary rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-tertiary hover:text-secondary transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-full ${variantClasses.icon}`}>
                            <ExclamationTriangleIcon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-primary">{title}</h3>
                            <p className="mt-2 text-sm text-secondary">{message}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-secondary bg-secondary hover:bg-tertiary rounded-lg transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${variantClasses.button}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

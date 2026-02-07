'use client'

import { useState, useEffect, useRef } from 'react'
import { getProfileAction, updateProfileAction, uploadAvatarAction, User, UpdateProfileData } from '@/lib/actions/users'
import { useTranslation } from '@/hooks/useTranslation'
import { UserCircleIcon, EnvelopeIcon, UserIcon, ShieldCheckIcon, CalendarIcon, CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setUser as setAuthUser } from '@/lib/redux/slices/authSlice'

export default function DashboardProfilePage() {
    const dispatch = useAppDispatch()
    const { accessToken, refreshToken } = useAppSelector((state) => state.auth)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<UpdateProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    })
    const { t } = useTranslation()

    const syncAuthUser = (updatedUser: User) => {
        if (!accessToken || !refreshToken) return
        dispatch(setAuthUser({
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl ?? null,
            },
            accessToken,
            refreshToken,
        }))
    }

    const fetchProfile = async () => {
        try {
            const result = await getProfileAction()
            if (result.success && result.data) {
                setUser(result.data)
                syncAuthUser(result.data)
                setFormData({
                    firstName: result.data.firstName,
                    lastName: result.data.lastName,
                    email: result.data.email,
                    password: '', // Ensure password is never undefined to avoid controlled/uncontrolled warning
                })
            } else {
                setError(result.error || t.profile.errors.loadProfile)
            }
        } catch (err) {
            setError(t.profile.errors.loadProfile)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)
        setSuccess(null)

        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            const result = await uploadAvatarAction(uploadData)
            if (result.success && result.data) {
                setUser(result.data)
                syncAuthUser(result.data)
                setSuccess(t.profile.avatarUpdated)
            } else {
                setError(result.error || t.profile.errors.uploadAvatar)
            }
        } catch (err) {
            setError(t.profile.errors.uploadAvatar)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedFirstName = formData.firstName?.trim() || ''
        const trimmedLastName = formData.lastName?.trim() || ''
        const trimmedEmail = formData.email?.trim() || ''
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (trimmedFirstName.length < 2) {
            setError(t.profile.errors.firstName)
            return
        }
        if (trimmedLastName.length < 2) {
            setError(t.profile.errors.lastName)
            return
        }
        if (!emailRegex.test(trimmedEmail)) {
            setError(t.profile.errors.email)
            return
        }
        if (formData.password && formData.password.length < 8) {
            setError(t.profile.errors.password)
            return
        }

        setUpdating(true)
        setError(null)
        setSuccess(null)

        try {
            const dataToUpdate = {
                ...formData,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                email: trimmedEmail,
            }
            if (!dataToUpdate.password) delete dataToUpdate.password

            const result = await updateProfileAction(dataToUpdate)
            if (result.success && result.data) {
                setUser(result.data)
                syncAuthUser(result.data)
                setSuccess(t.profile.profileUpdated)
                setFormData(prev => ({ ...prev, password: '' }))
            } else {
                setError(result.error || t.profile.errors.updateProfile)
            }
        } catch (err) {
            setError(t.profile.errors.updateProfile)
        } finally {
            setUpdating(false)
        }
    }

    if (loading) return <DashboardLoading />

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary">{t.profile.title}</h1>
                    <p className="text-secondary">{t.profile.subtitle}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="dashboard-card p-8 text-center">
                        <div className="relative inline-block group">
                            <div
                                className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-xl cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserCircleIcon className="h-full w-full text-tertiary" />
                                )}

                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <h2 className="text-xl font-bold text-primary mt-4">
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <p className="text-secondary flex items-center justify-center gap-2 mt-1">
                            <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                            {user?.role}
                        </p>
                        <div className="mt-6 pt-6 border-t border-primary text-sm text-tertiary flex items-center justify-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            {t.profile.joined} {new Date(user?.createdAt || '').toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="dashboard-card p-6">
                        <h3 className="text-lg font-bold text-primary mb-6">{t.profile.detailsTitle}</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">{t.profile.firstName}</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tertiary" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-primary"
                                            minLength={2}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">{t.profile.lastName}</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tertiary" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-primary"
                                            minLength={2}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">{t.profile.email}</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tertiary" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-2">{t.profile.newPassword}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none text-primary"
                                    minLength={8}
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    {updating ? t.profile.updating : t.profile.update}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}


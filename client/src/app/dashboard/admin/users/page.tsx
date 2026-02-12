'use client'

import { useState, useEffect } from 'react'
import { TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import DataTable from '@/components/dashboard/DataTable'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { getUsersAction, deleteUserAction, updateUserAction, User } from '@/lib/actions/users'
import { useTranslation } from '@/hooks/useTranslation'
import { PencilIcon, UserIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
        isOpen: false,
        user: null,
    })
    const [editModal, setEditModal] = useState<{ isOpen: boolean; user: User | null }>({
        isOpen: false,
        user: null,
    })
    const [actionLoading, setActionLoading] = useState(false)
    const [editData, setEditData] = useState({ firstName: '', lastName: '', email: '', role: '' })
    const { t } = useTranslation()

    const fetchUsers = async () => {
        try {
            const result = await getUsersAction()
            if (result.success && result.data) {
                setUsers(result.data)
            } else {
                setError(result.error || 'Failed to load users')
            }
        } catch (err) {
            setError('Failed to load users')
            console.error('Error fetching users:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleDelete = async () => {
        if (!deleteModal.user) return

        setActionLoading(true)
        try {
            const result = await deleteUserAction(deleteModal.user.id)
            if (result.success) {
                setUsers(users.filter((u) => u.id !== deleteModal.user?.id))
                setDeleteModal({ isOpen: false, user: null })
            } else {
                alert(result.error || 'Failed to delete user')
            }
        } catch (err) {
            alert('Failed to delete user')
        } finally {
            setActionLoading(false)
        }
    }

    const handleEditClick = (user: User) => {
        setEditModal({ isOpen: true, user })
        setEditData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        })
    }

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editModal.user) return

        setActionLoading(true)
        try {
            const result = await updateUserAction(editModal.user.id, editData as any)
            if (result.success && result.data) {
                setUsers(users.map(u => u.id === editModal.user?.id ? result.data! : u))
                setEditModal({ isOpen: false, user: null })
            } else {
                alert(result.error || 'Failed to update user')
            }
        } catch (err) {
            alert('Failed to update user')
        } finally {
            setActionLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    )

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (user: User) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.firstName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user.firstName[0].toUpperCase()
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-primary">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-secondary">{user.role}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            header: 'Email',
            render: (user: User) => <span className="text-secondary">{user.email}</span>
        },
        {
            key: 'createdAt',
            header: 'Joined',
            render: (user: User) => (
                <span className="text-tertiary">
                    {new Date(user.createdAt).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (user: User) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-tertiary hover:text-indigo-600 transition-colors"
                        title="Edit User"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    {user.role !== 'ADMIN' && (
                        <button
                            onClick={() => setDeleteModal({ isOpen: true, user })}
                            className="p-2 text-tertiary hover:text-red-600 transition-colors"
                            title="Delete User"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )
        }
    ]

    if (loading) return <DashboardLoading />

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">User Management</h1>
                <p className="text-secondary">View and manage platform users</p>
            </div>

            <div className="dashboard-card p-4">
                <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-primary text-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    keyField="id"
                    pageSize={10}
                    emptyMessage="No users found."
                />
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, user: null })}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteModal.user?.firstName} ${deleteModal.user?.lastName}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={actionLoading}
            />

            {/* Edit User Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-primary w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-primary flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-bold text-primary">Edit User</h3>
                            <button onClick={() => setEditModal({ isOpen: false, user: null })} className="text-tertiary hover:text-secondary">
                                <span className="sr-only">Close</span>
                                <TrashIcon className="h-5 w-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={editData.firstName}
                                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border border-primary rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-primary text-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editData.lastName}
                                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border border-primary rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-primary text-primary"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-primary rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-primary text-primary"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Role</label>
                                <select
                                    value={editData.role}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-primary rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-primary text-primary appearance-none"
                                >
                                    <option value="PARTICIPANT">PARTICIPANT</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
                                <button
                                    type="button"
                                    onClick={() => setEditModal({ isOpen: false, user: null })}
                                    className="px-4 py-2 text-secondary hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    {actionLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

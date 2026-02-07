'use client'

import { useEffect, useState } from 'react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import DataTable from '@/components/dashboard/DataTable'
import ConfirmModal from '@/components/dashboard/ConfirmModal'
import DashboardLoading from '@/components/loading/DashboardLoading'
import { useTranslation } from '@/hooks/useTranslation'
import {
  Category,
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction
} from '@/lib/actions/categories'

export default function AdminCategoriesPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [createError, setCreateError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null,
  })

  const fetchCategories = async () => {
    try {
      const result = await getCategoriesAction()
      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        setError(result.error || t.common.error)
      }
    } catch (err) {
      setError(t.common.error)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const description = formData.description.trim()
    if (name.length < 2) {
      setCreateError('Category name must be at least 2 characters.')
      return
    }
    if (description.length < 5) {
      setCreateError('Category description must be at least 5 characters.')
      return
    }
    setCreateError(null)
    setActionLoading(true)
    try {
      const result = await createCategoryAction({ name, description })
      if (result.success && result.data) {
        setCategories((prev) => [...prev, result.data!])
        setFormData({ name: '', description: '' })
      } else {
        alert(result.error || t.common.error)
      }
    } catch (err) {
      alert(t.common.error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!editModal.category) return
    const name = editModal.category.name.trim()
    const description = editModal.category.description.trim()
    if (name.length < 2) {
      setEditError('Category name must be at least 2 characters.')
      return
    }
    if (description.length < 5) {
      setEditError('Category description must be at least 5 characters.')
      return
    }
    setEditError(null)
    setActionLoading(true)
    try {
      const result = await updateCategoryAction(editModal.category.id, {
        name,
        description,
      })
      if (result.success && result.data) {
        setCategories((prev) => prev.map((c) => (c.id === result.data!.id ? result.data! : c)))
        setEditModal({ isOpen: false, category: null })
      } else {
        alert(result.error || t.common.error)
      }
    } catch (err) {
      alert(t.common.error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.category) return
    setActionLoading(true)
    try {
      const result = await deleteCategoryAction(deleteModal.category.id)
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deleteModal.category?.id))
        setDeleteModal({ isOpen: false, category: null })
      } else {
        alert(result.error || t.common.error)
      }
    } catch (err) {
      alert(t.common.error)
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t.categories?.name || 'Name',
      render: (category: Category) => (
        <span className="font-medium text-primary">{category.name}</span>
      ),
    },
    {
      key: 'description',
      header: t.categories?.description || 'Description',
      render: (category: Category) => (
        <span className="text-secondary">{category.description}</span>
      ),
    },
    {
      key: 'actions',
      header: t.common?.actions || 'Actions',
      render: (category: Category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditModal({ isOpen: true, category: { ...category } })}
            className="p-2 text-tertiary hover:text-indigo-600 transition-colors"
            title={t.common?.edit || 'Edit'}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, category })}
            className="p-2 text-tertiary hover:text-red-600 transition-colors"
            title={t.common?.delete || 'Delete'}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <DashboardLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{t.categories?.title || 'Categories'}</h1>
        <p className="text-secondary">{t.categories?.subtitle || 'Manage event categories'}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="dashboard-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">{t.categories?.create || 'Create Category'}</h2>
          <button
            type="submit"
            disabled={actionLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{t.categories?.add || 'Add'}</span>
          </button>
        </div>
        {createError && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {createError}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t.categories?.name || 'Name'}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setCreateError(null)
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }}
              className="form-input"
              placeholder={t.categories?.namePlaceholder || 'Category name'}
              minLength={2}
              required
            />
          </div>
          <div>
            <label className="form-label">{t.categories?.description || 'Description'}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => {
                setCreateError(null)
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }}
              className="form-input"
              placeholder={t.categories?.descriptionPlaceholder || 'Category description'}
              minLength={5}
              required
            />
          </div>
        </div>
      </form>

      <div className="dashboard-card p-4">
        <DataTable
          columns={columns}
          data={categories}
          keyField="id"
          pageSize={10}
          emptyMessage={t.categories?.empty || 'No categories found.'}
        />
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleDelete}
        title={t.categories?.deleteTitle || 'Delete Category'}
        message={`${t.categories?.deleteMessage || 'Are you sure you want to delete'} ${deleteModal.category?.name || ''}?`}
        confirmText={t.common?.delete || 'Delete'}
        variant="danger"
        isLoading={actionLoading}
      />

      {editModal.isOpen && editModal.category && (
        <ConfirmModal
          isOpen={editModal.isOpen}
          onClose={() => {
            setEditError(null)
            setEditModal({ isOpen: false, category: null })
          }}
          onConfirm={handleEditSave}
          title={t.categories?.editTitle || 'Edit Category'}
          message=""
          confirmText={t.common?.save || 'Save'}
          variant="info"
          isLoading={actionLoading}
        >
          {editError && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {editError}
            </div>
          )}
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="form-label">{t.categories?.name || 'Name'}</label>
              <input
                type="text"
                value={editModal.category.name}
                onChange={(e) =>
                  {
                    setEditError(null)
                    setEditModal((prev) => ({
                      ...prev,
                      category: prev.category ? { ...prev.category, name: e.target.value } : prev.category,
                    }))
                  }
                }
                className="form-input"
                minLength={2}
                required
              />
            </div>
            <div>
              <label className="form-label">{t.categories?.description || 'Description'}</label>
              <input
                type="text"
                value={editModal.category.description}
                onChange={(e) =>
                  {
                    setEditError(null)
                    setEditModal((prev) => ({
                      ...prev,
                      category: prev.category ? { ...prev.category, description: e.target.value } : prev.category,
                    }))
                  }
                }
                className="form-input"
                minLength={5}
                required
              />
            </div>
          </form>
        </ConfirmModal>
      )}
    </div>
  )
}

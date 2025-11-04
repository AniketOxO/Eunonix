import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { useAuthStore } from '@/store/useAuthStore'

export function ProfileDropdown() {
  const navigate = useNavigate()
  const { user, signOut, updateProfile } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [editForm, setEditForm] = useState({ name: '', email: '', photo: '' })
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditForm({ 
      name: user?.name || '', 
      email: user?.email || '', 
      photo: user?.avatar || '' 
    })
    setPreviewPhoto(user?.avatar || null)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const handleSaveProfile = () => {
    // Update profile in auth store
    updateProfile({
      name: editForm.name,
      email: editForm.email,
      avatar: editForm.photo
    })
    setShowEditModal(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreviewPhoto(base64String)
        setEditForm({ ...editForm, photo: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPreviewPhoto(null)
    setEditForm({ ...editForm, photo: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const modal = typeof document !== 'undefined'
    ? createPortal(
    <AnimatePresence>
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink-900/80 backdrop-blur-lg p-4 z-[9999] cursor-default"
          onClick={() => setShowEditModal(false)}
        >
          <div className="min-h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-ink-100/20 shadow-2xl relative z-[10000]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-ink-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-ink-100/50 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-3">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center text-white font-medium text-2xl overflow-hidden flex-shrink-0">
                      {previewPhoto ? (
                        <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getInitials()}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="inline-block px-4 py-2 bg-lilac-100 text-lilac-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-lilac-200 transition-colors"
                      >
                        Upload Photo
                      </label>
                      {previewPhoto && (
                        <button
                          onClick={handleRemovePhoto}
                          className="block px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-ink-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all cursor-text relative z-10"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-ink-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-lilac-400 focus:border-transparent transition-all cursor-text relative z-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
    : null

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center text-white font-medium shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials()}</span>
          )}
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-ink-100/20 overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-ink-100/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lilac-400 via-sand-300 to-golden-400 flex items-center justify-center text-white font-medium text-lg overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 truncate">{user?.name || 'User'}</div>
                    <div className="text-sm text-ink-600 truncate">{user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowEditModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-ink-50/50 transition-colors flex items-center gap-3 text-ink-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/soul')
                    setIsOpen(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-ink-50/50 transition-colors flex items-center gap-3 text-ink-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>

                <div className="my-2 border-t border-ink-100/20"></div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-50/50 transition-colors flex items-center gap-3 text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {modal}
    </>
  )
}

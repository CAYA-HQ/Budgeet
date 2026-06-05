import { useState, useEffect, useRef } from 'react'
import { Camera, User, Mail, Lock, Eye, EyeOff, Trash2, AlertTriangle } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { profileApi } from '../../lib/api'
import '../../styles/profile.css'

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <div className="profile-header-card" style={{ background: '#f1f1f1' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 160, height: 18, borderRadius: 8, background: 'rgba(0,0,0,0.08)' }} />
          <div style={{ width: 120, height: 13, borderRadius: 8, background: 'rgba(0,0,0,0.06)' }} />
        </div>
        <div style={{ width: 100, height: 36, borderRadius: 99, background: 'rgba(0,0,0,0.08)' }} />
      </div>
      <div className="profile-grid">
        <div className="profile-grid-main">
          <div className="profile-section">
            <div style={{ width: 180, height: 18, borderRadius: 8, background: '#f0f0f0', marginBottom: 8 }} />
            <div style={{ width: 260, height: 13, borderRadius: 8, background: '#f5f5f5', marginBottom: 28 }} />
            <div className="profile-fields">
              {[1, 2].map(i => (
                <div key={i} className="profile-field">
                  <div style={{ width: 80, height: 12, borderRadius: 6, background: '#f0f0f0' }} />
                  <div style={{ width: '100%', height: 44, borderRadius: 12, background: '#f5f5f5' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="profile-grid-side">
          <div className="profile-section" style={{ height: 160 }} />
        </div>
      </div>
    </div>
  )
}

// ── Delete Account Modal ──────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onConfirm, deleting }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeInOverlay 0.2s ease',
    }}>
      <style>{`@keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}`}</style>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        maxWidth: 420, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'slideUpModal 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <style>{`@keyframes slideUpModal{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: '#fff5f5', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <AlertTriangle size={26} color="#ef4444" />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>
          Delete Account
        </h2>
        <p style={{ fontSize: 13, color: '#78778B', lineHeight: 1.6, margin: '0 0 20px' }}>
          This action is <strong>permanent and irreversible</strong>. All your data budgets,
          expenses, income records, and notifications will be deleted immediately.
        </p>

        {/* Warning list */}
        <div style={{
          background: '#fff5f5', borderRadius: 12, padding: '14px 16px',
          marginBottom: 20, border: '1px solid #fee2e2',
        }}>
          {[
            'All your expenses and income will be deleted',
            'Your budget history will be lost',
            'Your account cannot be recovered',
          ].map((item, i) => (
            <p key={i} style={{
              fontSize: 12, color: '#ef4444', fontWeight: 600,
              margin: i === 2 ? 0 : '0 0 6px',
              display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
              <span style={{ marginTop: 1 }}>✕</span> {item}
            </p>
          ))}
        </div>

        {/* Password confirmation */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block', marginBottom: 8 }}>
            Enter your password to confirm
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your current password"
              style={{
                width: '100%', padding: '11px 40px 11px 14px',
                border: '1.5px solid #f0f0f0', borderRadius: 12,
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#f0f0f0'}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: '1.5px solid #f0f0f0', background: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              color: '#333', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={deleting || !password}
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              border: 'none',
              background: deleting || !password ? '#fca5a5' : '#ef4444',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: deleting || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {deleting ? 'Deleting…' : <><Trash2 size={14} /> Delete Account</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function ProfilePage() {
  const { user: authUser, storeSession, logout } = useAuth()
  const fileInputRef = useRef(null)

  const [loading, setLoading]                         = useState(true)
  const [saving, setSaving]                           = useState(false)
  const [uploadingAvatar, setUploadingAvatar]         = useState(false)
  const [profile, setProfile]                         = useState(null)
  const [avatarPreview, setAvatarPreview]             = useState(null)
  const [isEditing, setIsEditing]                     = useState(false)
  const [formData, setFormData]                       = useState({})
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [changingPassword, setChangingPassword]       = useState(false)
  const [passwordData, setPasswordData]               = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword]         = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal]         = useState(false)
  const [deleting, setDeleting]                       = useState(false)

  useEffect(() => {
    profileApi.get()
      .then((data) => {
        setProfile(data)
        setFormData({ name: data.name, email: data.email })
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
      })
      .catch(() => {
        const fallback = { id: authUser?.id, name: authUser?.name || '', email: authUser?.email || '', avatar_url: '' }
        setProfile(fallback)
        setFormData({ name: fallback.name, email: fallback.email })
      })
      .finally(() => setLoading(false))
  }, [authUser])

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name[0].toUpperCase()
  }

  // ── Avatar upload ──
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) { toast.error('Please choose a JPEG, PNG, WebP, or GIF image.'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB.'); return }
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setUploadingAvatar(true)
    try {
      const data = await profileApi.uploadAvatar(file)
      setAvatarPreview(data.avatar_url)
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      toast.success('Profile picture updated')
    } catch (err) {
      setAvatarPreview(profile?.avatar_url || null)
      toast.error(err.message || 'Failed to upload image.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  // ── Save profile ──
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const payload = {}
      if (formData.name !== profile.name)   payload.name  = formData.name
      if (formData.email !== profile.email) payload.email = formData.email
      if (Object.keys(payload).length === 0) { setIsEditing(false); return }
      const updated = await profileApi.update(payload)
      setProfile(updated)
      setFormData({ name: updated.name, email: updated.email })
      storeSession({ user: { ...authUser, name: updated.name, email: updated.email }, token: localStorage.getItem('budgeet_token') })
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => { setFormData({ name: profile.name, email: profile.email }); setIsEditing(false) }

  // ── Change password ──
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error('Please fill in all fields.'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return }
    setChangingPassword(true)
    try {
      await profileApi.changePassword({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword })
      toast.success('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setChangingPassword(false)
    }
  }

  // ── Delete account ──
  const handleDeleteAccount = async (password) => {
    if (!password) { toast.error('Please enter your password.'); return }
    setDeleting(true)
    try {
      await profileApi.deleteAccount(password)
      toast.success('Account deleted')
      // Small delay so user sees the toast before being logged out
      setTimeout(() => {
        logout()
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.')
      setDeleting(false)
    }
  }

  if (loading) return <ProfileSkeleton />

  return (
    <div className="profile-page" style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .profile-avatar-wrapper {
          width: 56px !important; height: 56px !important; flex-shrink: 0;
        }
        .profile-avatar {
          width: 56px !important; height: 56px !important;
          min-width: 56px; min-height: 56px;
          border-radius: 50% !important;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .profile-avatar-wrapper:hover .avatar-camera-overlay { opacity: 1 !important; }
        .profile-avatar-upload { display: none; }
      `}</style>

      <Toaster position="top-center" toastOptions={{
        duration: 2500,
        style: { background: '#000', color: '#fff', fontSize: '14px', fontWeight: '600', borderRadius: '12px', padding: '12px 20px' },
      }} />

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Header card ── */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrapper avatar-ring" onClick={handleAvatarClick} style={{ cursor: 'pointer', position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          {avatarPreview || profile.avatar ? (
            <img src={avatarPreview || profile.avatar} alt="Profile" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', display: 'block', flexShrink: 0 }} />
          ) : (
            <div className="profile-avatar">{getInitials(profile.name)}</div>
          )}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            opacity: uploadingAvatar ? 1 : 0, transition: 'opacity 0.2s', zIndex: 2,
          }} className="avatar-camera-overlay">
            {uploadingAvatar
              ? <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>Saving…</span>
              : <Camera size={16} color="#fff" />}
          </div>
          <button className="profile-avatar-upload" tabIndex={-1}><Camera size={14} /></button>
        </div>

        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Click the avatar to change your photo</p>
        </div>

        {!isEditing && (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </div>

      <div className="profile-grid">

        {/* ── Personal info ── */}
        <div className="profile-grid-main">
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <p className="profile-section-subtitle">Your name and email address</p>
            <div className="profile-fields">
              <div className="profile-field">
                <label><User size={14} /> Full Name</label>
                {isEditing ? (
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="profile-input" placeholder="Enter your full name" />
                ) : <p>{profile.name}</p>}
              </div>
              <div className="profile-field">
                <label><Mail size={14} /> Email Address</label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="profile-input" placeholder="Enter your email" />
                ) : <p>{profile.email}</p>}
              </div>
            </div>
            {isEditing && (
              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={saving}>Cancel</button>
                <button className="profile-save-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Security + Danger Zone ── */}
        <div className="profile-grid-side">

          {/* Security card */}
          <div className="profile-section">
            <div className="profile-section-header">
              <div>
                <h2 className="profile-section-title">Security</h2>
                <p className="profile-section-subtitle">Manage your password</p>
              </div>
              {!showPasswordSection && (
                <button className="profile-change-password-btn" onClick={() => setShowPasswordSection(true)}>
                  <Lock size={14} /> Change
                </button>
              )}
            </div>

            {!showPasswordSection && (
              <div className="profile-security-info">
                <Lock size={32} />
                <p>Your password is secure. Click Change to update it.</p>
              </div>
            )}

            {/* Password fields — rendered INSIDE the same card, pushing it down */}
            {showPasswordSection && (
              <div className="profile-fields" style={{ marginTop: 4 }}>
                <div className="profile-field">
                  <label>Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="profile-input"
                      placeholder="Current password"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="profile-field">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="profile-input"
                      placeholder="New password"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="password-hint">At least 6 characters</span>
                </div>

                <div className="profile-field">
                  <label>Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="profile-input"
                      placeholder="Confirm new password"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="profile-cancel-btn"
                    disabled={changingPassword}
                    onClick={() => {
                      setShowPasswordSection(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                  >
                    Cancel
                  </button>
                  <button className="profile-save-btn" onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? 'Updating…' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone — separate card below security, never overlaps */}
          <div className="profile-section" style={{ border: '1px solid #fee2e2' }}>
            <h2 className="profile-section-title" style={{ color: '#ef4444' }}>Danger Zone</h2>
            <p className="profile-section-subtitle">Permanent actions that cannot be undone</p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: 16,
              borderRadius: 12,
              background: '#fff5f5',
              border: '1px solid #fee2e2',
              marginTop: 8,
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Delete Account</p>
                <p style={{ fontSize: 12, color: '#78778B', margin: '4px 0 0' }}>
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 10,
                  border: '1.5px solid #ef4444',
                  background: '#fff', color: '#ef4444',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ef4444' }}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          deleting={deleting}
        />
      )}
    </div>
  )
}

export default ProfilePage

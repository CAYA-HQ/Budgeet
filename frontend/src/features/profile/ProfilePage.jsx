import { useState, useEffect, useRef } from 'react'
import { Camera, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { profileApi } from '../../lib/api'
import '../../styles/profile.css'

// ── Skeleton ─────────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user: authUser, storeSession } = useAuth()
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

  // ── Fetch profile on mount ──
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

    // Validate on frontend before uploading
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.')
      return
    }

    // Show instant preview before upload completes
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setUploadingAvatar(true)

    try {
      const data = await profileApi.uploadAvatar(file)
      setAvatarPreview(data.avatar_url)
      setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      toast.success('Profile picture updated')
    } catch (err) {
      // Revert preview on failure
      setAvatarPreview(profile?.avatar_url || null)
      toast.error(err.message || 'Failed to upload image.')
    } finally {
      setUploadingAvatar(false)
      // Reset input so the same file can be re-selected
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

      if (Object.keys(payload).length === 0) {
        setIsEditing(false)
        return
      }

      const updated = await profileApi.update(payload)
      setProfile(updated)
      setFormData({ name: updated.name, email: updated.email })

      // Sync back into AuthContext so header name updates immediately
      storeSession({
        user:  { ...authUser, name: updated.name, email: updated.email },
        token: localStorage.getItem('budgeet_token'),
      })

      setIsEditing(false)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData({ name: profile.name, email: profile.email })
    setIsEditing(false)
  }

  // ── Change password ──
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setChangingPassword(true)
    try {
      await profileApi.changePassword({
        current_password:  currentPassword,
        new_password:      newPassword,
        confirm_password:  confirmPassword,
      })
      toast.success('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordSection(false)
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setChangingPassword(false)
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
          width: 56px !important;
          height: 56px !important;
          flex-shrink: 0;
        }
        .profile-avatar {
          width: 56px !important;
          height: 56px !important;
          min-width: 56px;
          min-height: 56px;
          border-radius: 50% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .profile-avatar-wrapper:hover .avatar-camera-overlay {
          opacity: 1 !important;
        }
        .profile-avatar-upload {
          display: none;
        }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#000000',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 20px',
          },
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header card */}
      <div className="profile-header-card">
        <div
          className="profile-avatar-wrapper avatar-ring"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer', position: 'relative', width: 56, height: 56, flexShrink: 0 }}
        >
          {avatarPreview || profile.avatar ? (
            <img
              src={avatarPreview || profile.avatar}
              alt="Profile"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                flexShrink: 0,
              }}
            />
          ) : (
            <div className="profile-avatar">{getInitials(profile.name)}</div>
          )}

          {/* Camera overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploadingAvatar ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 2,
            }}
            className="avatar-camera-overlay"
          >
            {uploadingAvatar ? (
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                Saving…
              </span>
            ) : (
              <Camera size={16} color="#fff" />
            )}
          </div>

          <button className="profile-avatar-upload" tabIndex={-1}>
            <Camera size={14} />
          </button>
        </div>

        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
            Click the avatar to change your photo
          </p>
        </div>

        {!isEditing && (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-grid">
        {/* Personal info */}
        <div className="profile-grid-main">
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <p className="profile-section-subtitle">Your name and email address</p>

            <div className="profile-fields">
              <div className="profile-field">
                <label>
                  <User size={14} /> Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="profile-input"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p>{profile.name}</p>
                )}
              </div>

              <div className="profile-field">
                <label>
                  <Mail size={14} /> Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="profile-input"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p>{profile.email}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </button>
                <button className="profile-save-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="profile-grid-side">
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

            {showPasswordSection && (
              <div className="profile-fields">
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
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
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
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
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
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="profile-cancel-btn"
                    disabled={changingPassword}
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
import { useState, useEffect } from 'react'
import { Camera, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import '../../styles/profile.css'

const mockUser = {
  name: 'Elizabeth Adeyemi',
  email: 'elizabeth@gmail.com',
  phone: '+234 801 234 5678',
}

function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <div className="profile-header-card" style={{ background: '#f1f1f1' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(0,0,0,0.08)', flexShrink: 0
        }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 160, height: 18, borderRadius: 8, background: 'rgba(0,0,0,0.08)' }} />
          <div style={{ width: 120, height: 13, borderRadius: 8, background: 'rgba(0,0,0,0.06)' }} />
        </div>
        <div style={{ width: 100, height: 36, borderRadius: 99, background: 'rgba(0,0,0,0.08)' }} />
      </div>

      <div className="profile-grid">
        <div className="profile-grid-main">
          <div className="profile-section" style={{ height: 'auto' }}>
            <div style={{ width: 180, height: 18, borderRadius: 8, background: '#f0f0f0', marginBottom: 8 }} />
            <div style={{ width: 260, height: 13, borderRadius: 8, background: '#f5f5f5', marginBottom: 28 }} />
            <div className="profile-fields">
              {[1, 2, 3].map(i => (
                <div key={i} className="profile-field">
                  <div style={{ width: 80, height: 12, borderRadius: 6, background: '#f0f0f0' }} />
                  <div style={{ width: '100%', height: 44, borderRadius: 12, background: '#f5f5f5' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-grid-side">
          <div className="profile-section" style={{ height: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 80, height: 18, borderRadius: 8, background: '#f0f0f0' }} />
              <div style={{ width: 80, height: 32, borderRadius: 99, background: '#f0f0f0' }} />
            </div>
            <div style={{ width: 160, height: 13, borderRadius: 8, background: '#f5f5f5', marginBottom: 28 }} />
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 12, padding: '32px 20px'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0f0f0' }} />
              <div style={{ width: 200, height: 13, borderRadius: 8, background: '#f5f5f5' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(mockUser)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name[0].toUpperCase()
  }

  const handleSaveProfile = () => {
    setProfile(formData)
    setIsEditing(false)
    toast.success('Profile updated')
  }

  const handleCancelEdit = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    toast.success('Password updated successfully')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowPasswordSection(false)
  }

  if (loading) return <ProfileSkeleton />

  return (
    <div className="profile-page" style={{ animation: 'fadeIn 0.4s ease' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
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

      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">{getInitials(profile.name)}</div>
          <button className="profile-avatar-upload"><Camera size={14} /></button>
        </div>
        <div className="profile-header-info">
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
        </div>
        {!isEditing && (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-grid-main">
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <p className="profile-section-subtitle">Your personal details and contact information</p>
            <div className="profile-fields">
              <div className="profile-field">
                <label><User size={14} />Full Name</label>
                {isEditing ? (
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="profile-input" placeholder="Enter your full name" />
                ) : <p>{profile.name}</p>}
              </div>
              <div className="profile-field">
                <label><Mail size={14} />Email Address</label>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="profile-input" placeholder="Enter your email" />
                ) : <p>{profile.email}</p>}
              </div>
              <div className="profile-field">
                <label><Phone size={14} />Phone Number</label>
                {isEditing ? (
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="profile-input" placeholder="Enter your phone number" />
                ) : <p>{profile.phone}</p>}
              </div>
            </div>
            {isEditing && (
              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                <button className="profile-save-btn" onClick={handleSaveProfile}>Save Changes</button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-grid-side">
          <div className="profile-section">
            <div className="profile-section-header">
              <div>
                <h2 className="profile-section-title">Security</h2>
                <p className="profile-section-subtitle">Manage your password</p>
              </div>
              {!showPasswordSection && (
                <button className="profile-change-password-btn" onClick={() => setShowPasswordSection(true)}>
                  <Lock size={14} />Change
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
                    <input type={showCurrentPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="profile-input" placeholder="Current password" />
                    <button className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="profile-field">
                  <label>New Password</label>
                  <div className="password-input-wrapper">
                    <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="profile-input" placeholder="New password" />
                    <button className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="password-hint">At least 6 characters</span>
                </div>
                <div className="profile-field">
                  <label>Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="profile-input" placeholder="Confirm password" />
                    <button className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="profile-cancel-btn" onClick={() => { setShowPasswordSection(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}>Cancel</button>
                  <button className="profile-save-btn" onClick={handleChangePassword}>Update</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import AdminSidebar from './AdminSidebar'

const API_URL = `${BASE_URL}/hospital`

const UserProfile = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const token = localStorage.getItem('token')
  const loginUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = loginUser.role === 'superadmin'

  const [user, setUser] = useState({})
  const [edit, setEdit] = useState(false)
  const [passwordBox, setPasswordBox] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    BG: '',
    image: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  })

  const getProfile = async () => {
    if (!token) {
      navigate('/')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setUser(data.user || {})
        setForm({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || '',
          age: data.user?.age || '',
          gender: data.user?.gender || '',
          BG: data.user?.BG || '',
          image: data.user?.image || '',
        })
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Profile load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => getProfile())
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handlePasswordChange = (event) => {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const saveProfile = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.age || !form.gender || !form.BG) {
      setMessage('All fields are required')
      return
    }

    try {
      const response = await fetch(`${API_URL}/updateprofile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Profile updated successfully')
        setEdit(false)
        getProfile()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile update nahi ho payi')
      console.error(error)
    }
  }

  const changePassword = async (event) => {
    event.preventDefault()

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setMessage('Old password and new password are required')
      return
    }

    try {
      const response = await fetch(`${API_URL}/changepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Password changed successfully')
        setPasswordForm({ oldPassword: '', newPassword: '' })
        setPasswordBox(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Password change nahi ho paya')
      console.error(error)
    }
  }

  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    alert('Logout successfully')
    navigate('/')
  }

  return (
    <main className={isAdmin ? 'hospital-dash-layout' : 'page-shell'}>
      {isAdmin && <AdminSidebar />}

      <section className={isAdmin ? 'hospital-main' : 'page-content-full'}>
      <div className="page-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Profile</h1>
          <p className="muted">Your account details</p>
        </div>

        <div className="header-actions">
          {!isAdmin && <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>}
          {!isAdmin && (
            <button className="theme-btn" onClick={toggleTheme} title="Change theme">
              {theme === 'light' ? '☾' : '☀'}
            </button>
          )}
          <button className="secondary-btn" onClick={() => setEdit(true)}>Edit</button>
          <button className="secondary-btn" onClick={() => setPasswordBox(true)}>Reset Password</button>
          <button className="danger-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading profile...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && (
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {user.image ? <img src={user.image} alt="Profile" /> : (user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{user.name || 'User'}</h2>
              <p>{user.email || '-'}</p>
            </div>
          </div>

          {!edit && (
            <div className="profile-grid">
              <div className="profile-info"><span>Name</span><strong>{user.name || '-'}</strong></div>
              <div className="profile-info"><span>Email</span><strong>{user.email || '-'}</strong></div>
              <div className="profile-info"><span>Phone</span><strong>{user.phone || '-'}</strong></div>
              <div className="profile-info"><span>Age</span><strong>{user.age || '-'}</strong></div>
              <div className="profile-info"><span>Gender</span><strong>{user.gender || '-'}</strong></div>
              <div className="profile-info"><span>Blood Group</span><strong>{user.BG || '-'}</strong></div>
            </div>
          )}

          {edit && (
            <form className="profile-form" onSubmit={saveProfile}>
              <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <input name="phone" type="number" placeholder="Phone" value={form.phone} onChange={handleChange} />
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input name="BG" type="text" placeholder="Blood Group" value={form.BG} onChange={handleChange} />
              <input type="file" accept="image/*" onChange={handleImageChange} />

              <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" className="secondary-btn" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          )}

          {passwordBox && (
            <form className="profile-form" onSubmit={changePassword}>
              <input name="oldPassword" type="password" placeholder="Old password" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
              <input name="newPassword" type="password" placeholder="New password" value={passwordForm.newPassword} onChange={handlePasswordChange} />

              <div className="form-actions">
                <button type="submit">Change Password</button>
                <button type="button" className="secondary-btn" onClick={() => setPasswordBox(false)}>Cancel</button>
              </div>
            </form>
          )}

          {message && <p className="message profile-message">{message}</p>}
        </section>
      )}
      </section>
    </main>
  )
}

export default UserProfile

import { useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  User,
  CalendarDays,
  History,
  KeyRound,
  LogOut,
  Camera,
} from "lucide-react"

import "./AccountSidebar.css"

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"

function AccountSidebar({
  activeMenu = "profile",
  profileData = {},
  appointmentCount = 0,
  onAvatarChange,
  onLogout,
  isAvatarUploading = false,
}) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const avatarSrc = useMemo(() => {
    return profileData?.avatar || profileData?.anhDaiDien || DEFAULT_AVATAR
  }, [profileData?.avatar, profileData?.anhDaiDien])

  const fullName = useMemo(() => {
    return profileData?.fullName || profileData?.hoTen || "Khách hàng"
  }, [profileData?.fullName, profileData?.hoTen])

  const email = useMemo(() => {
    return profileData?.email || ""
  }, [profileData?.email])

  const handleChooseAvatar = () => {
    if (isAvatarUploading) return
    fileInputRef.current?.click()
  }

  const handleAvatarInputChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (onAvatarChange) {
      onAvatarChange(file)
    }

    event.target.value = ""
  }

  const handleAvatarError = (event) => {
    if (event.currentTarget.src !== DEFAULT_AVATAR) {
      event.currentTarget.src = DEFAULT_AVATAR
    }
  }

  return (
    <aside className="account-sidebar">
      <div className="account-user-card">
        <div className="account-avatar-wrap">
          {isAvatarUploading ? (
            <div className="account-avatar-skeleton"></div>
          ) : (
            <img
              src={avatarSrc}
              alt={fullName}
              className="account-avatar"
              onError={handleAvatarError}
            />
          )}

          <button
            type="button"
            className={`account-avatar-btn ${
              isAvatarUploading ? "account-avatar-btn--loading" : ""
            }`}
            onClick={handleChooseAvatar}
            title="Đổi ảnh đại diện"
            disabled={isAvatarUploading}
          >
            {!isAvatarUploading && <Camera size={17} />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarInputChange}
            disabled={isAvatarUploading}
          />
        </div>

        <h3>{fullName}</h3>
        <p>{email}</p>
      </div>

      <div className="account-menu">
        <button
          type="button"
          className={`account-menu-item ${
            activeMenu === "profile" ? "active" : ""
          }`}
          onClick={() => navigate("/tai-khoan")}
        >
          <div className="account-menu-left">
            <User size={20} />
            <span>Thông tin cá nhân</span>
          </div>
        </button>

        <button
          type="button"
          className={`account-menu-item ${
            activeMenu === "appointments" ? "active" : ""
          }`}
          onClick={() => navigate("/lich-hen-cua-toi")}
        >
          <div className="account-menu-left">
            <CalendarDays size={20} />
            <span>Lịch hẹn của tôi</span>
          </div>

          <span className="account-badge">{appointmentCount}</span>
        </button>

        <button
          type="button"
          className={`account-menu-item ${
            activeMenu === "history" ? "active" : ""
          }`}
          onClick={() => navigate("/lich-su-dich-vu")}
        >
          <div className="account-menu-left">
            <History size={20} />
            <span>Lịch sử dịch vụ</span>
          </div>
        </button>

        <button
          type="button"
          className={`account-menu-item ${
            activeMenu === "password" ? "active" : ""
          }`}
          onClick={() => navigate("/doi-mat-khau")}
        >
          <div className="account-menu-left">
            <KeyRound size={20} />
            <span>Đổi mật khẩu</span>
          </div>
        </button>

        <button
          type="button"
          className="account-menu-item logout"
          onClick={onLogout}
        >
          <div className="account-menu-left">
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </div>
        </button>
      </div>
    </aside>
  )
}

export default AccountSidebar
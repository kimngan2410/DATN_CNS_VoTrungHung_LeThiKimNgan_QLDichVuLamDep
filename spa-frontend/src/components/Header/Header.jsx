/* eslint-disable react-hooks/set-state-in-effect */
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  Bell,
  CalendarDays,
  Clock3,
  LogOut,
  Search,
  UserRound,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { navLinks } from "../../data/homeData"
import logoHeader from "../../assets/images/logo_header.png"
import { getCurrentUser, logout } from "../../services/authApi"
import "./Header.css"

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const accountMenuRef = useRef(null)

  const [keyword, setKeyword] = useState("")
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q") || ""

    setKeyword(q)
    setCurrentUser(getCurrentUser())
    setIsAccountMenuOpen(false)
  }, [location.search, location.pathname])

  useEffect(() => {
    const handleAuthChanged = () => {
      setCurrentUser(getCurrentUser())
    }

    window.addEventListener("auth-changed", handleAuthChanged)
    window.addEventListener("storage", handleAuthChanged)

    return () => {
      window.removeEventListener("auth-changed", handleAuthChanged)
      window.removeEventListener("storage", handleAuthChanged)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()

    const trimmedKeyword = keyword.trim()

    if (trimmedKeyword) {
      navigate(`/dich-vu?q=${encodeURIComponent(trimmedKeyword)}`)
    } else {
      navigate("/dich-vu")
    }
  }

  const handleNotificationClick = () => {
    if (!currentUser) {
      navigate("/dang-nhap")
      return
    }

    // Sau này nếu có popup thông báo nhắc lịch thì mở ở đây
  }

  const handleToggleAccountMenu = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const handleCloseAccountMenu = () => {
    setIsAccountMenuOpen(false)
  }

  const handleLogout = () => {
    setIsAccountMenuOpen(false)
    setIsLoggingOut(true)

    setTimeout(() => {
      logout()
      setCurrentUser(null)
      setIsLoggingOut(false)
      navigate("/trang-chu")
    }, 3000)
  }

  const avatarUrl = currentUser?.avatar || DEFAULT_AVATAR
  const userName = currentUser?.hoTen || "Tài khoản"
  const userEmail = currentUser?.email || "email@gmail.com"

  return (
    <>
      <header className="header">
        <div className="header__container">
          <Link to="/" className="header__logo">
            <img src={logoHeader} alt="Serenity Spa Logo" />
          </Link>

          <nav className="header__nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.path}
                className={({ isActive }) =>
                  `header__nav-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <form className="header__search" onSubmit={handleSearchSubmit}>
              <Search size={16} className="header__search-icon" />

              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </form>

            <button
              type="button"
              className="header__notification-btn"
              title="Thông báo"
              aria-label="Thông báo"
              onClick={handleNotificationClick}
            >
              <Bell size={20} />

              {currentUser && (
                <span className="header__notification-badge">3</span>
              )}
            </button>

            {currentUser ? (
              <div className="header__account" ref={accountMenuRef}>
                <button
                  type="button"
                  className="header__avatar-btn"
                  title={userName}
                  onClick={handleToggleAccountMenu}
                  aria-expanded={isAccountMenuOpen}
                >
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="header__avatar-img"
                  />
                </button>

                {isAccountMenuOpen && (
                  <div className="header__account-menu">
                    <div className="header__account-info">
                      <h4>{userName}</h4>
                      <p>{userEmail}</p>
                    </div>

                    <div className="header__account-list">
                      <Link
                        to="/tai-khoan"
                        className="header__account-item"
                        onClick={handleCloseAccountMenu}
                      >
                        <UserRound size={20} />
                        <span>Tài khoản cá nhân</span>
                      </Link>

                      <Link
                        to="/lich-hen-cua-toi"
                        className="header__account-item"
                        onClick={handleCloseAccountMenu}
                      >
                        <CalendarDays size={20} />
                        <span>Lịch hẹn của tôi</span>
                      </Link>

                      <Link
                        to="/lich-su-dich-vu"
                        className="header__account-item"
                        onClick={handleCloseAccountMenu}
                      >
                        <Clock3 size={20} />
                        <span>Lịch sử dịch vụ</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="header__account-item header__account-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={20} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/dang-nhap" className="header__login">
                  Đăng nhập
                </Link>

                <Link to="/dang-ky" className="header__register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {isLoggingOut && (
        <div className="logout-loading">
          <div className="logout-loading__box">
            <div className="logout-loading__spinner"></div>
            <h3>Đang đăng xuất</h3>
            <p>Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
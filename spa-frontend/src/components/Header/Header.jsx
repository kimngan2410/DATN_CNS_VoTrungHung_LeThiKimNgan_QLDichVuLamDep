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
import { suggestCustomerServicesApi } from "../../services/customerServiceSearchApi"
import "./Header.css"

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

function getFullAvatarUrl(avatar) {
  if (!avatar) return DEFAULT_AVATAR

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar
  }

  if (avatar.startsWith("/uploads")) {
    return `${API_ORIGIN}${avatar}`
  }

  return avatar
}

function getFullImageUrl(image) {
  if (!image) return ""

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image
  }

  if (image.startsWith("/")) {
    return `${API_ORIGIN}${image}`
  }

  return `${API_ORIGIN}/${image}`
}

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const accountMenuRef = useRef(null)
  const searchBoxRef = useRef(null)

  const [keyword, setKeyword] = useState("")
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q") || ""

    setKeyword(q)
    setCurrentUser(getCurrentUser())
    setIsAccountMenuOpen(false)
    setIsSuggestOpen(false)
  }, [location.search, location.pathname])

  useEffect(() => {
    const handleAuthChanged = () => {
      setCurrentUser(getCurrentUser())
    }

    window.addEventListener("customer-auth-changed", handleAuthChanged)
    window.addEventListener("auth-changed", handleAuthChanged)
    window.addEventListener("storage", handleAuthChanged)

    return () => {
      window.removeEventListener("customer-auth-changed", handleAuthChanged)
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

      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setIsSuggestOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const trimmedKeyword = keyword.trim()

    if (trimmedKeyword.length < 1) {
      setSuggestions([])
      setIsSuggestOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSuggestLoading(true)

        const data = await suggestCustomerServicesApi({
          keyword: trimmedKeyword,
          limit: 5,
        })

        setSuggestions(Array.isArray(data?.services) ? data.services : [])
        setIsSuggestOpen(true)
      } catch (error) {
        console.error(error)
        setSuggestions([])
        setIsSuggestOpen(false)
      } finally {
        setIsSuggestLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timer)
    }
  }, [keyword])

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const trimmedKeyword = keyword.trim()
    setIsSuggestOpen(false)

    if (trimmedKeyword) {
      navigate(`/dich-vu?q=${encodeURIComponent(trimmedKeyword)}`)
    } else {
      navigate("/dich-vu")
    }
  }

  const handleSelectSuggestion = (service) => {
    const serviceName = service?.title || ""
    const serviceId = service?.id

    setKeyword(serviceName)
    setIsSuggestOpen(false)

    if (serviceId) {
      navigate(`/dich-vu/${serviceId}`)
    }
  }

  const handleNotificationClick = () => {
    if (!currentUser) {
      navigate("/dang-nhap")
      return
    }
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

  const avatarUrl = getFullAvatarUrl(
    currentUser?.avatar ||
      currentUser?.anhDaiDien ||
      currentUser?.avatarUrl
  )

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
            <form
              ref={searchBoxRef}
              className="header__search"
              onSubmit={handleSearchSubmit}
            >
              <Search size={16} className="header__search-icon" />

              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onFocus={() => {
                  if (keyword.trim()) {
                    setIsSuggestOpen(true)
                  }
                }}
              />

              {isSuggestOpen && keyword.trim() && (
                <div className="header__search-suggestions">
                  {isSuggestLoading ? (
                    <div className="header__search-suggestion-state">
                      Đang tìm dịch vụ...
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        className="header__search-suggestion-card"
                        onClick={() => handleSelectSuggestion(service)}
                      >
                        <div className="header__search-suggestion-card-image">
                          {service.image ? (
                            <img
                              src={getFullImageUrl(service.image)}
                              alt={service.title}
                              onError={(event) => {
                                event.currentTarget.style.display = "none"
                              }}
                            />
                          ) : (
                            <Search size={18} />
                          )}
                        </div>

                        <div className="header__search-suggestion-card-content">
                          <strong>{service.title}</strong>

                          <div className="header__search-suggestion-card-meta">
                            <span>{service.category}</span>
                            <span>{Number(service.price || 0).toLocaleString("vi-VN")} đ</span>

                            {service.duration ? <span>{service.duration} phút</span> : null}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="header__search-suggestion-state">
                      Không tìm thấy dịch vụ phù hợp
                    </div>
                  )}

                  <button type="submit" className="header__search-view-all">
                    Xem tất cả kết quả cho “{keyword.trim()}”
                  </button>
                </div>
              )}
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
                    key={avatarUrl}
                    src={avatarUrl}
                    alt={userName}
                    className="header__avatar-img"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_AVATAR
                    }}
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
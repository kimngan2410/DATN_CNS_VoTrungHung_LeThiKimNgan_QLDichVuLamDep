/* eslint-disable react-hooks/set-state-in-effect */
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { navLinks } from "../../data/homeData"
import logoHeader from "../../assets/images/logo_header.png"
import "./Header.css"

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [keyword, setKeyword] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get("q") || ""
    setKeyword(q)
  }, [location.search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmedKeyword = keyword.trim()

    if (trimmedKeyword) {
      navigate(`/dich-vu?q=${encodeURIComponent(trimmedKeyword)}`)
    } else {
      navigate("/dich-vu")
    }
  }

  return (
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

          <Link to="/dang-nhap" className="header__login">
            Đăng nhập
          </Link>

          <Link to="/dang-ky" className="header__register">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
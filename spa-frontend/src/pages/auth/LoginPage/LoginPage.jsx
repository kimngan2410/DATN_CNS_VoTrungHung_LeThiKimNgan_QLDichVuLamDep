import { useState } from "react"
import { Link } from "react-router-dom"
import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { FaFacebookF } from "react-icons/fa"
import "./LoginPage.css"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "lethikimngan.dn43@gmail.com",
    password: "123456",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login data:", formData)
  }

  return (
    <>
      <Header />

      <main className="login-main">
        <div className="login-card">
          <div className="login-card__top">
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập để tiếp tục trải nghiệm dịch vụ</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__group">
              <label>Email</label>
              <div className="login-form__input-wrap">
                <Mail size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="nhap@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="login-form__group">
              <div className="login-form__label-row">
                <label>Mật khẩu</label>
                <Link to="/quen-mat-khau" className="login-form__forgot">
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="login-form__input-wrap">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="login-form__eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-form__submit">
              Đăng nhập
            </button>

            <div className="login-form__divider">
              <span>Hoặc đăng nhập bằng</span>
            </div>

            <div className="login-form__socials">
              <button type="button" className="login-form__social-btn">
                <FcGoogle size={22} />
                <span>Google</span>
              </button>

              <button type="button" className="login-form__social-btn">
                <FaFacebookF className="login-form__facebook-icon" />
                <span>Facebook</span>
              </button>
            </div>
          </form>

          <div className="login-card__bottom">
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingChat />
    </>
  )
}

export default LoginPage
import { Link } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"
import { MapPin, Phone, Mail } from "lucide-react"
import logoFooter from "../../assets/images/logo_footer.png"
import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">
              <img src={logoFooter} alt="Serenity Spa Logo" />
            </div>

            <p className="footer__description">
              Nơi đánh thức vẻ đẹp tự nhiên và mang lại sự thư giãn tuyệt đối
              cho tâm hồn bạn. Trải nghiệm dịch vụ chăm sóc da đẳng cấp 5 sao.
            </p>

            <div className="footer__socials">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter />
              </a>
            </div>
          </div>

          <div>
            <h4>Liên kết nhanh</h4>
            <ul className="footer__links">
              <li>
                <Link to="/trang-chu">Trang chủ</Link>
              </li>
              <li>
                <Link to="/dich-vu">Dịch vụ</Link>
              </li>
              <li>
                <Link to="/gioi-thieu">Giới thiệu</Link>
              </li>
              <li>
                <Link to="/lien-he">Liên hệ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Hỗ trợ khách hàng</h4>
            <ul className="footer__links">
              <li>
                <Link to="/dat-lich">Đặt lịch online</Link>
              </li>
              <li>
                <Link to="/dich-vu">Xem bảng dịch vụ</Link>
              </li>
              <li>
                <Link to="/gioi-thieu">Về Serenity Spa</Link>
              </li>
              <li>
                <Link to="/lien-he">Tư vấn & hỗ trợ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Thông tin liên hệ</h4>
            <ul className="footer__contact-list">
              <li>
                <MapPin size={16} />
                <span>48 Cao Thắng, Hải Châu, Đà Nẵng</span>
              </li>
              <li>
                <Phone size={16} />
                <span>0901234567</span>
              </li>
              <li>
                <Mail size={16} />
                <span>serinity.spa@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Serenity Spa. Tất cả quyền được bảo lưu.</p>

          <div className="footer__bottom-links">
            <Link to="/gioi-thieu">Chính sách bảo mật</Link>
            <Link to="/lien-he">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
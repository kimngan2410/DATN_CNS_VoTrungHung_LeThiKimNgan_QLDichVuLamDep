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
              Nơi đánh thức vẻ đẹp tự nhiên và mang lại sự thư giãn tuyệt đối cho tâm hồn bạn. Trải nghiệm dịch vụ
              chăm sóc da đẳng cấp 5 sao.
            </p>

            <div className="footer__socials">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaTwitter /></a>
            </div>
          </div>

          <div>
            <h4>Liên kết nhanh</h4>
            <ul>
              <li>Trang chủ</li>
              <li>Dịch vụ</li>
              <li>Giới thiệu</li>
              <li>Liên hệ</li>
            </ul>
          </div>

          <div>
            <h4>Dịch vụ nổi bật</h4>
            <ul>
              <li>Chăm sóc da mặt</li>
              <li>Massage thư giãn</li>
              <li>Chăm sóc móng</li>
              <li>Gội đầu dưỡng sinh</li>
            </ul>
          </div>

          <div>
            <h4>Thông tin liên hệ</h4>
            <ul className="footer__contact-list">
              <li><MapPin size={16} /> Quận 1, TP.HCM</li>
              <li><Phone size={16} /> 0901234567</li>
              <li><Mail size={16} /> contact@serenityspa.vn</li>
            </ul>
          </div>

        </div>

        <div className="footer__bottom">
            <p>© 2026 Serenity Spa. Tất cả quyền được bảo lưu.</p>

            <div className="footer__bottom-links">
                <a href="#">Chính sách bảo mật</a>
                <a href="#">Điều khoản dịch vụ</a>
            </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
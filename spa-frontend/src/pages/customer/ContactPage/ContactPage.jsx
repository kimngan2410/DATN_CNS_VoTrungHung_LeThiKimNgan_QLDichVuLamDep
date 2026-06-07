import { Clock3, Mail, MapPin, Phone } from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import "./ContactPage.css"

function ContactPage() {
  return (
    <div className="contact-page">
      <Header />

      <main className="contact-page__main">
        <section className="contact-page__banner">
          <div className="contact-page__banner-content">
            <h1>Liên hệ</h1>

            <div className="contact-page__breadcrumb">
              <span>TRANG CHỦ</span>
              <span className="contact-page__breadcrumb-separator">›</span>
              <strong>LIÊN HỆ</strong>
            </div>
          </div>
        </section>

        <section className="contact-section contact-intro">
          <div className="contact-intro__content">
            <span className="contact-label">Serenity Spa</span>
            <h2>Chúng tôi luôn sẵn sàng lắng nghe bạn</h2>
            <p>
              Bạn cần tư vấn liệu trình, đặt lịch chăm sóc hoặc có câu hỏi về
              dịch vụ? Hãy để lại thông tin, Serenity Spa sẽ liên hệ hỗ trợ bạn
              trong thời gian sớm nhất.
            </p>
          </div>

          <div className="contact-intro__image">
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop"
              alt="Liên hệ Serenity Spa"
            />
          </div>
        </section>

        <section className="contact-section contact-info">
          <div className="contact-info__card">
            <div className="contact-info__icon">
              <MapPin />
            </div>

            <h3>Địa chỉ</h3>
            <p>48 Cao Thắng, Hải Châu, Đà Nẵng</p>
          </div>

          <div className="contact-info__card">
            <div className="contact-info__icon">
              <Phone />
            </div>

            <h3>Hotline</h3>
            <p>0909 123 456</p>
          </div>

          <div className="contact-info__card">
            <div className="contact-info__icon">
              <Mail />
            </div>

            <h3>Email</h3>
            <p>serenityspa@gmail.com</p>
          </div>

          <div className="contact-info__card">
            <div className="contact-info__icon">
              <Clock3 />
            </div>

            <h3>Giờ mở cửa</h3>
            <p>Thứ 2 - Chủ nhật: 08:00 - 21:00</p>
          </div>
        </section>

        <section className="contact-section contact-body">
          <div className="contact-form-wrap">
            <span className="contact-label">Gửi lời nhắn</span>
            <h2>Liên hệ với chúng tôi</h2>

            <form className="contact-form">
              <div className="contact-form__row">
                <div className="contact-form__group">
                  <label>Họ và tên</label>
                  <input type="text" placeholder="Nhập họ và tên của bạn" />
                </div>

                <div className="contact-form__group">
                  <label>Số điện thoại</label>
                  <input type="tel" placeholder="Nhập số điện thoại" />
                </div>
              </div>

              <div className="contact-form__group">
                <label>Email</label>
                <input type="email" placeholder="Nhập email của bạn" />
              </div>

              <div className="contact-form__group">
                <label>Chủ đề</label>
                <input type="text" placeholder="Bạn cần hỗ trợ vấn đề gì?" />
              </div>

              <div className="contact-form__group">
                <label>Nội dung</label>
                <textarea
                  rows="6"
                  placeholder="Nhập nội dung bạn muốn gửi đến Serenity Spa"
                ></textarea>
              </div>

              <button type="submit" className="contact-form__button">
                Gửi liên hệ
              </button>
            </form>
          </div>

          <div className="contact-map">
            <div className="contact-map__inner">
              <iframe
                title="Serenity Spa Map"
                src="https://www.google.com/maps?q=48%20Cao%20Thang%20Hai%20Chau%20Da%20Nang&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="contact-map__note">
              <h3>Ghé thăm Serenity Spa</h3>
              <p>
                Không gian yên tĩnh, nhẹ nhàng và riêng tư, phù hợp để bạn thư
                giãn sau những ngày làm việc căng thẳng.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default ContactPage
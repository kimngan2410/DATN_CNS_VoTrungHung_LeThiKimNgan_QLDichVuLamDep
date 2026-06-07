import { Leaf, BadgeCheck, Sparkles, MessageCircle } from "lucide-react"
import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"


import "./AboutPage.css"

function AboutPage() {
  return (
    <div className="about-page">
      <Header />

      <main className="about-page__main">
        <section className="about-page__banner">
          <div className="about-page__banner-content">
            <h1>Giới thiệu</h1>

            <div className="about-page__breadcrumb">
              <span>TRANG CHỦ</span>
              <span>›</span>
              <strong>GIỚI THIỆU</strong>
            </div>
          </div>
        </section>

        <section className="about-section about-intro">
          <div className="about-intro__content">
            <span className="about-label">Serenity Spa</span>
            <h2>Sự thư giãn đến từ sự tận tâm</h2>

            <p>
              Serenity Spa là nơi bạn có thể tạm gác lại những bộn bề thường ngày
              để chăm sóc cơ thể, làn da và tinh thần. Chúng tôi hướng đến trải
              nghiệm nhẹ nhàng, gần gũi nhưng vẫn chuyên nghiệp trong từng dịch vụ.
            </p>

            <p>
              Mỗi liệu trình tại Serenity Spa đều được chuẩn bị kỹ lưỡng, từ không
              gian, sản phẩm sử dụng cho đến cách tư vấn phù hợp với từng khách hàng.
              Chúng tôi tin rằng vẻ đẹp tự nhiên bắt đầu từ sự thoải mái và tự tin.
            </p>
          </div>

          <div className="about-intro__image">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop"
              alt="Không gian Serenity Spa"
            />
          </div>
        </section>

        <section className="about-section about-care">
            <div className="about-section__heading">
                <span className="about-label">Dịch vụ tận tâm</span>
                <h2>Chăm sóc khách hàng bằng sự chu đáo</h2>
            </div>

            <div className="about-care__grid">
                <div className="about-care__item">
                <div className="about-care__icon">
                    <Leaf />
                </div>
                <h3>Sản phẩm an toàn</h3>
                <p>Ưu tiên các sản phẩm chất lượng, dịu nhẹ và phù hợp với làn da.</p>
                </div>

                <div className="about-care__item">
                <div className="about-care__icon">
                    <BadgeCheck />
                </div>
                <h3>Kỹ thuật chuyên nghiệp</h3>
                <p>Đội ngũ kỹ thuật viên được đào tạo bài bản, thao tác nhẹ nhàng.</p>
                </div>

                <div className="about-care__item">
                <div className="about-care__icon">
                    <Sparkles />
                </div>
                <h3>Không gian thư giãn</h3>
                <p>Không gian yên tĩnh, hương thơm dễ chịu, tạo cảm giác an yên.</p>
                </div>

                <div className="about-care__item">
                <div className="about-care__icon">
                    <MessageCircle />
                </div>
                <h3>Tư vấn phù hợp</h3>
                <p>Lắng nghe nhu cầu để gợi ý liệu trình phù hợp với từng khách hàng.</p>
                </div>
            </div>
        </section>

        <section className="about-section about-story">
          <div className="about-story__image">
            <img
              src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop"
              alt="Liệu trình chăm sóc spa"
            />
          </div>

          <div className="about-story__content">
            <span className="about-label">Điểm khác biệt</span>
            <h2>Trải nghiệm giản dị, tinh tế và dễ chịu</h2>

            <p>
              Serenity Spa không chạy theo sự cầu kỳ quá mức. Chúng tôi tập trung
              vào cảm giác thật của khách hàng: dễ chịu khi bước vào, thoải mái
              trong suốt liệu trình và hài lòng khi rời đi.
            </p>

            <ul>
              <li>Không gian sạch sẽ, nhẹ nhàng và riêng tư.</li>
              <li>Quy trình chăm sóc rõ ràng, dễ hiểu.</li>
              <li>Đặt lịch nhanh chóng, tiết kiệm thời gian.</li>
              <li>Luôn tư vấn trước khi thực hiện dịch vụ.</li>
            </ul>
          </div>
        </section>

        <section className="about-contact">
          <div>
            <span className="about-label">Liên hệ</span>
            <h2>Serenity Spa luôn sẵn sàng hỗ trợ bạn</h2>
          </div>

          <div className="about-contact__list">
            <div>
              <h3>Địa chỉ</h3>
              <p>123 Nguyễn Văn Linh, Quận 7, TP.HCM</p>
            </div>

            <div>
              <h3>Hotline</h3>
              <p>0909 123 456</p>
            </div>

            <div>
              <h3>Email</h3>
              <p>serenityspa@gmail.com</p>
            </div>

            <div>
              <h3>Giờ mở cửa</h3>
              <p>Thứ 2 - Chủ nhật: 08:00 - 21:00</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default AboutPage
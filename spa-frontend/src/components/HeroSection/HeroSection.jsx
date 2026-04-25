import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import { Link } from "react-router-dom"
import banner1 from "../../assets/images/banner1.png"
import banner2 from "../../assets/images/banner2.png"
import banner3 from "../../assets/images/banner3.png"
import "./HeroSection.css"

const bannerData = [
  {
    id: 1,
    image: banner1,
    badge: "ĐÁNH THỨC VẺ ĐẸP TỰ NHIÊN",
    title: "Thư giãn tuyệt đối",
    highlight: "cho tâm hồn bạn",
    description:
      "Trải nghiệm không gian yên tĩnh và các liệu trình chăm sóc sắc đẹp cao cấp, giúp bạn tái tạo năng lượng sau những ngày làm việc căng thẳng.",
    primaryButton: "Đặt lịch ngay",
    secondaryButton: "Xem dịch vụ",
  },
  {
    id: 2,
    image: banner2,
    badge: "ƯU ĐÃI DÀNH CHO KHÁCH MỚI",
    title: "Ưu đãi hấp dẫn",
    highlight: "cho lần đầu trải nghiệm",
    description:
      "Đặt lịch ngay hôm nay để nhận ưu đãi đặc biệt cho các liệu trình chăm sóc da, massage thư giãn và gội đầu dưỡng sinh.",
    primaryButton: "Nhận ưu đãi",
    secondaryButton: "Xem chi tiết",
  },
  {
    id: 3,
    image: banner3,
    badge: "ĐẶT LỊCH ONLINE NHANH CHÓNG",
    title: "Chọn dịch vụ dễ dàng",
    highlight: "đặt lịch chỉ trong vài bước",
    description:
      "Khám phá danh sách dịch vụ nổi bật, lựa chọn khung giờ phù hợp và xác nhận lịch hẹn nhanh chóng ngay trên hệ thống.",
    primaryButton: "Đặt lịch online",
    secondaryButton: "Khám phá thêm",
  },
]

function HeroSection() {
  return (
    <section className="hero-slider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="hero-swiper"
      >
        {bannerData.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="hero-slide"
              style={{
                backgroundImage: `linear-gradient(rgba(60, 55, 52, 0.45), rgba(60, 55, 52, 0.45)), url(${banner.image})`,
              }}
            >
              <div className="hero-slide__content">
                <span className="hero-slide__badge">{banner.badge}</span>

                <h1 className="hero-slide__title">
                  {banner.title}
                  <span>{banner.highlight}</span>
                </h1>

                <p className="hero-slide__description">{banner.description}</p>

                <div className="hero-slide__actions">
                  <Link to="/dat-lich" className="hero-slide__btn hero-slide__btn--primary">
                    {banner.primaryButton}
                  </Link>

                  <Link to="/dich-vu" className="hero-slide__btn hero-slide__btn--secondary">
                    {banner.secondaryButton}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default HeroSection
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import ServiceCard from "../../../components/ServiceCard/ServiceCard"
import ServiceReviewSection from "../../../components/ServiceReviewSection/ServiceReviewSection"

import { services, formatPrice } from "../../../data/serviceData"

import "./ServiceDetailPage.css"

function ServiceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const service = services.find(
    (item) =>
      item.isActive && (item.slug === slug || String(item.id) === String(slug))
  )

  const galleryImages = service?.images?.length
    ? service.images
    : service?.image
    ? [service.image]
    : []

  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || "")

  const selectedImageIndex = galleryImages.findIndex(
    (image) => image === selectedImage
    )

    const handlePrevImage = () => {
    const currentIndex = selectedImageIndex === -1 ? 0 : selectedImageIndex
    const prevIndex =
        currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1

    setSelectedImage(galleryImages[prevIndex])
    }

    const handleNextImage = () => {
    const currentIndex = selectedImageIndex === -1 ? 0 : selectedImageIndex
    const nextIndex =
        currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1

    setSelectedImage(galleryImages[nextIndex])
    }

    const relatedServices = service
    ? services
        .filter(
            (item) =>
            item.isActive &&
            item.id !== service.id &&
            item.category === service.category
        )
        .slice(0, 3)
    : []

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} size={17} fill="currentColor" />
    ))
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <Header />

        <main className="service-detail-empty">
          <h2>Không tìm thấy dịch vụ</h2>
          <p>Dịch vụ này có thể đã ngừng hoạt động hoặc không tồn tại.</p>

          <button type="button" onClick={() => navigate("/dich-vu")}>
            Quay lại danh sách dịch vụ
          </button>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="service-detail-page">
      <Header />

      <main className="service-detail-main">
        <button className="service-back-link"
          onClick={() => navigate("/dich-vu")}
          >
          <span>←</span>
          Quay lại danh sách dịch vụ
        </button>
        <section className="service-detail-content">
          <div className="service-detail-container">
            <div className="service-detail-product">

              <div className="service-gallery">
                <div className="service-gallery__main">
                    <img src={selectedImage} alt={service.title} />

                    {galleryImages.length > 1 && (
                        <>
                        <button
                            type="button"
                            className="service-gallery__nav service-gallery__nav--prev"
                            onClick={handlePrevImage}
                            aria-label="Ảnh trước"
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="service-gallery__nav service-gallery__nav--next"
                            onClick={handleNextImage}
                            aria-label="Ảnh sau"
                        >
                            ›
                        </button>
                        </>
                    )}
                </div>

                <div className="service-gallery__thumbs">
                  {galleryImages.map((image, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`service-gallery__thumb ${
                        selectedImage === image ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img src={image} alt={`${service.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="service-info">
                <div className="service-info__top">
                  <span className="service-info__category">
                    <Tag size={16} />
                    {service.category}
                  </span>

                  <div className="service-info__rating">
                    <span>{renderStars()}</span>
                    <strong>4.9/5</strong>
                  </div>
                </div>

                <h1>{service.title}</h1>

                <p className="service-info__desc">{service.description}</p>

                <div className="service-summary">

                    <div className="service-summary__item">
                        <span className="label">Thời gian</span>

                        <div className="value duration">
                            <Clock size={20}/>
                            <strong>{service.duration} phút</strong>
                        </div>
                    </div>


                    <div className="service-summary__item">
                        <span className="label">Giá dịch vụ</span>

                        <div className="value price">
                            <strong>{formatPrice(service.price)}</strong>
                        </div>
                    </div>

                </div>

                <div className="service-info__commitments">
                  <div>
                    <Sparkles size={17} />
                    Kỹ thuật viên chuyên môn
                  </div>

                  <div>
                    <ShieldCheck size={17} />
                    Sản phẩm an toàn, rõ nguồn gốc
                  </div>

                  <div>
                    <Clock size={17} />
                    Nhắc lịch trước buổi hẹn
                  </div>
                </div>

                <div className="service-info__actions">
                  <Link
                    to={`/dat-lich?service=${service.slug}`}
                    className="service-info__book"
                  >
                    Đặt lịch ngay
                  </Link>
                </div>
              </div>
            </div>

            <div className="service-detail-description">
              <h2>Mô tả dịch vụ</h2>
              <p>{service.detailDescription}</p>
            </div>

            <ServiceReviewSection serviceId={service.id} />

            {relatedServices.length > 0 && (
              <section className="service-related">
                <div className="service-related__header">
                  <h2>Dịch vụ liên quan</h2>
                  <Link to="/dich-vu">Xem tất cả</Link>
                </div>

                <div className="service-related__grid">
                  {relatedServices.map((item) => (
                    <ServiceCard key={item.id} service={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default ServiceDetailPage
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  Clock,
  Loader2,
  Minus,
  Plus,
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

import {
  getServiceDetailApi,
  getServiceReviewsApi,
} from "../../../services/serviceApi"
import { getCurrentUser } from "../../../services/authApi"

import "./ServiceDetailPage.css"

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function ServiceDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [service, setService] = useState(null)
  const [reviewData, setReviewData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  })

  const [selectedImage, setSelectedImage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [serviceQuantity, setServiceQuantity] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const [serviceData, reviews] = await Promise.all([
          getServiceDetailApi(slug),
          getServiceReviewsApi(slug),
        ])

        setService(serviceData)
        setReviewData(reviews)

        const firstImage =
          serviceData.images?.[0] || serviceData.image || ""

        setSelectedImage(firstImage)
      } catch (error) {
        console.error(error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceDetail()
  }, [slug])

  const galleryImages = useMemo(() => {
    if (!service) return []

    if (service.images?.length > 0) return service.images

    if (service.image) return [service.image]

    return []
  }, [service])

  const selectedImageIndex = galleryImages.findIndex(
    (image) => image === selectedImage
  )

  const handlePrevImage = () => {
    if (galleryImages.length === 0) return

    const currentIndex = selectedImageIndex === -1 ? 0 : selectedImageIndex

    const prevIndex =
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1

    setSelectedImage(galleryImages[prevIndex])
  }

  const handleNextImage = () => {
    if (galleryImages.length === 0) return

    const currentIndex = selectedImageIndex === -1 ? 0 : selectedImageIndex

    const nextIndex =
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1

    setSelectedImage(galleryImages[nextIndex])
  }

  const renderStars = (rating = 5) => {
    const roundedRating = Math.round(Number(rating || 0))

    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={17}
        fill={index < roundedRating ? "currentColor" : "none"}
      />
    ))
  }

  const handleDecreaseQuantity = () => {
    setServiceQuantity((prev) => {
      if (prev <= 1) return 1
      return prev - 1
    })
  }

  const handleIncreaseQuantity = () => {
    setServiceQuantity((prev) => prev + 1)
  }

  const handleBookingNow = () => {
    const currentUser = getCurrentUser()

    if (!currentUser?.maTK) {
      navigate("/dang-nhap")
      return
    }

    navigate(`/dat-lich?service=${service.id}&quantity=${serviceQuantity}&from=detail`)
  }

  if (isLoading) {
    return (
      <div className="service-detail-page">
        <Header />

        <main className="service-detail-empty">
          <Loader2 size={36} className="service-detail-loading-icon" />
          <h2>Đang tải chi tiết dịch vụ</h2>
          <p>Vui lòng chờ trong giây lát.</p>
        </main>

        <Footer />
      </div>
    )
  }

  if (hasError || !service) {
    return (
      <div className="service-detail-page">
        <Header />

        <main className="service-detail-empty">
          <AlertCircle size={38} />
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
        <button
          type="button"
          className="service-back-link"
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
                  <img
                    src={selectedImage || service.image}
                    alt={service.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80"
                    }}
                  />

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

                {galleryImages.length > 1 && (
                  <div className="service-gallery__thumbs">
                    {galleryImages.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className={`service-gallery__thumb ${
                          selectedImage === image ? "active" : ""
                        }`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${service.title} ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="service-info">
                <div className="service-info__top">
                  <span className="service-info__category">
                    <Tag size={16} />
                    {service.category}
                  </span>

                  <div className="service-info__rating">
                    <span>{renderStars(reviewData.averageRating)}</span>
                    <strong>
                      {reviewData.averageRating || 0}/5
                    </strong>
                  </div>
                </div>

                <h1>{service.title}</h1>

                <p className="service-info__desc">{service.description}</p>

                <div className="service-summary">
                  <div className="service-summary__item">
                    <span className="label">Thời gian</span>

                    <div className="value duration">
                      <Clock size={20} />
                      <strong>{service.duration} phút</strong>
                    </div>
                  </div>

                  <div className="service-summary__item">
                    <span className="label">Giá dịch vụ</span>

                    <div className="value price">
                      <strong>{formatPrice(service.price)}</strong>
                    </div>
                  </div>

                  <div className="service-summary__item service-summary__item--quantity">
                    <span className="label">Số lượng người</span>

                    <div className="service-detail-quantity__control">
                      <button
                        type="button"
                        onClick={handleDecreaseQuantity}
                        disabled={serviceQuantity <= 1}
                      >
                        <Minus size={16} />
                      </button>

                      <strong>{serviceQuantity}</strong>

                      <button type="button" onClick={handleIncreaseQuantity}>
                        <Plus size={16} />
                      </button>
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
                  <button
                    type="button"
                    className="service-info__book"
                    onClick={handleBookingNow}
                  >
                    Đặt lịch ngay
                  </button>
                </div>
              </div>
            </div>

            <div className="service-detail-description">
              <h2>MÔ TẢ DỊCH VỤ</h2>
              <p>{service.detailDescription || service.description}</p>
            </div>

            <ServiceReviewSection reviewData={reviewData} />

            {service.relatedServices?.length > 0 && (
              <section className="service-related">
                <div className="service-related__header">
                  <h2>DỊCH VỤ LIÊN QUAN</h2>
                  <Link to="/dich-vu">Xem tất cả</Link>
                </div>

                <div className="service-related__grid">
                  {service.relatedServices.map((item) => (
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
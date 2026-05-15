import { useNavigate } from "react-router-dom"
import { Clock3, Tag } from "lucide-react"
import { getCurrentUser } from "../../services/authApi"
import "./ServiceCard.css"

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function ServiceCard({ service }) {
  const navigate = useNavigate()

  const handleOpenDetail = () => {
    navigate(`/dich-vu/${service.id}`)
  }

  const handleBooking = (e) => {
    e.stopPropagation()

    const currentUser = getCurrentUser()

    if (!currentUser?.maTK) {
      navigate("/dang-nhap")
      return
    }

    navigate(`/dat-lich?service=${service.id}&from=list`)
  }

  return (
    <article
      className="service-card"
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return

        if (e.key === "Enter") {
          handleOpenDetail()
        }
      }}
    >
      <div className="service-card__image-wrapper">
        <img
          src={service.image}
          alt={service.title}
          className="service-card__image"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80"
          }}
        />

        <span className="service-card__category">
          <Tag size={13} />
          {service.category}
        </span>
      </div>

      <div className="service-card__content">
        <h3 className="service-card__title" title={service.title}>
          {service.title}
        </h3>

        <p className="service-card__description">{service.description}</p>

        <div className="service-card__footer">
          <div>
            <p className="service-card__price">{formatPrice(service.price)}</p>

            <p className="service-card__duration">
              <Clock3 size={14} />
              <span>{service.duration} phút</span>
            </p>
          </div>

          <div className="service-card__actions">
            <button
              type="button"
              className="service-card__button service-card__button--primary"
              onClick={handleBooking}
            >
              Đặt lịch
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
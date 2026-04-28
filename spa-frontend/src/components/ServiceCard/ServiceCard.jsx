import { Link } from "react-router-dom"
import { Clock3, Tag } from "lucide-react"
import { formatPrice } from "../../data/serviceData"
import "./ServiceCard.css"

function ServiceCard({ service }) {
  return (
    <Link to={`/dich-vu/${service.id}`} className="service-card">
      <article>
        <div className="service-card__image-wrapper">
          <img
            src={service.image}
            alt={service.title}
            className="service-card__image"
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
              <Link
                to="/dat-lich"
                className="service-card__button service-card__button--primary"
                onClick={(e) => e.stopPropagation()}
              >
                Đặt lịch
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ServiceCard
import { ArrowRight, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import ServiceCard from "../ServiceCard/ServiceCard"
import "./ServiceSection.css"

function ServiceSection({
  title = "Dịch vụ mới",
  subtitle = "",
  services = [],
  isLoading = false,
  errorMessage = "",
  variant = "",
}) {
  const displayServices = services
    .filter((service) => service.isActive !== false)
    .slice(0, 8)

  const isHomeVariant = variant === "home"

  return (
    <section
      className={`service-section ${
        isHomeVariant ? "service-section--home" : ""
      }`}
    >
      <div className="service-section__container">
        <div className="service-section__top">
          <div className="service-section__heading">
            <span className="service-section__label">Best choice services</span>
            <h2 className="service-section__title">{title}</h2>

            {subtitle && (
              <p className="service-section__subtitle">{subtitle}</p>
            )}
          </div>

          <Link to="/dich-vu" className="service-section__view-all">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="service-section__state">
            <Loader2 size={30} className="service-section__loading-icon" />
            <p>Đang tải dịch vụ mới...</p>
          </div>
        ) : errorMessage ? (
          <div className="service-section__state service-section__state--error">
            <p>{errorMessage}</p>
          </div>
        ) : displayServices.length === 0 ? (
          <div className="service-section__state">
            <p>Chưa có dịch vụ mới.</p>
          </div>
        ) : (
          <div className="service-section__grid">
            {displayServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                variant={isHomeVariant ? "home" : ""}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServiceSection
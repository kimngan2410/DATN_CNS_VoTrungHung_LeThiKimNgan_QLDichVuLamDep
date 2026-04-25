import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { services } from "../../data/serviceData"
import ServiceCard from "../ServiceCard/ServiceCard"
import "./ServiceSection.css"

function ServiceSection() {
  const featuredServices = services.filter(
    (service) => service.isFeatured && service.isActive
  )

  return (
    <section className="service-section">
      <div className="service-section__container">
        <div className="service-section__top">
          <div>
            <h2 className="service-section__title">Dịch vụ nổi bật</h2>
            <div className="service-section__line" />
          </div>

          <Link to="/dich-vu" className="service-section__view-all">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>

        <div className="service-section__grid">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceSection
import { Star } from "lucide-react"
import { testimonials } from "../../data/homeData"
import "./TestimonialSection.css"

function TestimonialSection() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-section__container">
        <h2 className="testimonial-section__title">Đánh giá từ khách hàng</h2>
        <div className="testimonial-section__line" />

        <div className="testimonial-section__grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>

              <p className="testimonial-card__content">“{item.content}”</p>

              <div className="testimonial-card__user">
                <div className="testimonial-card__avatar">{item.name.charAt(0)}</div>
                <div>
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection

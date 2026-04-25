import { Sparkles, Heart, Shield } from "lucide-react"
import { features } from "../../data/homeData"
import "./FeatureSection.css"

const iconMap = {
  sparkles: Sparkles,
  heart: Heart,
  shield: Shield,
}

function FeatureSection() {
  return (
    <section className="feature-section">
      <div className="feature-section__container">
        <h2 className="feature-section__title">Tại sao chọn Serenity Spa?</h2>
        <div className="feature-section__line" />

        <div className="feature-section__grid">
          {features.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <div key={item.title} className="feature-card">
                <div className="feature-card__icon">
                  <Icon size={24} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureSection

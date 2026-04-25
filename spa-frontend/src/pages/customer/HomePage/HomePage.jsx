import Header from "../../../components/Header/Header"
import HeroSection from "../../../components/HeroSection/HeroSection"
import FeatureSection from "../../../components/FeatureSection/FeatureSection"
import ServiceSection from "../../../components/ServiceSection/ServiceSection"
import TestimonialSection from "../../../components/TestimonialSection/TestimonialSection"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import "./HomePage.css"

function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <FeatureSection />
      <ServiceSection />
      <TestimonialSection />
      <Footer />
      <FloatingChat />
    </div>
  )
}

export default HomePage

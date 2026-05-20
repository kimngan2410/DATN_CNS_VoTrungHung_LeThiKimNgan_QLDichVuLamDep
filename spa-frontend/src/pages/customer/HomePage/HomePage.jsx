import { useEffect, useState } from "react"

import Header from "../../../components/Header/Header"
import HeroSection from "../../../components/HeroSection/HeroSection"
import FeatureSection from "../../../components/FeatureSection/FeatureSection"
import ServiceSection from "../../../components/ServiceSection/ServiceSection"
import TestimonialSection from "../../../components/TestimonialSection/TestimonialSection"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import { getHomeDataApi } from "../../../services/homeApi"

import "./HomePage.css"

function HomePage() {
  const [homeData, setHomeData] = useState({
    newServices: [],
    categories: [],
    testimonials: [],
  })

  const [isLoadingHome, setIsLoadingHome] = useState(true)
  const [homeError, setHomeError] = useState("")

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoadingHome(true)
        setHomeError("")

        const data = await getHomeDataApi()

        setHomeData(data)
      } catch (error) {
        setHomeError(error.message || "Không thể tải dữ liệu trang chủ.")
      } finally {
        setIsLoadingHome(false)
      }
    }

    fetchHomeData()
  }, [])

  return (
    <div className="home-page">
      <Header />

      <HeroSection />

      <FeatureSection />

      <ServiceSection
        title="Dịch vụ mới"
        services={homeData.newServices}
        isLoading={isLoadingHome}
        errorMessage={homeError}
      />

      <TestimonialSection
        testimonials={homeData.testimonials}
        isLoading={isLoadingHome}
      />

      <Footer />

      <FloatingChat />
    </div>
  )
}

export default HomePage
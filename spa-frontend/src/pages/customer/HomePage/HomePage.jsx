import { useEffect, useState } from "react"
import { Leaf, ShieldCheck, Sparkles, UsersRound } from "lucide-react"

import Header from "../../../components/Header/Header"
import HeroSection from "../../../components/HeroSection/HeroSection"
import ServiceSection from "../../../components/ServiceSection/ServiceSection"
import TestimonialSection from "../../../components/TestimonialSection/TestimonialSection"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"

import { getHomeDataApi } from "../../../services/homeApi"
import { searchCustomerServicesApi } from "../../../services/customerServiceSearchApi"

import "./HomePage.css"

const whyChooseItems = [
  {
    icon: <Leaf />,
    title: "Không gian thư giãn",
    description:
      "Không gian nhẹ nhàng, yên tĩnh, giúp bạn tạm gác lại mệt mỏi và tận hưởng cảm giác thư thái.",
  },
  {
    icon: <ShieldCheck />,
    title: "Sản phẩm an toàn",
    description:
      "Ưu tiên sản phẩm chất lượng, phù hợp với làn da và quy trình chăm sóc rõ ràng.",
  },
  {
    icon: <UsersRound />,
    title: "Kỹ thuật viên tận tâm",
    description:
      "Đội ngũ kỹ thuật viên được đào tạo bài bản, thao tác nhẹ nhàng và luôn lắng nghe khách hàng.",
  },
  {
    icon: <Sparkles />,
    title: "Trải nghiệm tinh tế",
    description:
      "Mỗi liệu trình được chuẩn bị kỹ lưỡng để mang đến sự thoải mái, dễ chịu và hài lòng.",
  },
]

function HomePage() {
  const [homeData, setHomeData] = useState({
    newServices: [],
    categories: [],
    testimonials: [],
  })

  const [homeServices, setHomeServices] = useState([])
  const [isLoadingHome, setIsLoadingHome] = useState(true)
  const [homeError, setHomeError] = useState("")

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoadingHome(true)
        setHomeError("")

        const [homeResult, serviceResult] = await Promise.all([
          getHomeDataApi(),
          searchCustomerServicesApi({
            keyword: "",
            category: "Tất cả",
            priceRange: "Tất cả mức giá",
            duration: "Tất cả thời lượng",
            sortBy: "default",
            page: 1,
            limit: 8,
          }),
        ])

        setHomeData(homeResult)

        setHomeServices(
          Array.isArray(serviceResult?.services) ? serviceResult.services : []
        )
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

      <section className="home-why">
        <div className="home-why__container">
          <div className="home-why__heading">
            <span className="home-section-label">Tại sao chọn chúng tôi</span>
            <h2>Tận hưởng sự thư giãn đúng nghĩa tại Serenity Spa</h2>
            <p>
              Serenity Spa mang đến trải nghiệm chăm sóc nhẹ nhàng, tinh tế và
              chuyên nghiệp, giúp bạn tái tạo năng lượng sau những ngày bận rộn.
            </p>
          </div>

          <div className="home-why__grid">
            {whyChooseItems.map((item) => (
              <div className="home-why__card" key={item.title}>
                <div className="home-why__icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceSection
        title="Dịch vụ mới"
        subtitle="Khám phá những liệu trình chăm sóc mới nhất tại Serenity Spa"
        services={homeServices}
        isLoading={isLoadingHome}
        errorMessage={homeError}
        variant="home"
      />

      <section className="home-experience">
        <div className="home-experience__container">
          <div className="home-experience__image">
            <img
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Trải nghiệm Serenity Spa"
            />
          </div>

          <div className="home-experience__content">
            <span className="home-section-label">Serenity Spa</span>
            <h2>Chăm sóc cơ thể, làn da và tinh thần</h2>
            <p>
              Chúng tôi tin rằng một buổi spa tốt không chỉ là làm đẹp, mà còn
              là khoảng thời gian để bạn lắng nghe cơ thể và tìm lại sự cân bằng.
            </p>

            <div className="home-experience__list">
              <div>
                <strong>01</strong>
                <span>Tư vấn liệu trình phù hợp</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Không gian riêng tư, sạch sẽ</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Đặt lịch nhanh chóng, tiện lợi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  SlidersHorizontal,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import ServiceCard from "../../../components/ServiceCard/ServiceCard"

import {
  services,
  serviceCategories,
  servicePriceRanges,
  serviceDurations,
  sortOptions,
} from "../../../data/serviceData"

import "./ServiceListPage.css"

const ITEMS_PER_PAGE = 6

function ServiceListPage() {
  const location = useLocation()

  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [selectedPriceRange, setSelectedPriceRange] = useState("Tất cả mức giá")
  const [selectedDuration, setSelectedDuration] = useState("Tất cả thời lượng")
  const [sortBy, setSortBy] = useState("default")
  const [currentPage, setCurrentPage] = useState(1)

  const hasError = false

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const keywordFromHeader = params.get("q") || ""
    setAppliedKeyword(keywordFromHeader)
    setCurrentPage(1)
  }, [location.search])

  const activeServices = useMemo(() => {
    return services.filter((service) => service.isActive)
  }, [])

  const filteredServices = useMemo(() => {
    let result = [...activeServices]

    if (appliedKeyword.trim()) {
      const keyword = appliedKeyword.toLowerCase().trim()
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(keyword) ||
          service.category.toLowerCase().includes(keyword) ||
          service.description.toLowerCase().includes(keyword)
      )
    }

    if (selectedCategory !== "Tất cả") {
      result = result.filter((service) => service.category === selectedCategory)
    }

    if (selectedPriceRange !== "Tất cả mức giá") {
      if (selectedPriceRange === "Dưới 500.000đ") {
        result = result.filter((service) => service.price < 500000)
      } else if (selectedPriceRange === "500.000đ - 1.000.000đ") {
        result = result.filter(
          (service) => service.price >= 500000 && service.price <= 1000000
        )
      } else if (selectedPriceRange === "Trên 1.000.000đ") {
        result = result.filter((service) => service.price > 1000000)
      }
    }

    if (selectedDuration !== "Tất cả thời lượng") {
      if (selectedDuration === "Dưới 60 phút") {
        result = result.filter((service) => service.duration < 60)
      } else if (selectedDuration === "60 - 90 phút") {
        result = result.filter(
          (service) => service.duration >= 60 && service.duration <= 90
        )
      } else if (selectedDuration === "Trên 90 phút") {
        result = result.filter((service) => service.duration > 90)
      }
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [
    activeServices,
    appliedKeyword,
    selectedCategory,
    selectedPriceRange,
    selectedDuration,
    sortBy,
  ])

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE)

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredServices, currentPage])

  const handleResetFilters = () => {
    setAppliedKeyword("")
    setSelectedCategory("Tất cả")
    setSelectedPriceRange("Tất cả mức giá")
    setSelectedDuration("Tất cả thời lượng")
    setSortBy("default")
    setCurrentPage(1)
  }

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="service-page">
      <Header />

      <main className="service-page__main">
        <section className="service-page__banner">
          <div className="service-page__banner-overlay">
            <div className="service-page__banner-content">
              <h1>Dịch vụ</h1>

              <div className="service-page__breadcrumb">
                <span>TRANG CHỦ</span>
                <span className="service-page__breadcrumb-separator">›</span>
                <strong>DỊCH VỤ</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="service-page__content">
          <div className="service-page__container">
            <aside className="service-filter">
              <div className="service-filter__title">
                <SlidersHorizontal size={18} />
                <span>Bộ lọc</span>
              </div>

              <div className="service-filter__group">
                <h3>Danh mục</h3>
                {serviceCategories.map((option) => (
                  <label key={option} className="service-filter__option">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === option}
                      onChange={() => {
                        setSelectedCategory(option)
                        setCurrentPage(1)
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              <div className="service-filter__group">
                <h3>Mức giá</h3>
                {servicePriceRanges.map((option) => (
                  <label key={option} className="service-filter__option">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === option}
                      onChange={() => {
                        setSelectedPriceRange(option)
                        setCurrentPage(1)
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              <div className="service-filter__group">
                <h3>Thời lượng</h3>
                {serviceDurations.map((option) => (
                  <label key={option} className="service-filter__option">
                    <input
                      type="radio"
                      name="duration"
                      checked={selectedDuration === option}
                      onChange={() => {
                        setSelectedDuration(option)
                        setCurrentPage(1)
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="service-filter__reset"
                onClick={handleResetFilters}
              >
                Xóa bộ lọc
              </button>
            </aside>

            <div className="service-list">
              {!hasError && activeServices.length > 0 && (
                <div className="service-list__toolbar">
                  <p>
                    Hiển thị <strong>{filteredServices.length}</strong> dịch vụ
                  </p>

                  <div className="service-list__sort">
                    <label>Sắp xếp</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setCurrentPage(1)
                      }}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {hasError ? (
                <div className="service-state service-state--error">
                  <AlertCircle size={32} />
                  <h3>Không thể truy xuất dữ liệu</h3>
                  <p>Vui lòng thử lại sau.</p>
                </div>
              ) : activeServices.length === 0 ? (
                <div className="service-state">
                  <AlertCircle size={32} />
                  <h3>Hiện chưa có dịch vụ nào</h3>
                  <p>Hệ thống chưa có dữ liệu dịch vụ để hiển thị.</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="service-state">
                  <AlertCircle size={32} />
                  <h3>Không tìm thấy dịch vụ phù hợp</h3>
                  <p>Vui lòng thử từ khóa khác hoặc thay đổi bộ lọc.</p>
                </div>
              ) : (
                <>
                  <div className="service-list__grid">
                    {paginatedServices.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="service-pagination">
                      <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="service-pagination__btn"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          className={`service-pagination__number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="service-pagination__btn"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingChat />
    </div>
  )
}

export default ServiceListPage
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  SlidersHorizontal,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
} from "lucide-react"

import Header from "../../../components/Header/Header"
import Footer from "../../../components/Footer/Footer"
import FloatingChat from "../../../components/FloatingChat/FloatingChat"
import ServiceCard from "../../../components/ServiceCard/ServiceCard"
import { getServiceCategoriesApi } from "../../../services/serviceApi"
import { searchCustomerServicesApi } from "../../../services/customerServiceSearchApi"

import "./ServiceListPage.css"

const ITEMS_PER_PAGE = 9

const servicePriceRanges = [
  "Tất cả mức giá",
  "Dưới 500.000đ",
  "500.000đ - 1.000.000đ",
  "Trên 1.000.000đ",
]

const serviceDurations = [
  "Tất cả thời lượng",
  "Dưới 60 phút",
  "60 - 90 phút",
  "Trên 90 phút",
]

const serviceRatings = [
  {
    label: "5 sao",
    value: "5",
    stars: 5,
    filled: 5,
    suffix: "",
  },
  {
    label: "Từ 4 sao trở lên",
    value: "4",
    stars: 5,
    filled: 4,
    suffix: "trở lên",
  },
  {
    label: "Từ 3 sao trở lên",
    value: "3",
    stars: 5,
    filled: 3,
    suffix: "trở lên",
  },
  {
    label: "Từ 2 sao trở lên",
    value: "2",
    stars: 5,
    filled: 2,
    suffix: "trở lên",
  },
  {
    label: "Từ 1 sao trở lên",
    value: "1",
    stars: 5,
    filled: 1,
    suffix: "trở lên",
  },
]

const sortOptions = [
  {
    value: "default",
    label: "Mặc định",
  },
  {
    value: "price-asc",
    label: "Giá tăng dần",
  },
  {
    value: "price-desc",
    label: "Giá giảm dần",
  },
]

function ServiceListPage() {
  const location = useLocation()

  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [selectedPriceRange, setSelectedPriceRange] = useState("Tất cả mức giá")
  const [selectedDuration, setSelectedDuration] = useState("Tất cả thời lượng")
  const [selectedRating, setSelectedRating] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("default")
  const [currentPage, setCurrentPage] = useState(1)

  const [totalServices, setTotalServices] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const keywordFromHeader = params.get("q") || ""

    setAppliedKeyword(keywordFromHeader)
    setCurrentPage(1)
  }, [location.search])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getServiceCategoriesApi()
        setCategories(Array.isArray(categoryData) ? categoryData : [])
      } catch (error) {
        console.error(error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchSearchResult = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const data = await searchCustomerServicesApi({
          keyword: appliedKeyword,
          category: selectedCategory,
          priceRange: selectedPriceRange,
          duration: selectedDuration,
          rating: selectedRating,
          sortBy,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        })

        setServices(Array.isArray(data?.services) ? data.services : [])
        setTotalServices(Number(data?.total || 0))
        setTotalPages(Number(data?.totalPages || 0))
      } catch (error) {
        console.error(error)
        setHasError(true)
        setServices([])
        setTotalServices(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResult()
    }, [
    appliedKeyword,
    selectedCategory,
    selectedPriceRange,
    selectedDuration,
    selectedRating,
    sortBy,
    currentPage,
  ])

  const serviceCategories = useMemo(() => {
    return ["Tất cả", ...categories.map((category) => category.tenDM)]
  }, [categories])

  const handleResetFilters = () => {
    setAppliedKeyword("")
    setSelectedCategory("Tất cả")
    setSelectedPriceRange("Tất cả mức giá")
    setSelectedDuration("Tất cả thời lượng")
    setSelectedRating("Tất cả")
    setSortBy("default")
    setCurrentPage(1)

    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.delete("q")
    window.history.replaceState({}, "", currentUrl.toString())
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return

    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

              <div className="service-filter__group">
                <h3>Đánh Giá</h3>

                {serviceRatings.map((option) => (
                  <label key={option.value} className="service-filter__option">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === option.value}
                      onChange={() => {
                        setSelectedRating(option.value)
                        setCurrentPage(1)
                      }}
                    />

                    {option.value === "Tất cả" ? (
                      <span>{option.label}</span>
                    ) : (
                      <span className="service-filter__rating-label">
                        <span className="service-filter__rating-stars">
                          {Array.from({ length: option.stars }, (_, index) => {
                            const isFilled = index < option.filled

                            return (
                              <Star
                                key={index}
                                size={16}
                                fill={isFilled ? "currentColor" : "none"}
                              />
                            )
                          })}
                        </span>

                        {option.suffix && (
                          <span className="service-filter__rating-suffix">
                            {option.suffix}
                          </span>
                        )}
                      </span>
                    )}
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
              {!hasError && !isLoading && totalServices > 0 && (
                <div className="service-list__toolbar">
                  <p>
                    Hiển thị <strong>{totalServices}</strong> dịch vụ
                    {appliedKeyword && (
                      <>
                        {" "}
                        với từ khóa <strong>"{appliedKeyword}"</strong>
                      </>
                    )}
                  </p>

                  <div className="service-list__sort">
                    <label>Sắp xếp</label>

                    <select
                      value={sortBy}
                      onChange={(event) => {
                        setSortBy(event.target.value)
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

              {isLoading ? (
                <div className="service-state">
                  <Loader2 size={34} className="service-state__loading-icon" />
                  <h3>Đang tải dịch vụ</h3>
                  <p>Vui lòng chờ trong giây lát.</p>
                </div>
              ) : hasError ? (
                <div className="service-state service-state--error">
                  <AlertCircle size={32} />
                  <h3>Không thể truy xuất dữ liệu</h3>
                  <p>Vui lòng thử lại sau.</p>
                </div>
              ) : totalServices === 0 &&
                !appliedKeyword &&
                selectedCategory === "Tất cả" &&
                selectedPriceRange === "Tất cả mức giá" &&
                selectedDuration === "Tất cả thời lượng" &&
                selectedRating === "Tất cả" ? (
                <div className="service-state">
                  <AlertCircle size={32} />
                  <h3>Hiện chưa có dịch vụ nào</h3>
                  <p>Hệ thống chưa có dữ liệu dịch vụ để hiển thị.</p>
                </div>
              ) : services.length === 0 ? (
                <div className="service-state">
                  <AlertCircle size={32} />
                  <h3>Không tìm thấy dịch vụ phù hợp</h3>
                  <p>Vui lòng thử từ khóa khác hoặc thay đổi bộ lọc.</p>
                </div>
              ) : (
                <>
                  <div className="service-list__grid">
                    {services.map((service) => (
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
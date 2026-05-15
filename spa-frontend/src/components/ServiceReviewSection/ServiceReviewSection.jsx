import { useMemo, useState } from "react"
import { Star } from "lucide-react"
import "./ServiceReviewSection.css"

const FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "5 Sao", value: 5 },
  { label: "4 Sao", value: 4 },
  { label: "3 Sao", value: 3 },
  { label: "2 Sao", value: 2 },
  { label: "1 Sao", value: 1 },
  { label: "Có bình luận", value: "comment" },
  { label: "Có hình ảnh", value: "image" },
  { label: "Có phản hồi", value: "reply" },
]

const REVIEWS_PER_PAGE = 3

function ServiceReviewSection({ reviewData }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const reviewsByService = reviewData?.reviews || []
  const averageRating = Number(reviewData?.averageRating || 0).toFixed(1)

  const getFilterCount = (value) => {
    if (value === "all") return reviewsByService.length

    if (value === "comment") {
      return reviewsByService.filter((review) => review.content?.trim()).length
    }

    if (value === "image") {
      return reviewsByService.filter((review) => review.images?.length > 0)
        .length
    }

    if (value === "reply") {
      return reviewsByService.filter((review) => review.reply).length
    }

    return reviewsByService.filter((review) => review.rating === value).length
  }

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") return reviewsByService

    if (activeFilter === "comment") {
      return reviewsByService.filter((review) => review.content?.trim())
    }

    if (activeFilter === "image") {
      return reviewsByService.filter((review) => review.images?.length > 0)
    }

    if (activeFilter === "reply") {
      return reviewsByService.filter((review) => review.reply)
    }

    return reviewsByService.filter((review) => review.rating === activeFilter)
  }, [activeFilter, reviewsByService])

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  )

  const handleFilterChange = (value) => {
    setActiveFilter(value)
    setCurrentPage(1)
  }

  const renderStars = (rating, size = 18) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={size}
        fill={index < rating ? "currentColor" : "none"}
      />
    ))
  }

  if (reviewsByService.length === 0) {
    return (
      <section className="service-review-section">
        <div className="service-review-box">
          <h2>ĐÁNH GIÁ</h2>

          <div className="service-review-empty">
            Chưa có đánh giá nào cho dịch vụ này.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="service-review-section">
      <div className="service-review-box">
        <h2>ĐÁNH GIÁ</h2>

        <div className="service-review-summary">
          <div className="service-review-summary__score">
            <div>
              <strong>{averageRating}</strong>
              <span>trên 5</span>
            </div>

            <div className="service-review-summary__stars">
              {renderStars(Math.round(Number(averageRating)), 24)}
            </div>
          </div>

          <div className="service-review-filter">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={`service-review-filter__btn ${
                  activeFilter === filter.value ? "active" : ""
                }`}
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label} ({getFilterCount(filter.value)})
              </button>
            ))}
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="service-review-empty">
            Không có đánh giá nào phù hợp.
          </div>
        ) : (
          <>
            <div className="service-review-section__list">
              {paginatedReviews.map((review) => (
                <article key={review.id} className="service-review-item">
                  <div className="service-review-item__header">
                    <div className="service-review-item__customer">
                      {review.avatar ? (
                        <img
                          className="service-review-item__avatar"
                          src={review.avatar}
                          alt={review.customerName}
                        />
                      ) : (
                        <div className="service-review-item__avatar">
                          {review.customerName?.charAt(0) || "K"}
                        </div>
                      )}

                      <div>
                        <h3>{review.customerName}</h3>
                        <span>{review.createdAt}</span>
                      </div>
                    </div>

                    <div className="service-review-item__stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {review.content && (
                    <p className="service-review-item__content">
                      {review.content}
                    </p>
                  )}

                  {review.images?.length > 0 && (
                    <div className="service-review-item__images">
                      {review.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.imageUrl}
                          alt="Ảnh đánh giá"
                        />
                      ))}
                    </div>
                  )}

                  {review.reply && (
                    <div className="service-review-item__reply">
                      <strong>Phản hồi từ {review.reply.adminName}</strong>
                      <p>{review.reply.content}</p>
                      <span>{review.reply.createdAt}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="service-review-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={currentPage === page ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default ServiceReviewSection
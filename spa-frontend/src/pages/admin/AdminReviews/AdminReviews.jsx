import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  MessageSquareReply,
  Pencil,
  X,
  Send,
  Star,
  Image as ImageIcon,
  CalendarDays,
  UserRound,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"

import {
  getAdminReviewDetailApi,
  getAdminReviewsApi,
  replyAdminReviewApi,
} from "../../../services/adminReviewApi"

import "./AdminReviews.css"

const statusOptions = ["Đã phản hồi", "Chưa phản hồi"]
const ratingOptions = ["5 sao", "4 sao", "3 sao", "2 sao", "1 sao"]
const timeOptions = ["Tất cả", "Hôm nay", "7 ngày gần đây", "30 ngày gần đây"]

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const isInTimeRange = (dateValue, range) => {
  if (range === "Tất cả") return true

  const reviewDate = new Date(dateValue)
  const now = new Date()

  if (Number.isNaN(reviewDate.getTime())) return true

  const diffTime = now.getTime() - reviewDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  if (range === "Hôm nay") {
    return reviewDate.toDateString() === now.toDateString()
  }

  if (range === "7 ngày gần đây") {
    return diffDays <= 7
  }

  if (range === "30 ngày gần đây") {
    return diffDays <= 30
  }

  return true
}

const getReviewCodeNumber = (review) => {
  const code = review?.maDanhGia || ""
  const numberPart = code.replace(/\D/g, "")

  return Number(numberPart || review?.idDanhGia || 0)
}

const getReviewDateTimestamp = (review) => {
  const date = new Date(review?.ngayDanhGia || "")

  if (Number.isNaN(date.getTime())) return 0

  return date.getTime()
}

const getInitial = (name) => {
  if (!name) return "?"

  return name.trim().charAt(0).toUpperCase()
}

function RatingStars({ value }) {
  return (
    <div className="admin-review-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={16}
          className={index < Number(value || 0) ? "filled" : "empty"}
          fill={index < Number(value || 0) ? "currentColor" : "none"}
        />
      ))}
    </div>
  )
}

function AdminReviews() {
  const [reviews, setReviews] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [ratingFilter, setRatingFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [timeFilter, setTimeFilter] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("default")

  const [selectedReview, setSelectedReview] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [formError, setFormError] = useState("")

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const toastTimeoutRef = useRef(null)

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminReviewsApi()

      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải danh sách đánh giá.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews()
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const showToast = ({
    type = "success",
    title = "Thành công",
    message = "",
  }) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setToast({
      show: true,
      type,
      title,
      message,
    })

    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }))
    }, 3000)
  }

  const closeToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setToast((prev) => ({
      ...prev,
      show: false,
    }))
  }

  const renderToastIcon = () => {
    if (toast.type === "success") {
      return <CheckCircle2 size={22} />
    }

    if (toast.type === "error") {
      return <XCircle size={22} />
    }

    if (toast.type === "warning") {
      return <AlertCircle size={22} />
    }

    return <Info size={22} />
  }

  const filteredReviews = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    const filtered = reviews.filter((review) => {
      const maDanhGia = review.maDanhGia || ""
      const tenKhachHang = review.tenKhachHang || ""
      const tenDichVu = review.tenDichVu || ""
      const noiDung = review.noiDung || ""

      const matchKeyword =
        maDanhGia.toLowerCase().includes(keyword) ||
        tenKhachHang.toLowerCase().includes(keyword) ||
        tenDichVu.toLowerCase().includes(keyword) ||
        noiDung.toLowerCase().includes(keyword)

      const matchRating =
        ratingFilter === "Tất cả" || `${review.soSao} sao` === ratingFilter

      const matchStatus =
        statusFilter === "Tất cả" || review.trangThai === statusFilter

      const matchTime = isInTimeRange(review.ngayDanhGia, timeFilter)

      return matchKeyword && matchRating && matchStatus && matchTime
    })

    if (sortOption === "default") {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const codeA = getReviewCodeNumber(a)
      const codeB = getReviewCodeNumber(b)

      const customerA = (a.tenKhachHang || "").toLowerCase()
      const customerB = (b.tenKhachHang || "").toLowerCase()

      const serviceA = (a.tenDichVu || "").toLowerCase()
      const serviceB = (b.tenDichVu || "").toLowerCase()

      const dateA = getReviewDateTimestamp(a)
      const dateB = getReviewDateTimestamp(b)

      const ratingA = Number(a.soSao || 0)
      const ratingB = Number(b.soSao || 0)

      if (sortOption === "code-desc") return codeB - codeA
      if (sortOption === "code-asc") return codeA - codeB

      if (sortOption === "customer-asc") {
        return customerA.localeCompare(customerB, "vi")
      }

      if (sortOption === "customer-desc") {
        return customerB.localeCompare(customerA, "vi")
      }

      if (sortOption === "service-asc") {
        return serviceA.localeCompare(serviceB, "vi")
      }

      if (sortOption === "rating-desc") return ratingB - ratingA
      if (sortOption === "rating-asc") return ratingA - ratingB

      if (sortOption === "date-desc") return dateB - dateA
      if (sortOption === "date-asc") return dateA - dateB

      return 0
    })
  }, [
    reviews,
    searchText,
    ratingFilter,
    statusFilter,
    timeFilter,
    sortOption,
  ])

  const handleResetFilter = () => {
    setSearchText("")
    setRatingFilter("Tất cả")
    setStatusFilter("Tất cả")
    setTimeFilter("Tất cả")
    setSortOption("default")
  }

  const handleOpenDetail = async (review) => {
    try {
      const detail = await getAdminReviewDetailApi(review.idDanhGia)
      setSelectedReview(detail)
    } catch {
      setSelectedReview(review)
    }
  }

  const handleOpenReply = (review) => {
    setReplyTarget(review)
    setReplyContent(review.phanHoi?.noiDungPhanHoi || "")
    setFormError("")
  }

  const handleCloseReply = () => {
    if (isSaving) return

    setReplyTarget(null)
    setReplyContent("")
    setFormError("")
  }

  const handleSubmitReply = async () => {
    const trimmedReply = replyContent.trim()

    if (!trimmedReply) {
      setFormError("Vui lòng nhập nội dung phản hồi.")
      return
    }

    if (trimmedReply.length > 500) {
      setFormError("Nội dung phản hồi không được vượt quá 500 ký tự.")
      return
    }

    const isEditingReply = replyTarget?.trangThai === "Đã phản hồi"

    try {
      setIsSaving(true)
      setFormError("")

      const updatedReview = await replyAdminReviewApi(replyTarget.idDanhGia, {
        noiDungPhanHoi: trimmedReply,
      })

      setReviews((prev) =>
        prev.map((review) =>
          review.idDanhGia === updatedReview.idDanhGia
            ? updatedReview
            : review
        )
      )

      if (
        selectedReview &&
        selectedReview.idDanhGia === updatedReview.idDanhGia
      ) {
        setSelectedReview(updatedReview)
      }

      handleCloseReply()

      showToast({
        type: "success",
        title: isEditingReply ? "Cập nhật thành công" : "Phản hồi thành công",
        message: isEditingReply
          ? "Phản hồi đánh giá đã được cập nhật."
          : "Phản hồi đánh giá đã được gửi.",
      })
    } catch (error) {
      const message = error.message || "Không thể gửi phản hồi đánh giá."

      setFormError(message)

      showToast({
        type: "error",
        title: "Lưu thất bại",
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-reviews-page">
        <section className="admin-reviews-card">
          <div className="admin-review-empty">
            <Loader2 size={20} />
            Đang tải danh sách đánh giá...
          </div>
        </section>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="admin-reviews-page">
        <section className="admin-reviews-card">
          <div className="admin-review-empty">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="admin-review-reset-btn"
              onClick={fetchReviews}
            >
              <RotateCcw size={16} />
              Tải lại
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-reviews-page">
      {toast.show && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <div className="admin-toast__icon">{renderToastIcon()}</div>

          <div className="admin-toast__content">
            <div className="admin-toast__title">{toast.title}</div>
            <div className="admin-toast__message">{toast.message}</div>
          </div>

          <button
            type="button"
            className="admin-toast__close"
            onClick={closeToast}
            aria-label="Đóng thông báo"
          >
            ×
          </button>

          <span className="admin-toast__progress" />
        </div>
      )}

      <section className="admin-reviews-toolbar">
        <div className="admin-reviews-toolbar-left">
          <div className="admin-reviews-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, khách hàng, dịch vụ..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <button
            type="button"
            className={
              isFilterOpen
                ? "admin-reviews-filter-btn active"
                : "admin-reviews-filter-btn"
            }
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            <Filter size={18} strokeWidth={2.3} />
            Lọc
          </button>

          <div className="admin-reviews-sort">
            <label>
              <ArrowUpDown size={15} />
              Sắp xếp
            </label>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="code-desc">Mã ĐG giảm dần</option>
              <option value="code-asc">Mã ĐG tăng dần</option>
              <option value="customer-asc">Khách hàng A - Z</option>
              <option value="customer-desc">Khách hàng Z - A</option>
              <option value="service-asc">Dịch vụ A - Z</option>
              <option value="rating-desc">Số sao cao nhất</option>
              <option value="rating-asc">Số sao thấp nhất</option>
              <option value="date-desc">Mới nhất</option>
              <option value="date-asc">Cũ nhất</option>
            </select>
          </div>
        </div>
      </section>

      {isFilterOpen && (
        <section className="admin-reviews-filter-panel">
          <div className="admin-review-filter-group">
            <label>Số sao</label>
            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {ratingOptions.map((rating) => (
                <option key={rating}>{rating}</option>
              ))}
            </select>
          </div>

          <div className="admin-review-filter-group">
            <label>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="admin-review-filter-group">
            <label>Thời gian</label>
            <select
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
            >
              {timeOptions.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="admin-review-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </section>
      )}

      <section className="admin-reviews-card">
        <div className="admin-reviews-result-bar">
          <div>
            <h3>Danh sách đánh giá</h3>
            <p>
              Hiển thị <strong>{filteredReviews.length}</strong> đánh giá
            </p>
          </div>
        </div>

        <div className="admin-reviews-table-wrapper">
          <table className="admin-reviews-table">
            <colgroup>
              <col className="review-col-code" />
              <col className="review-col-customer" />
              <col className="review-col-service" />
              <col className="review-col-rating" />
              <col className="review-col-time" />
              <col className="review-col-status" />
              <col className="review-col-action" />
            </colgroup>

            <thead>
              <tr>
                <th>Mã ĐG</th>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Đánh giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.idDanhGia}>
                    <td className="admin-review-code">{review.maDanhGia}</td>

                    <td>
                      <div className="admin-review-customer">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.tenKhachHang}
                            className="admin-review-avatar-img"
                            onError={(event) => {
                              event.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="admin-review-avatar">
                            {getInitial(review.tenKhachHang)}
                          </div>
                        )}

                        <div>
                          <h4>{review.tenKhachHang}</h4>
                          <p>
                            KH{String(review.idKhachHang || "").padStart(3, "0")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>{review.tenDichVu}</td>

                    <td>
                      <RatingStars value={review.soSao} />
                    </td>

                    <td>{formatDateTime(review.ngayDanhGia)}</td>

                    <td>
                      <span
                        className={
                          review.trangThai === "Đã phản hồi"
                            ? "admin-review-status replied"
                            : "admin-review-status pending"
                        }
                      >
                        {review.trangThai}
                      </span>
                    </td>

                    <td>
                      <div className="admin-review-actions">
                        <button
                          type="button"
                          className="admin-review-action-btn view"
                          onClick={() => handleOpenDetail(review)}
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-review-action-btn reply"
                          onClick={() => handleOpenReply(review)}
                          title={
                            review.trangThai === "Đã phản hồi"
                              ? "Chỉnh sửa phản hồi"
                              : "Phản hồi"
                          }
                        >
                          {review.trangThai === "Đã phản hồi" ? (
                            <Pencil size={17} />
                          ) : (
                            <MessageSquareReply size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="admin-review-empty">
                      Không tìm thấy đánh giá phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedReview && (
        <div
          className="admin-review-modal-overlay"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="admin-review-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-review-modal-header">
              <div>
                <h2>Chi tiết đánh giá</h2>
                <p>{selectedReview.maDanhGia}</p>
              </div>

              <button
                type="button"
                className="admin-review-close-btn"
                onClick={() => setSelectedReview(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-review-detail-body">
              <div className="admin-review-detail-hero">
                {selectedReview.avatar ? (
                  <img
                    src={selectedReview.avatar}
                    alt={selectedReview.tenKhachHang}
                    className="admin-review-detail-avatar-img"
                    onError={(event) => {
                      event.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="admin-review-detail-avatar">
                    {getInitial(selectedReview.tenKhachHang)}
                  </div>
                )}

                <div>
                  <h3>{selectedReview.tenKhachHang}</h3>
                  <p>{selectedReview.tenDichVu}</p>
                </div>

                <span
                  className={
                    selectedReview.trangThai === "Đã phản hồi"
                      ? "admin-review-status replied"
                      : "admin-review-status pending"
                  }
                >
                  {selectedReview.trangThai}
                </span>
              </div>

              <div className="admin-review-detail-grid">
                <div className="admin-review-detail-item">
                  <UserRound size={18} />
                  <div>
                    <span>Khách hàng</span>
                    <strong>{selectedReview.tenKhachHang}</strong>
                  </div>
                </div>

                <div className="admin-review-detail-item">
                  <Sparkles size={18} />
                  <div>
                    <span>Dịch vụ</span>
                    <strong>{selectedReview.tenDichVu}</strong>
                  </div>
                </div>

                <div className="admin-review-detail-item">
                  <Star size={18} />
                  <div>
                    <span>Số sao</span>
                    <strong>{selectedReview.soSao}/5</strong>
                  </div>
                </div>

                <div className="admin-review-detail-item">
                  <CalendarDays size={18} />
                  <div>
                    <span>Thời gian đánh giá</span>
                    <strong>{formatDateTime(selectedReview.ngayDanhGia)}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-review-content-box">
                <h3>Nội dung nhận xét</h3>
                <p>{selectedReview.noiDung || "Khách hàng chưa nhập nhận xét."}</p>
              </div>

              <div className="admin-review-images-box">
                <div className="admin-review-section-title">
                  <h3>Hình ảnh đính kèm</h3>
                  <span>{selectedReview.hinhAnh?.length || 0} ảnh</span>
                </div>

                {selectedReview.hinhAnh?.length > 0 ? (
                  <div className="admin-review-images-grid">
                    {selectedReview.hinhAnh.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`Ảnh đánh giá ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="admin-review-no-image">
                    <ImageIcon size={20} />
                    Không có hình ảnh đính kèm
                  </div>
                )}
              </div>

              {selectedReview.phanHoi && (
                <div className="admin-review-reply-box">
                  <div className="admin-review-section-title">
                    <h3>Phản hồi của admin</h3>
                    <span>
                      {selectedReview.phanHoi.ngayCapNhat
                        ? `Cập nhật: ${formatDateTime(
                            selectedReview.phanHoi.ngayCapNhat
                          )}`
                        : formatDateTime(selectedReview.phanHoi.ngayTao)}
                    </span>
                  </div>

                  <p>{selectedReview.phanHoi.noiDungPhanHoi}</p>
                </div>
              )}
            </div>

            <div className="admin-review-modal-actions">
              <button
                type="button"
                className="admin-review-cancel-btn"
                onClick={() => setSelectedReview(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="admin-review-primary-btn"
                onClick={() => {
                  handleOpenReply(selectedReview)
                  setSelectedReview(null)
                }}
              >
                {selectedReview.trangThai === "Đã phản hồi" ? (
                  <Pencil size={17} />
                ) : (
                  <MessageSquareReply size={17} />
                )}

                {selectedReview.trangThai === "Đã phản hồi"
                  ? "Chỉnh sửa phản hồi"
                  : "Phản hồi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {replyTarget && (
        <div className="admin-review-modal-overlay" onClick={handleCloseReply}>
          <div
            className="admin-review-reply-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-review-modal-header">
              <div>
                <h2>
                  {replyTarget.trangThai === "Đã phản hồi"
                    ? "Chỉnh sửa phản hồi"
                    : "Phản hồi đánh giá"}
                </h2>
                <p>{replyTarget.maDanhGia}</p>
              </div>

              <button
                type="button"
                className="admin-review-close-btn"
                onClick={handleCloseReply}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-review-reply-body">
              {formError && (
                <div className="admin-review-form-error">
                  <AlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-review-reply-summary">
                <div>
                  <h3>{replyTarget.tenKhachHang}</h3>
                  <p>{replyTarget.tenDichVu}</p>
                </div>

                <RatingStars value={replyTarget.soSao} />
              </div>

              <div className="admin-review-customer-comment">
                <h4>Nội dung đánh giá</h4>
                <p>{replyTarget.noiDung || "Khách hàng chưa nhập nhận xét."}</p>
              </div>

              <div className="admin-review-form-group">
                <label>Nội dung phản hồi</label>
                <textarea
                  rows="5"
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  value={replyContent}
                  disabled={isSaving}
                  onChange={(event) => {
                    setReplyContent(event.target.value)
                    if (formError) setFormError("")
                  }}
                ></textarea>

                <div className="admin-review-text-count">
                  {replyContent.length}/500 ký tự
                </div>
              </div>
            </div>

            <div className="admin-review-modal-actions">
              <button
                type="button"
                className="admin-review-cancel-btn"
                onClick={handleCloseReply}
                disabled={isSaving}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-review-primary-btn"
                onClick={handleSubmitReply}
                disabled={isSaving}
              >
                <Send size={17} />
                {isSaving
                  ? "Đang lưu..."
                  : replyTarget.trangThai === "Đã phản hồi"
                    ? "Lưu thay đổi"
                    : "Gửi phản hồi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
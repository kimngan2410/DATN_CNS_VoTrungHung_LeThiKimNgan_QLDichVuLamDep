import React, { useMemo, useState } from "react"
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
} from "lucide-react"
import "./AdminReviews.css"

const statusOptions = ["Đã phản hồi", "Chưa phản hồi"]
const ratingOptions = ["5 sao", "4 sao", "3 sao", "2 sao", "1 sao"]
const timeOptions = ["Tất cả", "Hôm nay", "7 ngày gần đây", "30 ngày gần đây"]

const initialReviews = [
  {
    idDanhGia: 1,
    maDanhGia: "DG001",
    idKhachHang: 1,
    tenKhachHang: "Nguyễn Thị Hoa",
    idDichVu: 1,
    tenDichVu: "Chăm sóc da mặt cơ bản",
    soSao: 5,
    noiDung:
      "Dịch vụ rất tốt, nhân viên nhiệt tình, không gian sạch sẽ và thư giãn.",
    hinhAnh: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&auto=format&fit=crop",
    ],
    ngayDanhGia: "2023-11-20T14:30:00",
    trangThai: "Đã phản hồi",
    phanHoi: {
      noiDungPhanHoi:
        "Cảm ơn chị Hoa đã tin tưởng Lumière Spa. Rất mong được tiếp tục phục vụ chị trong những lần sau.",
      ngayTao: "2023-11-20T16:10:00",
      ngayCapNhat: null,
    },
  },
  {
    idDanhGia: 2,
    maDanhGia: "DG002",
    idKhachHang: 2,
    tenKhachHang: "Trần Văn Nam",
    idDichVu: 3,
    tenDichVu: "Massage Body Thái",
    soSao: 4,
    noiDung:
      "Kỹ thuật viên làm tốt, nhưng phòng hơi lạnh. Mong spa điều chỉnh nhiệt độ phù hợp hơn.",
    hinhAnh: [],
    ngayDanhGia: "2023-11-19T10:15:00",
    trangThai: "Chưa phản hồi",
    phanHoi: null,
  },
  {
    idDanhGia: 3,
    maDanhGia: "DG003",
    idKhachHang: 3,
    tenKhachHang: "Lê Mai Anh",
    idDichVu: 4,
    tenDichVu: "Tắm trắng phi thuyền",
    soSao: 5,
    noiDung:
      "Da sáng lên hẳn sau 1 liệu trình. Rất ưng cách tư vấn của nhân viên.",
    hinhAnh: [
      "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&auto=format&fit=crop",
    ],
    ngayDanhGia: "2023-11-18T16:45:00",
    trangThai: "Chưa phản hồi",
    phanHoi: null,
  },
  {
    idDanhGia: 4,
    maDanhGia: "DG004",
    idKhachHang: 4,
    tenKhachHang: "Phạm Thu Thuỷ",
    idDichVu: 2,
    tenDichVu: "Điều trị mụn chuyên sâu",
    soSao: 3,
    noiDung:
      "Lúc nặn mụn hơi đau, hy vọng lần sau nhân viên thao tác nhẹ hơn.",
    hinhAnh: [],
    ngayDanhGia: "2023-11-15T09:00:00",
    trangThai: "Đã phản hồi",
    phanHoi: {
      noiDungPhanHoi:
        "Lumière Spa xin ghi nhận góp ý của chị. Spa sẽ nhắc kỹ thuật viên điều chỉnh thao tác nhẹ nhàng hơn.",
      ngayTao: "2023-11-15T11:20:00",
      ngayCapNhat: null,
    },
  },
  {
    idDanhGia: 5,
    maDanhGia: "DG005",
    idKhachHang: 5,
    tenKhachHang: "Hoàng Minh Tuấn",
    idDichVu: 1,
    tenDichVu: "Chăm sóc da mặt cơ bản",
    soSao: 2,
    noiDung:
      "Mình phải chờ hơi lâu so với giờ đặt lịch. Dịch vụ ổn nhưng trải nghiệm chưa tốt.",
    hinhAnh: [],
    ngayDanhGia: "2023-11-10T18:20:00",
    trangThai: "Chưa phản hồi",
    phanHoi: null,
  },
]

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

function RatingStars({ value }) {
  return (
    <div className="admin-review-stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={16}
          className={index < value ? "filled" : "empty"}
          fill={index < value ? "currentColor" : "none"}
        />
      ))}
    </div>
  )
}

function AdminReviews() {
  const [reviews, setReviews] = useState(initialReviews)

  const [searchText, setSearchText] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [ratingFilter, setRatingFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [timeFilter, setTimeFilter] = useState("Tất cả")

  const [selectedReview, setSelectedReview] = useState(null)
  const [replyTarget, setReplyTarget] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const filteredReviews = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return reviews.filter((review) => {
      const matchKeyword =
        review.maDanhGia.toLowerCase().includes(keyword) ||
        review.tenKhachHang.toLowerCase().includes(keyword) ||
        review.tenDichVu.toLowerCase().includes(keyword) ||
        review.noiDung.toLowerCase().includes(keyword)

      const matchRating =
        ratingFilter === "Tất cả" || `${review.soSao} sao` === ratingFilter

      const matchStatus =
        statusFilter === "Tất cả" || review.trangThai === statusFilter

      const matchTime = isInTimeRange(review.ngayDanhGia, timeFilter)

      return matchKeyword && matchRating && matchStatus && matchTime
    })
  }, [reviews, searchText, ratingFilter, statusFilter, timeFilter])

  const showSuccess = (message) => {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage("")
    }, 2200)
  }

  const handleResetFilter = () => {
    setSearchText("")
    setRatingFilter("Tất cả")
    setStatusFilter("Tất cả")
    setTimeFilter("Tất cả")
  }

  const handleOpenReply = (review) => {
    setReplyTarget(review)
    setReplyContent(review.phanHoi?.noiDungPhanHoi || "")
    setFormError("")
  }

  const handleCloseReply = () => {
    setReplyTarget(null)
    setReplyContent("")
    setFormError("")
  }

  const handleSubmitReply = () => {
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

    setReviews((prev) =>
      prev.map((review) =>
        review.idDanhGia === replyTarget.idDanhGia
          ? {
              ...review,
              trangThai: "Đã phản hồi",
              phanHoi: {
                noiDungPhanHoi: trimmedReply,
                ngayTao: review.phanHoi?.ngayTao || new Date().toISOString(),
                ngayCapNhat: isEditingReply ? new Date().toISOString() : null,
              },
            }
          : review
      )
    )

    handleCloseReply()
    showSuccess(
      isEditingReply
        ? "Cập nhật phản hồi thành công."
        : "Gửi phản hồi thành công."
    )
  }

  return (
    <div className="admin-reviews-page">
      {successMessage && (
        <div className="admin-review-success-toast">{successMessage}</div>
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
                        <div className="admin-review-avatar">
                          {review.tenKhachHang.charAt(0)}
                        </div>

                        <div>
                          <h4>{review.tenKhachHang}</h4>
                          <p>KH{String(review.idKhachHang).padStart(3, "0")}</p>
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
                          onClick={() => setSelectedReview(review)}
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
                <div className="admin-review-detail-avatar">
                  {selectedReview.tenKhachHang.charAt(0)}
                </div>

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
                <p>{selectedReview.noiDung}</p>
              </div>

              <div className="admin-review-images-box">
                <div className="admin-review-section-title">
                  <h3>Hình ảnh đính kèm</h3>
                  <span>{selectedReview.hinhAnh.length} ảnh</span>
                </div>

                {selectedReview.hinhAnh.length > 0 ? (
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
                  setReplyTarget(selectedReview)
                  setSelectedReview(null)
                  setReplyContent(selectedReview.phanHoi?.noiDungPhanHoi || "")
                  setFormError("")
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
                <p>{replyTarget.noiDung}</p>
              </div>

              <div className="admin-review-form-group">
                <label>Nội dung phản hồi</label>
                <textarea
                  rows="5"
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  value={replyContent}
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
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-review-primary-btn"
                onClick={handleSubmitReply}
              >
                <Send size={17} />
                {replyTarget.trangThai === "Đã phản hồi"
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
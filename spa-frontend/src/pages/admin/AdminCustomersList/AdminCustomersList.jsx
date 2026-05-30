import React, { useEffect, useMemo, useState } from "react"
import {
  Search,
  Filter,
  Eye,
  X,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  Clock3,
  Wallet,
  RotateCcw,
  ReceiptText,
  Download,
  ArrowUpDown,
} from "lucide-react"

import {
  getAdminCustomerDetailApi,
  getAdminCustomersApi,
} from "../../../services/adminCustomerApi"

import "./AdminCustomersList.css"

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000"

const SPA_OPENING_YEAR = 2020
const HISTORY_PREVIEW_LIMIT = 5

const monthOptions = [
  { value: "Tất cả", label: "Tất cả" },
  { value: "01", label: "Tháng 1" },
  { value: "02", label: "Tháng 2" },
  { value: "03", label: "Tháng 3" },
  { value: "04", label: "Tháng 4" },
  { value: "05", label: "Tháng 5" },
  { value: "06", label: "Tháng 6" },
  { value: "07", label: "Tháng 7" },
  { value: "08", label: "Tháng 8" },
  { value: "09", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
]

const yearOptions = Array.from(
  { length: new Date().getFullYear() - SPA_OPENING_YEAR + 1 },
  (_, index) => String(new Date().getFullYear() - index)
)

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return ""

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl
  }

  if (imageUrl.startsWith("/")) {
    return `${API_ORIGIN}${imageUrl}`
  }

  return `${API_ORIGIN}/${imageUrl}`
}

const getDateParts = (dateText) => {
  if (!dateText || dateText === "Chưa cập nhật" || dateText === "Chưa sử dụng") {
    return {
      day: "",
      month: "",
      year: "",
    }
  }

  if (dateText.includes("/")) {
    const [day, month, year] = dateText.split("/")

    return {
      day,
      month,
      year,
    }
  }

  if (dateText.includes("-")) {
    const [year, month, day] = dateText.split("-")

    return {
      day,
      month,
      year,
    }
  }

  return {
    day: "",
    month: "",
    year: "",
  }
}

const formatDateDisplay = (dateText) => {
  if (!dateText || dateText === "Chưa cập nhật" || dateText === "Chưa sử dụng") {
    return dateText || "Chưa cập nhật"
  }

  if (dateText.includes("/")) return dateText

  if (dateText.includes("-")) {
    const [year, month, day] = dateText.split("-")

    if (year && month && day) {
      return `${day}/${month}/${year}`
    }
  }

  return dateText
}

const getCreatedAtTimestamp = (customer) => {
  const createdAt = customer?.createdAt

  if (!createdAt || createdAt === "Chưa cập nhật") return 0

  if (createdAt.includes("/")) {
    const [day, month, year] = createdAt.split("/")
    return new Date(`${year}-${month}-${day}`).getTime()
  }

  if (createdAt.includes("-")) {
    return new Date(createdAt).getTime()
  }

  return 0
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const escapeCsvValue = (value) => {
  const text = String(value ?? "")

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

const isActiveStatus = (status) => {
  return status === "Đang hoạt động" || status === "Hoạt động"
}

const getTotalSpent = (customer) => {
  return Number(customer?.totalSpent || 0)
}

const getServiceUsageHistory = (customer) => {
  return Array.isArray(customer?.serviceHistory) ? customer.serviceHistory : []
}

const getAppointments = (customer) => {
  return Array.isArray(customer?.appointments) ? customer.appointments : []
}

const getLastPaidDate = (customer) => {
  const history = getServiceUsageHistory(customer)

  if (history.length > 0) {
    return formatDateDisplay(history[0].date)
  }

  return customer?.lastVisit || "Chưa có"
}

const getCustomerCode = (customer) => {
  return customer?.maKH || customer?.id || `KH${customer?.idKhachHang || ""}`
}

const getCustomerAvatarText = (customer) => {
  if (customer?.avatarText) return customer.avatarText

  const fullName = customer?.fullName || "K"
  return fullName.trim().charAt(0).toUpperCase()
}

const getCustomerSortNumber = (customer) => {
  const code = getCustomerCode(customer)
  const numberText = String(code).replace(/\D/g, "")

  return Number(numberText || customer?.idKhachHang || 0)
}

const getAppointmentStatusClass = (status) => {
  switch (status) {
    case "Chờ xác nhận":
      return "pending"
    case "Đã xác nhận":
      return "confirmed"
    case "Đã check-in":
      return "checked"
    case "Đang thực hiện":
      return "doing"
    case "Đã hoàn thành":
      return "completed"
    case "Đã huỷ":
      return "cancelled"
    case "Không đến":
      return "no-show"
    default:
      return ""
  }
}

function AdminCustomers() {
  const [customerList, setCustomerList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [genderFilter, setGenderFilter] = useState("Tất cả")
  const [monthFilter, setMonthFilter] = useState("Tất cả")
  const [yearFilter, setYearFilter] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("default")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminCustomersApi()
      setCustomerList(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải danh sách khách hàng.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers()
  }, [])

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    const filtered = customerList.filter((customer) => {
      const customerCode = getCustomerCode(customer).toLowerCase()
      const fullName = (customer.fullName || "").toLowerCase()
      const phone = customer.phone || ""
      const email = (customer.email || "").toLowerCase()

      const matchKeyword =
        !keyword ||
        fullName.includes(keyword) ||
        phone.includes(keyword) ||
        email.includes(keyword) ||
        customerCode.includes(keyword)

      const matchStatus =
        statusFilter === "Tất cả" || customer.status === statusFilter

      const matchGender =
        genderFilter === "Tất cả" || customer.gender === genderFilter

      const { month, year } = getDateParts(customer.createdAt)

      const matchMonth = monthFilter === "Tất cả" || month === monthFilter
      const matchYear = yearFilter === "Tất cả" || year === yearFilter

      return (
        matchKeyword &&
        matchStatus &&
        matchGender &&
        matchMonth &&
        matchYear
      )
    })

    if (sortOption === "default") {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const codeA = getCustomerSortNumber(a)
      const codeB = getCustomerSortNumber(b)

      const nameA = (a.fullName || "").toLowerCase()
      const nameB = (b.fullName || "").toLowerCase()

      const createdAtA = getCreatedAtTimestamp(a)
      const createdAtB = getCreatedAtTimestamp(b)

      if (sortOption === "code-asc") {
        return codeA - codeB
      }

      if (sortOption === "code-desc") {
        return codeB - codeA
      }

      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB, "vi")
      }

      if (sortOption === "name-desc") {
        return nameB.localeCompare(nameA, "vi")
      }

      if (sortOption === "created-desc") {
        return createdAtB - createdAtA
      }

      if (sortOption === "created-asc") {
        return createdAtA - createdAtB
      }

      return 0
    })
  }, [
    customerList,
    searchText,
    statusFilter,
    genderFilter,
    monthFilter,
    yearFilter,
    sortOption,
  ])

  const handleResetFilter = () => {
    setSearchText("")
    setStatusFilter("Tất cả")
    setGenderFilter("Tất cả")
    setMonthFilter("Tất cả")
    setYearFilter("Tất cả")
    setSortOption("default")
  }

  const handleExportCustomers = () => {
    const lines = [
      [
        "Mã khách hàng",
        "Mã tài khoản",
        "Họ tên",
        "Email",
        "Số điện thoại",
        "Giới tính",
        "Ngày sinh",
        "Ngày tạo",
        "Trạng thái",
        "Loại khách hàng",
        "Số lịch hẹn",
        "Tổng chi tiêu",
      ],
      ...filteredCustomers.map((customer) => [
        getCustomerCode(customer),
        customer.idTaiKhoan || "",
        customer.fullName || "",
        customer.email || "",
        customer.phone || "",
        customer.gender || "",
        customer.birthday || "",
        customer.createdAt || "",
        customer.status || "",
        customer.loaiKH || "Thường",
        customer.totalAppointments || 0,
        getTotalSpent(customer),
      ]),
    ]

    const csv =
      "\uFEFF" +
      lines.map((row) => row.map(escapeCsvValue).join(",")).join("\n")

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "danh-sach-khach-hang.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  const handleOpenCustomerDetail = async (customer) => {
    try {
      setIsDetailLoading(true)
      setHistoryModal(null)

      const detail = await getAdminCustomerDetailApi(customer.idKhachHang)
      setSelectedCustomer(detail)
    } catch {
      setSelectedCustomer(customer)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleCloseCustomerModal = () => {
    setSelectedCustomer(null)
    setHistoryModal(null)
  }

  if (isLoading) {
    return (
      <div className="admin-customers-page">
        <section className="admin-customers-card">
          <div className="admin-empty-state">
            Đang tải danh sách khách hàng...
          </div>
        </section>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="admin-customers-page">
        <section className="admin-customers-card">
          <div className="admin-empty-state">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="admin-filter-reset-btn"
              onClick={fetchCustomers}
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
    <div className="admin-customers-page">
      <section className="admin-customers-toolbar">
        <div className="admin-customers-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, email..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <button
          type="button"
          className={
            isFilterOpen
              ? "admin-customers-filter-btn active"
              : "admin-customers-filter-btn"
          }
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          <Filter size={18} strokeWidth={2.3} />
          Lọc
        </button>

        <div className="admin-customers-sort">
          <label>
            <ArrowUpDown size={15} />
            Sắp xếp
          </label>

          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="code-desc">Mã KH giảm dần</option>
            <option value="code-asc">Mã KH tăng dần</option>
            <option value="name-asc">Tên A - Z</option>
            <option value="name-desc">Tên Z - A</option>
            <option value="created-desc">Ngày tạo mới nhất</option>
            <option value="created-asc">Ngày tạo cũ nhất</option>
          </select>
        </div>

        <button
          type="button"
          className="admin-customers-export-btn"
          onClick={handleExportCustomers}
        >
          <Download size={17} />
          Xuất danh sách
        </button>
      </section>

      {isFilterOpen && (
        <section className="admin-customers-filter-panel">
          <div className="admin-filter-group">
            <label>Trạng thái</label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Tạm khoá</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label>Giới tính</label>

            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Nam</option>
              <option>Nữ</option>
              <option>Khác</option>
              <option>Chưa cập nhật</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label>Tháng tạo</label>

            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-group">
            <label>Năm tạo</label>

            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option>Tất cả</option>

              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="admin-filter-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </section>
      )}

      <section className="admin-customers-card">
        <div className="admin-customers-result-bar">
          <p>
            Hiển thị <strong>{filteredCustomers.length}</strong> khách hàng
          </p>
        </div>

        <div className="admin-customers-table-wrapper">
          <table className="admin-customers-table">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Giới tính</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th className="admin-customers-action-th">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.idKhachHang || customer.id}>
                    <td className="admin-customer-code">
                      {getCustomerCode(customer)}
                    </td>

                    <td>
                      <div className="admin-customer-info">
                        <div className="admin-customer-avatar">
                          {customer.avatar ? (
                            <img
                              src={getImageUrl(customer.avatar)}
                              alt={customer.fullName}
                              onError={(event) => {
                                event.currentTarget.style.display = "none"
                              }}
                            />
                          ) : (
                            getCustomerAvatarText(customer)
                          )}
                        </div>

                        <div>
                          <h4>{customer.fullName}</h4>
                          <p>{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>{customer.phone || "Chưa cập nhật"}</td>
                    <td>{customer.gender || "Chưa cập nhật"}</td>
                    <td>{formatDateDisplay(customer.createdAt)}</td>

                    <td>
                      <span
                        className={
                          isActiveStatus(customer.status)
                            ? "admin-status-badge active"
                            : "admin-status-badge locked"
                        }
                      >
                        {customer.status || "Chưa cập nhật"}
                      </span>
                    </td>

                    <td className="admin-customers-action-td">
                      <button
                        type="button"
                        className="admin-view-btn"
                        title="Xem chi tiết"
                        disabled={isDetailLoading}
                        onClick={() => handleOpenCustomerDetail(customer)}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty-state">
                      Không tìm thấy khách hàng phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCustomer && (
        <div
          className="admin-customer-modal-overlay"
          onClick={handleCloseCustomerModal}
        >
          <div
            className="admin-customer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-customer-modal-header">
              <div>
                <h2>Chi tiết khách hàng</h2>
                <p>{getCustomerCode(selectedCustomer)}</p>
              </div>

              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={handleCloseCustomerModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-customer-profile-box">
              <div className="admin-customer-profile-avatar">
                {selectedCustomer.avatar ? (
                  <img
                    src={getImageUrl(selectedCustomer.avatar)}
                    alt={selectedCustomer.fullName}
                    onError={(event) => {
                      event.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  getCustomerAvatarText(selectedCustomer)
                )}
              </div>

              <div>
                <h3>{selectedCustomer.fullName}</h3>
                <p>{selectedCustomer.loaiKH || "Thường"}</p>
              </div>

              <span
                className={
                  isActiveStatus(selectedCustomer.status)
                    ? "admin-status-badge active"
                    : "admin-status-badge locked"
                }
              >
                {selectedCustomer.status || "Chưa cập nhật"}
              </span>
            </div>

            <div className="admin-customer-detail-grid">
              <div className="admin-detail-item">
                <Phone size={17} />

                <div>
                  <span>Số điện thoại</span>
                  <strong>{selectedCustomer.phone || "Chưa cập nhật"}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <Mail size={17} />

                <div>
                  <span>Email</span>
                  <strong>{selectedCustomer.email || "Chưa cập nhật"}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <UserRound size={17} />

                <div>
                  <span>Giới tính</span>
                  <strong>{selectedCustomer.gender || "Chưa cập nhật"}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <CalendarDays size={17} />

                <div>
                  <span>Ngày sinh</span>
                  <strong>{formatDateDisplay(selectedCustomer.birthday)}</strong>
                </div>
              </div>
            </div>

            <div className="admin-customer-stat-grid">
              <div>
                <Clock3 size={18} />

                <span>Lịch hẹn</span>
                <strong>{selectedCustomer.totalAppointments || 0}</strong>
              </div>

              <div>
                <Wallet size={18} />

                <span>Chi tiêu</span>
                <strong>{formatMoney(getTotalSpent(selectedCustomer))}</strong>
              </div>

              <div>
                <ReceiptText size={18} />

                <span>Lần sử dụng gần nhất</span>
                <strong>{getLastPaidDate(selectedCustomer)}</strong>
              </div>
            </div>

            <div className="admin-customer-history-grid">
              <div className="admin-history-card">
                <div className="admin-history-card-header">
                  <h3>Lịch hẹn gần đây</h3>

                  {getAppointments(selectedCustomer).length >
                    HISTORY_PREVIEW_LIMIT && (
                    <button
                      type="button"
                      onClick={() =>
                        setHistoryModal({
                          title: "Tất cả lịch hẹn",
                          type: "appointments",
                          data: getAppointments(selectedCustomer),
                        })
                      }
                    >
                      Xem tất cả
                    </button>
                  )}
                </div>

                {getAppointments(selectedCustomer).length > 0 ? (
                  <div className="admin-history-list">
                    {getAppointments(selectedCustomer)
                      .slice(0, HISTORY_PREVIEW_LIMIT)
                      .map((appointment) => (
                        <div
                          className="admin-history-item"
                          key={appointment.id}
                        >
                          <div>
                            <strong>{appointment.id}</strong>
                            <p>{appointment.services || "Dịch vụ"}</p>
                          </div>

                          <div className="admin-history-meta">
                            <span>
                              {formatDateDisplay(appointment.date)} ·{" "}
                              {appointment.time || "Chưa cập nhật"}
                            </span>

                            <em
                              className={`admin-appointment-status ${getAppointmentStatusClass(
                                appointment.status
                              )}`}
                            >
                              {appointment.status || "Chưa cập nhật"}
                            </em>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="admin-empty-history">Chưa có lịch hẹn nào.</p>
                )}
              </div>

              <div className="admin-history-card">
                <div className="admin-history-card-header">
                  <h3>Lịch sử sử dụng dịch vụ</h3>

                  {getServiceUsageHistory(selectedCustomer).length >
                    HISTORY_PREVIEW_LIMIT && (
                    <button
                      type="button"
                      onClick={() =>
                        setHistoryModal({
                          title: "Tất cả dịch vụ đã sử dụng",
                          type: "services",
                          data: getServiceUsageHistory(selectedCustomer),
                        })
                      }
                    >
                      Xem tất cả
                    </button>
                  )}
                </div>

                {getServiceUsageHistory(selectedCustomer).length > 0 ? (
                  <div className="admin-history-list">
                    {getServiceUsageHistory(selectedCustomer)
                      .slice(0, HISTORY_PREVIEW_LIMIT)
                      .map((service) => (
                        <div className="admin-history-item" key={service.id}>
                          <div>
                            <strong>{service.serviceName}</strong>
                            <p>{formatDateDisplay(service.date)}</p>
                          </div>

                          <div className="admin-history-meta right">
                            <span>{formatMoney(service.amount)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="admin-empty-history">
                    Chưa có lịch sử sử dụng dịch vụ.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && historyModal && (
        <div
          className="admin-history-modal-overlay"
          onClick={() => setHistoryModal(null)}
        >
          <div
            className="admin-history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-history-modal-header">
              <div>
                <h2>{historyModal.title}</h2>
                <p>{selectedCustomer.fullName}</p>
              </div>

              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setHistoryModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-history-modal-list">
              {historyModal.data.length > 0 ? (
                historyModal.data.map((item) => (
                  <div className="admin-history-modal-item" key={item.id}>
                    {historyModal.type === "appointments" ? (
                      <>
                        <div>
                          <strong>{item.id}</strong>
                          <p>{item.services || "Dịch vụ"}</p>
                        </div>

                        <div className="admin-history-meta">
                          <span>
                            {formatDateDisplay(item.date)} ·{" "}
                            {item.time || "Chưa cập nhật"}
                          </span>

                          <em
                            className={`admin-appointment-status ${getAppointmentStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status || "Chưa cập nhật"}
                          </em>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <strong>{item.serviceName}</strong>
                          <p>{formatDateDisplay(item.date)}</p>
                        </div>

                        <div className="admin-history-meta right">
                          <span>{formatMoney(item.amount)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="admin-history-modal-item">
                  <div>
                    <strong>Chưa có dữ liệu</strong>
                    <p>Không có dữ liệu để hiển thị.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers
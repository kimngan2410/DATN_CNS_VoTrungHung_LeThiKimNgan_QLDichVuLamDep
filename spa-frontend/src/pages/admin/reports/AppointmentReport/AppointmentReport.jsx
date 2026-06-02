import React, { useCallback, useEffect, useState } from "react"
import {
  CalendarDays,
  Download,
  Search,
  Filter,
  ClipboardList,
  CircleCheckBig,
  AlertTriangle,
  Percent,
  RotateCcw,
  Eye,
  X,
} from "lucide-react"

import { getAdminAppointmentReportApi } from "../../../../services/adminAppointmentReportApi"
import "./AppointmentReport.css"

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đã check-in",
  "Đang thực hiện",
  "Đã hoàn thành",
  "Đã huỷ",
  "Không đến",
]

const defaultReportData = {
  fromDate: "",
  toDate: "",
  keyword: "",
  status: "Tất cả",
  summary: {
    totalAppointments: 0,
    completedCount: 0,
    cancelledCount: 0,
    noShowCount: 0,
    completionRate: 0,
  },
  appointments: [],
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const formatDateTime = (dateValue) => {
  if (!dateValue) return ""

  const date = new Date(dateValue)

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatDateVN = (dateValue) => {
  if (!dateValue) return ""

  const [year, month, day] = dateValue.split("-")

  return `${day}/${month}/${year}`
}

const getTodayInputValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const getFirstDayOfCurrentMonth = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")

  return `${year}-${month}-01`
}

const getStatusClass = (status) => {
  if (status === "Đã hoàn thành") return "completed"
  if (status === "Đã huỷ") return "cancelled"
  if (status === "Không đến") return "no-show"
  if (status === "Đang thực hiện") return "processing"
  if (status === "Đã xác nhận" || status === "Đã check-in") return "confirmed"

  return "waiting"
}

const getAppointmentTotal = (appointment) => {
  return (appointment?.serviceDetails || []).reduce((sum, service) => {
    return sum + Number(service.quantity || 0) * Number(service.price || 0)
  }, 0)
}

function AppointmentReport() {
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth())
  const [toDate, setToDate] = useState(getTodayInputValue())
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const [reportData, setReportData] = useState(defaultReportData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchAppointmentReport = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminAppointmentReportApi({
        fromDate,
        toDate,
        keyword,
        status: statusFilter,
      })

      setReportData({
        ...defaultReportData,
        ...data,
        summary: {
          ...defaultReportData.summary,
          ...(data?.summary || {}),
        },
        appointments: data?.appointments || [],
      })
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải báo cáo lịch hẹn.")
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, keyword, statusFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointmentReport()
  }, [fetchAppointmentReport])

  const filteredAppointments = reportData.appointments || []
  const summary = reportData.summary || defaultReportData.summary

  const handleResetFilter = () => {
    setFromDate(getFirstDayOfCurrentMonth())
    setToDate(getTodayInputValue())
    setKeyword("")
    setStatusFilter("Tất cả")
  }

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo lịch hẹn"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["Trạng thái", statusFilter],
      [],
      [
        "Mã lịch hẹn",
        "Khách hàng",
        "Số điện thoại",
        "Dịch vụ",
        "Thời gian bắt đầu",
        "Thời gian kết thúc",
        "Trạng thái",
        "Nguồn tạo",
        "Ghi chú",
        "Lý do huỷ/không đến",
      ],
      ...filteredAppointments.map((item) => [
        item.maLH,
        item.customer,
        item.phone,
        item.services.join(" | "),
        formatDateTime(item.thoiGianBatDau),
        formatDateTime(item.thoiGianKetThuc),
        item.trangThai,
        item.nguonTao || "",
        item.ghiChu || "",
        item.lyDoHuy || "",
      ]),
      [],
      ["Tổng lịch hẹn", summary.totalAppointments],
      ["Đã hoàn thành", summary.completedCount],
      ["Đã huỷ", summary.cancelledCount],
      ["Không đến", summary.noShowCount],
      ["Tỷ lệ hoàn thành", `${summary.completionRate}%`],
    ]

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `bao-cao-lich-hen-${fromDate}-${toDate}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="appointment-report-page">
      <section className="appointment-report-filter-card">
        <div className="appointment-report-filter-left">
          <label className="appointment-report-date-picker">
            <CalendarDays size={17} />
            <span>{formatDateVN(fromDate)}</span>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <span className="appointment-report-date-separator">-</span>

          <label className="appointment-report-date-picker">
            <span>{formatDateVN(toDate)}</span>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="appointment-report-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Tìm mã lịch, khách hàng, SĐT, dịch vụ..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="appointment-report-filter-item">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="appointment-report-actions">
          <button
            type="button"
            className="appointment-report-reset-btn"
            onClick={handleResetFilter}
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="appointment-report-export-btn"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      {isLoading && (
        <div className="appointment-report-state-card">
          Đang tải báo cáo lịch hẹn...
        </div>
      )}

      {errorMessage && (
        <div className="appointment-report-state-card">
          <p>{errorMessage}</p>

          <button
            type="button"
            className="appointment-report-export-btn"
            onClick={fetchAppointmentReport}
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="appointment-report-summary-grid">
            <div className="appointment-report-summary-card">
              <div className="appointment-report-summary-icon">
                <ClipboardList size={22} />
              </div>

              <p>Tổng lịch hẹn</p>
              <h2>{summary.totalAppointments}</h2>
              <span>Lịch hẹn phù hợp với bộ lọc</span>
            </div>

            <div className="appointment-report-summary-card">
              <div className="appointment-report-summary-icon">
                <CircleCheckBig size={22} />
              </div>

              <p>Đã hoàn thành</p>
              <h2>{summary.completedCount}</h2>
              <span>Lịch đã hoàn tất dịch vụ</span>
            </div>

            <div className="appointment-report-summary-card">
              <div className="appointment-report-summary-icon">
                <AlertTriangle size={22} />
              </div>

              <p>Huỷ / Không đến</p>
              <h2>{summary.cancelledCount + summary.noShowCount}</h2>
              <span>
                {summary.cancelledCount} huỷ · {summary.noShowCount} không đến
              </span>
            </div>

            <div className="appointment-report-summary-card">
              <div className="appointment-report-summary-icon">
                <Percent size={22} />
              </div>

              <p>Tỷ lệ hoàn thành</p>
              <h2>{summary.completionRate}%</h2>
              <span>Tính trên tổng lịch hẹn</span>
            </div>
          </section>

          <section className="appointment-report-table-card">
            <div className="appointment-report-table-header">
              <div>
                <h3>Bảng báo cáo lịch hẹn</h3>
                <p>
                  Hiển thị <strong>{filteredAppointments.length}</strong> lịch hẹn
                </p>
              </div>

              <div className="appointment-report-table-total">
                Hoàn thành: <strong>{summary.completedCount}</strong> /{" "}
                {summary.totalAppointments}
              </div>
            </div>

            <div className="appointment-report-table-wrapper">
              <table className="appointment-report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mã LH</th>
                    <th>Khách hàng</th>
                    <th>Dịch vụ</th>
                    <th>Thời gian hẹn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment, index) => (
                      <tr key={appointment.id}>
                        <td>{index + 1}</td>

                        <td className="appointment-report-code">
                          {appointment.maLH}
                        </td>

                        <td>
                          <strong className="appointment-report-name">
                            {appointment.customer}
                          </strong>
                          <p>{appointment.phone}</p>
                        </td>

                        <td>
                          <div className="appointment-report-service-list">
                            {appointment.services.map((service) => (
                              <span key={service}>{service}</span>
                            ))}
                          </div>
                        </td>

                        <td>{formatDateTime(appointment.thoiGianBatDau)}</td>

                        <td>
                          <span
                            className={`appointment-report-status ${getStatusClass(
                              appointment.trangThai
                            )}`}
                          >
                            {appointment.trangThai}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="appointment-report-view-btn"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="appointment-report-empty">
                          Chưa có lịch hẹn phù hợp
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan="3">Tổng cộng</td>
                    <td>{summary.totalAppointments} lịch hẹn</td>
                    <td>{summary.completedCount} hoàn thành</td>
                    <td>
                      {summary.cancelledCount} huỷ · {summary.noShowCount} không đến
                    </td>
                    <td>{summary.completionRate}% hoàn thành</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedAppointment && (
        <div
          className="appointment-report-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="appointment-report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-report-modal-header">
              <div>
                <h3>Chi tiết lịch hẹn {selectedAppointment.maLH}</h3>
                <p>{selectedAppointment.customer}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="appointment-report-modal-grid">
              <div>
                <span>Khách hàng</span>
                <strong>{selectedAppointment.customer}</strong>
                <p>{selectedAppointment.phone}</p>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{selectedAppointment.trangThai}</strong>
              </div>

              <div>
                <span>Bắt đầu</span>
                <strong>{formatDateTime(selectedAppointment.thoiGianBatDau)}</strong>
              </div>

              <div>
                <span>Kết thúc</span>
                <strong>{formatDateTime(selectedAppointment.thoiGianKetThuc)}</strong>
              </div>
            </div>

            <div className="appointment-report-modal-section">
              <h4>Dịch vụ trong lịch hẹn</h4>

              <div className="appointment-report-modal-service-table-wrapper">
                <table className="appointment-report-modal-service-table">
                  <thead>
                    <tr>
                      <th>Mã DV</th>
                      <th>Tên dịch vụ</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Thời lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedAppointment.serviceDetails?.length > 0 ? (
                      selectedAppointment.serviceDetails.map((service) => (
                        <tr key={service.serviceCode}>
                          <td className="appointment-report-code">
                            {service.serviceCode}
                          </td>

                          <td>{service.serviceName}</td>

                          <td>{service.quantity}</td>

                          <td>{formatMoney(service.price)}</td>

                          <td>{service.duration} phút</td>

                          <td className="appointment-report-money">
                            {formatMoney(service.quantity * service.price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <div className="appointment-report-empty">
                            Chưa có dịch vụ trong lịch hẹn
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="appointment-report-modal-service-total">
                  <span>Tổng tiền dịch vụ</span>
                  <strong>{formatMoney(getAppointmentTotal(selectedAppointment))}</strong>
                </div>
              </div>
            </div>

            {selectedAppointment.ghiChu && (
              <div className="appointment-report-modal-section">
                <h4>Ghi chú</h4>
                <p>{selectedAppointment.ghiChu}</p>
              </div>
            )}

            {selectedAppointment.lyDoHuy && (
              <div className="appointment-report-cancel-reason">
                <h4>Lý do huỷ / không đến</h4>
                <p>{selectedAppointment.lyDoHuy}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentReport
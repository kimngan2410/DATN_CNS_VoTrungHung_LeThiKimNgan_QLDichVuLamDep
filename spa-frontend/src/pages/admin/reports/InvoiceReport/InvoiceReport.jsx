import React, { useCallback, useEffect, useState } from "react"
import {
  CalendarDays,
  Download,
  Search,
  Filter,
  ReceiptText,
  CircleDollarSign,
  CreditCard,
  Wallet,
  Landmark,
  Eye,
  X,
  RotateCcw,
} from "lucide-react"

import { getAdminInvoiceReportApi } from "../../../../services/adminInvoiceReportApi"
import "./InvoiceReport.css"

const paymentOptions = [
  "Tất cả",
  "Tiền mặt",
  "Chuyển khoản",
  "Thẻ ngân hàng",
]

const statusOptions = ["Tất cả", "Đã thanh toán", "Đã huỷ"]

const defaultReportData = {
  fromDate: "",
  toDate: "",
  keyword: "",
  paymentMethod: "Tất cả",
  status: "Tất cả",
  summary: {
    totalRevenue: 0,
    cancelledValue: 0,
    totalInvoices: 0,
    paidCount: 0,
    cancelledCount: 0,
    cashRevenue: 0,
    transferRevenue: 0,
    cardRevenue: 0,
    otherRevenue: 0,
  },
  invoices: [],
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

const getServiceTotal = (invoice) => {
  return (invoice.services || []).reduce((sum, service) => {
    return sum + Number(service.total || service.quantity * service.price || 0)
  }, 0)
}

function InvoiceReport() {
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth())
  const [toDate, setToDate] = useState(getTodayInputValue())
  const [keyword, setKeyword] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const [reportData, setReportData] = useState(defaultReportData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchInvoiceReport = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminInvoiceReportApi({
        fromDate,
        toDate,
        keyword,
        paymentMethod: paymentFilter,
        status: statusFilter,
      })

      setReportData({
        ...defaultReportData,
        ...data,
        summary: {
          ...defaultReportData.summary,
          ...(data?.summary || {}),
        },
        invoices: data?.invoices || [],
      })
    } catch (error) {
      setErrorMessage(
        error.message || "Không thể tải báo cáo giao dịch hoá đơn."
      )
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, keyword, paymentFilter, statusFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoiceReport()
  }, [fetchInvoiceReport])

  const filteredInvoices = reportData.invoices || []
  const summary = reportData.summary || defaultReportData.summary

  const handleResetFilter = () => {
    setFromDate(getFirstDayOfCurrentMonth())
    setToDate(getTodayInputValue())
    setKeyword("")
    setPaymentFilter("Tất cả")
    setStatusFilter("Tất cả")
  }

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo giao dịch hoá đơn"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["Từ khoá", keyword],
      ["Phương thức thanh toán", paymentFilter],
      ["Trạng thái", statusFilter],
      [],
      [
        "Mã hoá đơn",
        "Mã lịch hẹn",
        "Khách hàng",
        "Email",
        "Phương thức thanh toán",
        "Giá trị hoá đơn",
        "Thời gian tạo/thanh toán",
        "Trạng thái",
        "Ghi chú",
      ],
      ...filteredInvoices.map((invoice) => [
        invoice.invoiceCode,
        invoice.appointmentCode,
        invoice.customer,
        invoice.customerEmail,
        invoice.paymentMethod,
        invoice.totalAmount,
        formatDateTime(invoice.paidAt),
        invoice.status,
        invoice.note,
      ]),
      [],
      ["Doanh thu thực tính", summary.totalRevenue],
      ["Tổng hoá đơn", summary.totalInvoices],
      ["Hoá đơn đã thanh toán", summary.paidCount],
      ["Hoá đơn đã huỷ", summary.cancelledCount],
      ["Giá trị hoá đơn đã huỷ", summary.cancelledValue],
      ["Doanh thu tiền mặt", summary.cashRevenue],
      ["Doanh thu chuyển khoản", summary.transferRevenue],
      ["Doanh thu thẻ ngân hàng", summary.cardRevenue],
      ["Doanh thu khác", summary.otherRevenue],
    ]

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `bao-cao-giao-dich-hoa-don-${fromDate}-${toDate}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="invoice-report-page">
      <section className="invoice-report-filter-card">
        <div className="invoice-report-filter-left">
          <label className="invoice-report-date-picker">
            <CalendarDays size={17} />
            <span>{formatDateVN(fromDate)}</span>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <span className="invoice-report-date-separator">-</span>

          <label className="invoice-report-date-picker">
            <span>{formatDateVN(toDate)}</span>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="invoice-report-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Nhập mã HĐ, mã lịch hẹn, khách hàng..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="invoice-report-filter-item">
            <Filter size={17} />
            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
            >
              {paymentOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="invoice-report-filter-item">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="invoice-report-actions">
          <button
            type="button"
            className="invoice-report-reset-btn"
            onClick={handleResetFilter}
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="invoice-report-export-btn"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      {isLoading && (
        <div className="invoice-report-state-card">
          Đang tải báo cáo giao dịch hoá đơn...
        </div>
      )}

      {errorMessage && (
        <div className="invoice-report-state-card">
          <p>{errorMessage}</p>

          <button
            type="button"
            className="invoice-report-export-btn"
            onClick={fetchInvoiceReport}
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="invoice-report-summary-grid">
            <div className="invoice-report-summary-card">
              <div className="invoice-report-summary-icon">
                <CircleDollarSign size={22} />
              </div>

              <p>Doanh thu thực tính</p>
              <h2>{formatMoney(summary.totalRevenue)}</h2>
              <span>Chỉ tính hoá đơn đã thanh toán</span>
            </div>

            <div className="invoice-report-summary-card">
              <div className="invoice-report-summary-icon">
                <ReceiptText size={22} />
              </div>

              <p>Tổng hoá đơn</p>
              <h2>{summary.totalInvoices}</h2>
              <span>
                {summary.paidCount} thanh toán · {summary.cancelledCount} huỷ
              </span>
            </div>

            <div className="invoice-report-summary-card">
              <div className="invoice-report-summary-icon">
                <Wallet size={22} />
              </div>

              <p>Tiền mặt</p>
              <h2>{formatMoney(summary.cashRevenue)}</h2>
              <span>Doanh thu tiền mặt</span>
            </div>

            <div className="invoice-report-summary-card">
              <div className="invoice-report-summary-icon">
                <Landmark size={22} />
              </div>

              <p>Chuyển khoản</p>
              <h2>{formatMoney(summary.transferRevenue)}</h2>
              <span>Doanh thu chuyển khoản</span>
            </div>

            <div className="invoice-report-summary-card">
              <div className="invoice-report-summary-icon">
                <CreditCard size={22} />
              </div>

              <p>Thẻ ngân hàng</p>
              <h2>{formatMoney(summary.cardRevenue)}</h2>
              <span>Doanh thu thanh toán thẻ</span>
            </div>
          </section>

          <section className="invoice-report-table-card">
            <div className="invoice-report-table-header">
              <div>
                <h3>Báo cáo giao dịch hoá đơn</h3>
                <p>
                  Hiển thị <strong>{filteredInvoices.length}</strong> hoá đơn
                </p>
              </div>

              <div className="invoice-report-table-total">
                Doanh thu thực tính:{" "}
                <strong>{formatMoney(summary.totalRevenue)}</strong>
              </div>
            </div>

            <div className="invoice-report-table-wrapper">
              <table className="invoice-report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mã hoá đơn</th>
                    <th>Mã lịch hẹn</th>
                    <th>Khách hàng</th>
                    <th>PTTT</th>
                    <th>Giá trị hoá đơn</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice, index) => (
                      <tr key={invoice.id}>
                        <td>{index + 1}</td>

                        <td className="invoice-report-code">
                          {invoice.invoiceCode}
                        </td>

                        <td>{invoice.appointmentCode}</td>

                        <td>{invoice.customer}</td>

                        <td>{invoice.paymentMethod}</td>

                        <td className="invoice-report-money">
                          {formatMoney(invoice.totalAmount)}
                        </td>

                        <td>{formatDateTime(invoice.paidAt)}</td>

                        <td>
                          <span
                            className={
                              invoice.status === "Đã thanh toán"
                                ? "invoice-report-status paid"
                                : "invoice-report-status cancelled"
                            }
                          >
                            {invoice.status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="invoice-report-view-btn"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">
                        <div className="invoice-report-empty">
                          Chưa có hoá đơn phù hợp
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan="5">Tổng cộng</td>
                    <td>{formatMoney(summary.totalRevenue)}</td>
                    <td colSpan="3">
                      {summary.paidCount} thanh toán ·{" "}
                      {summary.cancelledCount} huỷ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}

      {selectedInvoice && (
        <div
          className="invoice-report-modal-overlay"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="invoice-report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="invoice-report-modal-header">
              <div>
                <h3>Chi tiết hoá đơn {selectedInvoice.invoiceCode}</h3>
                <p>
                  {selectedInvoice.customer} ·{" "}
                  {formatDateTime(selectedInvoice.paidAt)}
                </p>
              </div>

              <button type="button" onClick={() => setSelectedInvoice(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="invoice-report-modal-summary">
              <div>
                <span>Mã lịch hẹn</span>
                <strong>{selectedInvoice.appointmentCode}</strong>
              </div>

              <div>
                <span>Phương thức</span>
                <strong>{selectedInvoice.paymentMethod}</strong>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{selectedInvoice.status}</strong>
              </div>
            </div>

            {selectedInvoice.status === "Đã huỷ" && (
              <div className="invoice-report-cancel-note">
                Hoá đơn này đã bị huỷ để lưu vết giao dịch và không được tính
                vào doanh thu thực tế.
              </div>
            )}

            <div className="invoice-report-detail-section">
              <div className="invoice-report-detail-title">
                <h4>Dịch vụ trong hoá đơn</h4>
                <span>{selectedInvoice.services?.length || 0} dịch vụ</span>
              </div>

              <div className="invoice-report-service-list">
                {selectedInvoice.services?.length > 0 ? (
                  selectedInvoice.services.map((service) => (
                    <div
                      className="invoice-report-service-item"
                      key={service.serviceCode}
                    >
                      <div>
                        <h4>{service.serviceName}</h4>
                        <p>
                          {service.serviceCode} · SL: {service.quantity}
                        </p>
                      </div>

                      <strong>
                        {formatMoney(service.total || service.quantity * service.price)}
                      </strong>
                    </div>
                  ))
                ) : (
                  <div className="invoice-report-empty">
                    Chưa có dịch vụ trong hoá đơn này
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-report-total-box">
              <div>
                <span>Tạm tính</span>
                <strong>{formatMoney(getServiceTotal(selectedInvoice))}</strong>
              </div>

              <div>
                <span>Giảm giá</span>
                <strong>{formatMoney(selectedInvoice.discount)}</strong>
              </div>

              <div className="final">
                <span>
                  {selectedInvoice.status === "Đã huỷ"
                    ? "Giá trị hoá đơn"
                    : "Tổng thanh toán"}
                </span>
                <strong>{formatMoney(selectedInvoice.totalAmount)}</strong>
              </div>
            </div>

            <div className="invoice-report-note">
              <span>Ghi chú:</span> {selectedInvoice.note}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceReport
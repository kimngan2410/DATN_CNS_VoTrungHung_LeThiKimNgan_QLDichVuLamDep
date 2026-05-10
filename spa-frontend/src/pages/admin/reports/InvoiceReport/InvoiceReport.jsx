import React, { useMemo, useState } from "react"
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
import "./InvoiceReport.css"

const invoiceRows = [
  {
    id: 1,
    invoiceCode: "HD001",
    appointmentCode: "LH001",
    customer: "Nguyễn Thị Hoa",
    staff: "Trần Thị Bích",
    paymentMethod: "Chuyển khoản",
    totalAmount: 750000,
    paidAt: "2026-05-01T09:30:00",
    status: "Đã thanh toán",
    note: "Khách đã thanh toán đủ.",
    services: [
      {
        serviceCode: "DV001",
        serviceName: "Chăm sóc da mặt",
        quantity: 1,
        price: 400000,
      },
      {
        serviceCode: "DV002",
        serviceName: "Gội đầu dưỡng sinh",
        quantity: 1,
        price: 350000,
      },
    ],
    discount: 0,
  },
  {
    id: 2,
    invoiceCode: "HD002",
    appointmentCode: "LH002",
    customer: "Trần Văn Nam",
    staff: "Trần Thị Bích",
    paymentMethod: "Tiền mặt",
    totalAmount: 500000,
    paidAt: "2026-05-01T10:15:00",
    status: "Đã thanh toán",
    note: "Thanh toán tại quầy.",
    services: [
      {
        serviceCode: "DV003",
        serviceName: "Massage body",
        quantity: 1,
        price: 500000,
      },
    ],
    discount: 0,
  },
  {
    id: 3,
    invoiceCode: "HD003",
    appointmentCode: "LH003",
    customer: "Lê Mai Anh",
    staff: "Nguyễn Thu Hà",
    paymentMethod: "Thẻ ngân hàng",
    totalAmount: 850000,
    paidAt: "2026-05-02T14:20:00",
    status: "Đã thanh toán",
    note: "Thanh toán bằng thẻ ngân hàng.",
    services: [
      {
        serviceCode: "DV004",
        serviceName: "Điều trị mụn chuyên sâu",
        quantity: 1,
        price: 850000,
      },
    ],
    discount: 0,
  },
  {
    id: 4,
    invoiceCode: "HD004",
    appointmentCode: "LH004",
    customer: "Phạm Thu Thủy",
    staff: "Phạm Minh Đạt",
    paymentMethod: "Chuyển khoản",
    totalAmount: 1200000,
    paidAt: "2026-05-03T11:00:00",
    status: "Đã thanh toán",
    note: "Khách sử dụng combo dịch vụ.",
    services: [
      {
        serviceCode: "DV005",
        serviceName: "Tắm trắng phi thuyền",
        quantity: 1,
        price: 700000,
      },
      {
        serviceCode: "DV003",
        serviceName: "Massage body",
        quantity: 1,
        price: 500000,
      },
    ],
    discount: 0,
  },
  {
    id: 5,
    invoiceCode: "HD005",
    appointmentCode: "LH005",
    customer: "Hoàng Minh Tuấn",
    staff: "Trần Thị Bích",
    paymentMethod: "Tiền mặt",
    totalAmount: 650000,
    paidAt: "2026-05-04T15:30:00",
    status: "Đã thanh toán",
    note: "Có giảm giá khách quen.",
    services: [
      {
        serviceCode: "DV006",
        serviceName: "Massage cổ vai gáy",
        quantity: 1,
        price: 700000,
      },
    ],
    discount: 50000,
  },
  {
    id: 6,
    invoiceCode: "HD006",
    appointmentCode: "LH006",
    customer: "Đỗ Khánh Linh",
    staff: "Nguyễn Thu Hà",
    paymentMethod: "Chuyển khoản",
    totalAmount: 350000,
    paidAt: "2026-05-05T16:10:00",
    status: "Đã thanh toán",
    note: "Thanh toán qua ngân hàng.",
    services: [
      {
        serviceCode: "DV002",
        serviceName: "Gội đầu dưỡng sinh",
        quantity: 1,
        price: 350000,
      },
    ],
    discount: 0,
  },
  {
    id: 7,
    invoiceCode: "HD007",
    appointmentCode: "LH007",
    customer: "Võ Ngọc Anh",
    staff: "Phạm Minh Đạt",
    paymentMethod: "Chuyển khoản",
    totalAmount: 950000,
    paidAt: "2026-05-06T13:45:00",
    status: "Đã thanh toán",
    note: "Dịch vụ chăm sóc da chuyên sâu.",
    services: [
      {
        serviceCode: "DV007",
        serviceName: "Chăm sóc da mặt chuyên sâu",
        quantity: 1,
        price: 950000,
      },
    ],
    discount: 0,
  },
  {
    id: 8,
    invoiceCode: "HD008",
    appointmentCode: "LH008",
    customer: "Bùi Thanh Hà",
    staff: "Trần Thị Bích",
    paymentMethod: "Tiền mặt",
    totalAmount: 1200000,
    paidAt: "2026-05-06T17:10:00",
    status: "Đã huỷ",
    note: "Hoá đơn bị huỷ do lập sai thông tin dịch vụ, lễ tân cần lập lại hoá đơn mới.",
    services: [
      {
        serviceCode: "DV005",
        serviceName: "Tắm trắng phi thuyền",
        quantity: 1,
        price: 1200000,
      },
    ],
    discount: 0,
  },
  {
    id: 9,
    invoiceCode: "HD009",
    appointmentCode: "LH009",
    customer: "Mai Phương",
    staff: "Nguyễn Thu Hà",
    paymentMethod: "Thẻ ngân hàng",
    totalAmount: 680000,
    paidAt: "2026-05-07T09:40:00",
    status: "Đã thanh toán",
    note: "Khách thanh toán thành công.",
    services: [
      {
        serviceCode: "DV001",
        serviceName: "Chăm sóc da mặt",
        quantity: 1,
        price: 400000,
      },
      {
        serviceCode: "DV008",
        serviceName: "Đắp mặt nạ collagen",
        quantity: 1,
        price: 280000,
      },
    ],
    discount: 0,
  },
]

const paymentOptions = [
  "Tất cả",
  "Tiền mặt",
  "Chuyển khoản",
  "Thẻ ngân hàng",
]

const statusOptions = ["Tất cả", "Đã thanh toán", "Đã huỷ"]

const formatMoney = (value) => {
  return `${Number(value).toLocaleString("vi-VN")} đ`
}

const formatDateTime = (dateValue) => {
  const date = new Date(dateValue)

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const getServiceTotal = (invoice) => {
  return invoice.services.reduce((sum, service) => {
    return sum + service.quantity * service.price
  }, 0)
}

function InvoiceReport() {
  const [fromDate, setFromDate] = useState("2026-05-01")
  const [toDate, setToDate] = useState("2026-05-07")
  const [keyword, setKeyword] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const filteredInvoices = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase()
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)

    return invoiceRows.filter((invoice) => {
      const paidDate = new Date(invoice.paidAt)

      const matchDate = paidDate >= from && paidDate <= to

      const matchKeyword =
        invoice.invoiceCode.toLowerCase().includes(keywordText) ||
        invoice.appointmentCode.toLowerCase().includes(keywordText) ||
        invoice.customer.toLowerCase().includes(keywordText) ||
        invoice.staff.toLowerCase().includes(keywordText)

      const matchPayment =
        paymentFilter === "Tất cả" || invoice.paymentMethod === paymentFilter

      const matchStatus =
        statusFilter === "Tất cả" || invoice.status === statusFilter

      return matchDate && matchKeyword && matchPayment && matchStatus
    })
  }, [fromDate, toDate, keyword, paymentFilter, statusFilter])

  const summary = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(
      (invoice) => invoice.status === "Đã thanh toán"
    )

    const cancelledInvoices = filteredInvoices.filter(
      (invoice) => invoice.status === "Đã huỷ"
    )

    const totalRevenue = paidInvoices.reduce((sum, invoice) => {
      return sum + invoice.totalAmount
    }, 0)

    const cancelledValue = cancelledInvoices.reduce((sum, invoice) => {
      return sum + invoice.totalAmount
    }, 0)

    const cashRevenue = paidInvoices
      .filter((invoice) => invoice.paymentMethod === "Tiền mặt")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0)

    const transferRevenue = paidInvoices
      .filter((invoice) => invoice.paymentMethod === "Chuyển khoản")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0)

    const cardRevenue = paidInvoices
      .filter((invoice) => invoice.paymentMethod === "Thẻ ngân hàng")
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0)

    return {
      totalRevenue,
      cancelledValue,
      totalInvoices: filteredInvoices.length,
      paidCount: paidInvoices.length,
      cancelledCount: cancelledInvoices.length,
      cashRevenue,
      transferRevenue,
      cardRevenue,
    }
  }, [filteredInvoices])

  const handleResetFilter = () => {
    setFromDate("2026-05-01")
    setToDate("2026-05-07")
    setKeyword("")
    setPaymentFilter("Tất cả")
    setStatusFilter("Tất cả")
  }

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo giao dịch hoá đơn"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["Phương thức thanh toán", paymentFilter],
      ["Trạng thái", statusFilter],
      [],
      [
        "Mã hoá đơn",
        "Mã lịch hẹn",
        "Khách hàng",
        "Nhân viên",
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
        invoice.staff,
        invoice.paymentMethod,
        invoice.totalAmount,
        formatDateTime(invoice.paidAt),
        invoice.status,
        invoice.note,
      ]),
      [],
      ["Tổng doanh thu thực tính", summary.totalRevenue],
      ["Tổng hoá đơn", summary.totalInvoices],
      ["Hoá đơn đã thanh toán", summary.paidCount],
      ["Hoá đơn đã huỷ", summary.cancelledCount],
      ["Giá trị hoá đơn đã huỷ", summary.cancelledValue],
      ["Doanh thu tiền mặt", summary.cashRevenue],
      ["Doanh thu chuyển khoản", summary.transferRevenue],
      ["Doanh thu thẻ ngân hàng", summary.cardRevenue],
    ]

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "bao-cao-giao-dich-hoa-don.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="invoice-report-page">
      <section className="invoice-report-filter-card">
        <div className="invoice-report-filter-left">
          <div className="invoice-report-filter-item">
            <CalendarDays size={17} />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <span className="invoice-report-date-separator">-</span>

          <div className="invoice-report-filter-item">
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

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
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="invoice-report-export-btn"
            onClick={handleExportReport}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

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
                <th>Nhân viên</th>
                <th>PTTT</th>
                <th>Giá trị hoá đơn</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th></th>
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
                    <td>{invoice.staff}</td>
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
                  <td colSpan="10">
                    <div className="invoice-report-empty">
                      Chưa có hoá đơn phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="6">Tổng cộng</td>
                <td>{formatMoney(summary.totalRevenue)}</td>
                <td colSpan="3">
                  {summary.paidCount} thanh toán · {summary.cancelledCount} huỷ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

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
                <span>{selectedInvoice.services.length} dịch vụ</span>
              </div>

              <div className="invoice-report-service-list">
                {selectedInvoice.services.map((service) => (
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
                      {formatMoney(service.quantity * service.price)}
                    </strong>
                  </div>
                ))}
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
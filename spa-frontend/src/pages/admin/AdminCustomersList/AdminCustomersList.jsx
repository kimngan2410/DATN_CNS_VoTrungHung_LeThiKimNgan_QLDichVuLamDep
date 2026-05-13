import React, { useMemo, useState } from "react"
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
} from "lucide-react"
import "./AdminCustomersList.css"

const SPA_OPENING_YEAR = 2020

const customerList = [
  {
    id: "KH001",
    accountId: "TK001",
    fullName: "Nguyễn Thị Hoa",
    avatarText: "N",
    email: "hoa.nguyen@email.com",
    phone: "0901234567",
    gender: "Nữ",
    birthday: "1998-05-12",
    createdAt: "01/10/2023",
    status: "Hoạt động",
    customerType: "VIP",
    appointments: [
      {
        id: "LH001",
        date: "04/05/2026",
        time: "09:00",
        services: "Massage body, Gội đầu dưỡng sinh",
        status: "Đã hoàn thành",
      },
      {
        id: "LH006",
        date: "05/05/2026",
        time: "10:00",
        services: "Tắm trắng",
        status: "Đã xác nhận",
      },
      {
        id: "LH009",
        date: "18/04/2026",
        time: "14:00",
        services: "Chăm sóc da mặt",
        status: "Đã hoàn thành",
      },
    ],
    invoices: [
      {
        invoiceId: "HD001",
        appointmentId: "LH001",
        paidAt: "04/05/2026",
        paymentMethod: "Chuyển khoản",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV001",
            serviceName: "Massage body",
            quantity: 1,
            unitPrice: 500000,
          },
          {
            serviceId: "DV002",
            serviceName: "Gội đầu dưỡng sinh",
            quantity: 1,
            unitPrice: 250000,
          },
        ],
      },
      {
        invoiceId: "HD009",
        appointmentId: "LH009",
        paidAt: "18/04/2026",
        paymentMethod: "Tiền mặt",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV003",
            serviceName: "Chăm sóc da mặt",
            quantity: 1,
            unitPrice: 400000,
          },
        ],
      },
    ],
  },
  {
    id: "KH002",
    accountId: "TK002",
    fullName: "Trần Văn Nam",
    avatarText: "T",
    email: "nam.tran@email.com",
    phone: "0912345678",
    gender: "Nam",
    birthday: "1995-08-20",
    createdAt: "15/10/2023",
    status: "Hoạt động",
    customerType: "Thường",
    appointments: [
      {
        id: "LH002",
        date: "02/05/2026",
        time: "14:30",
        services: "Chăm sóc da mặt",
        status: "Đã hoàn thành",
      },
      {
        id: "LH010",
        date: "21/04/2026",
        time: "16:00",
        services: "Massage cổ vai gáy",
        status: "Đã hoàn thành",
      },
    ],
    invoices: [
      {
        invoiceId: "HD002",
        appointmentId: "LH002",
        paidAt: "02/05/2026",
        paymentMethod: "Thẻ ngân hàng",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV003",
            serviceName: "Chăm sóc da mặt",
            quantity: 1,
            unitPrice: 400000,
          },
          {
            serviceId: "DV010",
            serviceName: "Đắp mặt nạ collagen",
            quantity: 1,
            unitPrice: 100000,
          },
        ],
      },
      {
        invoiceId: "HD010",
        appointmentId: "LH010",
        paidAt: "21/04/2026",
        paymentMethod: "Tiền mặt",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV004",
            serviceName: "Massage cổ vai gáy",
            quantity: 1,
            unitPrice: 200000,
          },
        ],
      },
    ],
  },
  {
    id: "KH003",
    accountId: "TK003",
    fullName: "Lê Mai Anh",
    avatarText: "L",
    email: "maianh.le@email.com",
    phone: "0987654321",
    gender: "Nữ",
    birthday: "2000-11-04",
    createdAt: "05/11/2023",
    status: "Khóa",
    customerType: "Thường",
    appointments: [
      {
        id: "LH003",
        date: "20/04/2026",
        time: "16:00",
        services: "Nail art",
        status: "Đã huỷ",
      },
      {
        id: "LH011",
        date: "12/04/2026",
        time: "10:30",
        services: "Sơn gel",
        status: "Đã hoàn thành",
      },
    ],
    invoices: [
      {
        invoiceId: "HD011",
        appointmentId: "LH011",
        paidAt: "12/04/2026",
        paymentMethod: "Tiền mặt",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV006",
            serviceName: "Sơn gel",
            quantity: 1,
            unitPrice: 180000,
          },
        ],
      },
    ],
  },
  {
    id: "KH004",
    accountId: "TK004",
    fullName: "Phạm Thu Thủy",
    avatarText: "P",
    email: "thuy.pham@email.com",
    phone: "0933445566",
    gender: "Nữ",
    birthday: "1997-03-18",
    createdAt: "20/11/2023",
    status: "Hoạt động",
    customerType: "VIP",
    appointments: [
      {
        id: "LH004",
        date: "03/05/2026",
        time: "11:00",
        services: "Tắm trắng, Massage body",
        status: "Đã hoàn thành",
      },
      {
        id: "LH012",
        date: "15/04/2026",
        time: "09:30",
        services: "Gội đầu dưỡng sinh",
        status: "Đã hoàn thành",
      },
    ],
    invoices: [
      {
        invoiceId: "HD004",
        appointmentId: "LH004",
        paidAt: "03/05/2026",
        paymentMethod: "Chuyển khoản",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV007",
            serviceName: "Tắm trắng",
            quantity: 1,
            unitPrice: 700000,
          },
          {
            serviceId: "DV001",
            serviceName: "Massage body",
            quantity: 1,
            unitPrice: 500000,
          },
        ],
      },
      {
        invoiceId: "HD012",
        appointmentId: "LH012",
        paidAt: "15/04/2026",
        paymentMethod: "Tiền mặt",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV002",
            serviceName: "Gội đầu dưỡng sinh",
            quantity: 1,
            unitPrice: 250000,
          },
        ],
      },
    ],
  },
  {
    id: "KH005",
    accountId: "TK005",
    fullName: "Hoàng Minh Tuấn",
    avatarText: "H",
    email: "tuan.hoang@email.com",
    phone: "0977889900",
    gender: "Nam",
    birthday: "1992-07-09",
    createdAt: "02/12/2023",
    status: "Hoạt động",
    customerType: "Thường",
    appointments: [
      {
        id: "LH005",
        date: "29/04/2026",
        time: "15:30",
        services: "Massage cổ vai gáy",
        status: "Đã hoàn thành",
      },
    ],
    invoices: [
      {
        invoiceId: "HD005",
        appointmentId: "LH005",
        paidAt: "29/04/2026",
        paymentMethod: "Thẻ ngân hàng",
        paymentStatus: "Đã thanh toán",
        details: [
          {
            serviceId: "DV004",
            serviceName: "Massage cổ vai gáy",
            quantity: 1,
            unitPrice: 200000,
          },
        ],
      },
    ],
  },
]

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

const getCurrentYear = () => {
  return new Date().getFullYear()
}

const yearOptions = Array.from(
  { length: getCurrentYear() - SPA_OPENING_YEAR + 1 },
  (_, index) => String(getCurrentYear() - index)
)

const getDateParts = (dateText) => {
  const [day, month, year] = dateText.split("/")

  return {
    day,
    month,
    year,
  }
}

const formatMoney = (value) => {
  return `${value.toLocaleString("vi-VN")} đ`
}

const escapeCsvValue = (value) => {
  const text = String(value ?? "")

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

const getInvoiceTotal = (invoice) => {
  return invoice.details.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)
}

const getPaidInvoices = (customer) => {
  return customer.invoices.filter(
    (invoice) => invoice.paymentStatus === "Đã thanh toán"
  )
}

const getTotalSpent = (customer) => {
  return getPaidInvoices(customer).reduce((sum, invoice) => {
    return sum + getInvoiceTotal(invoice)
  }, 0)
}

const getServiceUsageHistory = (customer) => {
  return getPaidInvoices(customer).flatMap((invoice) =>
    invoice.details.map((detail) => ({
      id: `${invoice.invoiceId}-${detail.serviceId}`,
      invoiceId: invoice.invoiceId,
      appointmentId: invoice.appointmentId,
      serviceName: detail.serviceName,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      total: detail.quantity * detail.unitPrice,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
    }))
  )
}

const getLastPaidDate = (customer) => {
  const paidInvoices = getPaidInvoices(customer)

  if (paidInvoices.length === 0) {
    return "Chưa có"
  }

  return paidInvoices[0].paidAt
}

function AdminCustomers() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [genderFilter, setGenderFilter] = useState("Tất cả")
  const [monthFilter, setMonthFilter] = useState("Tất cả")
  const [yearFilter, setYearFilter] = useState("Tất cả")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return customerList.filter((customer) => {
      const matchKeyword =
        customer.fullName.toLowerCase().includes(keyword) ||
        customer.phone.includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        customer.id.toLowerCase().includes(keyword)

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
  }, [searchText, statusFilter, genderFilter, monthFilter, yearFilter])

  const handleResetFilter = () => {
    setSearchText("")
    setStatusFilter("Tất cả")
    setGenderFilter("Tất cả")
    setMonthFilter("Tất cả")
    setYearFilter("Tất cả")
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
        customer.id,
        customer.accountId,
        customer.fullName,
        customer.email,
        customer.phone,
        customer.gender,
        customer.birthday,
        customer.createdAt,
        customer.status,
        customer.customerType,
        customer.appointments.length,
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

  const handleCloseCustomerModal = () => {
    setSelectedCustomer(null)
    setHistoryModal(null)
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
              <option>Hoạt động</option>
              <option>Khóa</option>
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
                  <tr key={customer.id}>
                    <td className="admin-customer-code">{customer.id}</td>

                    <td>
                      <div className="admin-customer-info">
                        <div className="admin-customer-avatar">
                          {customer.avatarText}
                        </div>

                        <div>
                          <h4>{customer.fullName}</h4>
                          <p>{customer.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>{customer.phone}</td>
                    <td>{customer.gender}</td>
                    <td>{customer.createdAt}</td>

                    <td>
                      <span
                        className={
                          customer.status === "Hoạt động"
                            ? "admin-status-badge active"
                            : "admin-status-badge locked"
                        }
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td className="admin-customers-action-td">
                      <button
                        type="button"
                        className="admin-view-btn"
                        title="Xem chi tiết"
                        onClick={() => setSelectedCustomer(customer)}
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
                <p>{selectedCustomer.id}</p>
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
                {selectedCustomer.avatarText}
              </div>

              <div>
                <h3>{selectedCustomer.fullName}</h3>
                <p>{selectedCustomer.customerType}</p>
              </div>

              <span
                className={
                  selectedCustomer.status === "Hoạt động"
                    ? "admin-status-badge active"
                    : "admin-status-badge locked"
                }
              >
                {selectedCustomer.status}
              </span>
            </div>

            <div className="admin-customer-detail-grid">
              <div className="admin-detail-item">
                <Phone size={17} />
                <div>
                  <span>Số điện thoại</span>
                  <strong>{selectedCustomer.phone}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <Mail size={17} />
                <div>
                  <span>Email</span>
                  <strong>{selectedCustomer.email}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <UserRound size={17} />
                <div>
                  <span>Giới tính</span>
                  <strong>{selectedCustomer.gender}</strong>
                </div>
              </div>

              <div className="admin-detail-item">
                <CalendarDays size={17} />
                <div>
                  <span>Ngày sinh</span>
                  <strong>{selectedCustomer.birthday}</strong>
                </div>
              </div>
            </div>

            <div className="admin-customer-stat-grid">
              <div>
                <Clock3 size={18} />
                <span>Lịch hẹn</span>
                <strong>{selectedCustomer.appointments.length}</strong>
              </div>

              <div>
                <Wallet size={18} />
                <span>Chi tiêu</span>
                <strong>{formatMoney(getTotalSpent(selectedCustomer))}</strong>
              </div>

              <div>
                <ReceiptText size={18} />
                <span>Lần thanh toán gần nhất</span>
                <strong>{getLastPaidDate(selectedCustomer)}</strong>
              </div>
            </div>

            <div className="admin-customer-history-grid">
              <div className="admin-history-card">
                <div className="admin-history-card-header">
                  <h3>Lịch sử lịch hẹn</h3>

                  <button
                    type="button"
                    onClick={() =>
                      setHistoryModal({
                        title: "Tất cả lịch sử lịch hẹn",
                        type: "appointments",
                        data: selectedCustomer.appointments,
                      })
                    }
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="admin-history-list">
                  {selectedCustomer.appointments
                    .slice(0, 2)
                    .map((appointment) => (
                      <div className="admin-history-item" key={appointment.id}>
                        <div>
                          <h4>{appointment.services}</h4>
                          <p>
                            {appointment.date} • {appointment.time}
                          </p>
                        </div>

                        <span>{appointment.status}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="admin-history-card">
                <div className="admin-history-card-header">
                  <h3>Dịch vụ đã sử dụng</h3>

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
                </div>

                <div className="admin-history-list">
                  {getServiceUsageHistory(selectedCustomer)
                    .slice(0, 2)
                    .map((service) => (
                      <div className="admin-history-item" key={service.id}>
                        <div>
                          <h4>{service.serviceName}</h4>
                          <p>
                            {service.paidAt} • {service.invoiceId}
                          </p>
                        </div>

                        <strong>{formatMoney(service.total)}</strong>
                      </div>
                    ))}
                </div>
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
              {historyModal.data.map((item) => (
                <div className="admin-history-modal-item" key={item.id}>
                  {historyModal.type === "appointments" ? (
                    <>
                      <div>
                        <h4>{item.services}</h4>
                        <p>
                          {item.date} • {item.time}
                        </p>
                      </div>

                      <span>{item.status}</span>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4>{item.serviceName}</h4>
                        <p>
                          {item.paidAt} • {item.invoiceId} • SL:{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <strong>{formatMoney(item.total)}</strong>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers
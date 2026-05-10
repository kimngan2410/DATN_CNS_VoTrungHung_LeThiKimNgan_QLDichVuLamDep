import React, { useMemo, useState } from "react"
import {
  CalendarDays,
  Download,
  CircleDollarSign,
  ReceiptText,
  UsersRound,
  TrendingUp,
  Eye,
  X,
  Filter,
  Sparkles,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import "./RevenueReport.css"

const ADMIN_GOLD = "#d7a93f"

const compareOptions = [
  "Không so sánh",
  "So với kỳ trước",
  "So với tháng trước",
  "So với năm trước",
]

const revenueRows = [
  {
    id: 1,
    date: "01/05/2026",
    invoices: 18,
    customers: 16,
    serviceRevenue: 42000000,
    discount: 2500000,
    netRevenue: 39500000,
    change: "+8.5%",
    categoryBreakdown: [
      { name: "Chăm sóc da mặt", revenue: 17000000 },
      { name: "Massage body", revenue: 10000000 },
      { name: "Gội đầu dưỡng sinh", revenue: 7000000 },
      { name: "Khác", revenue: 5500000 },
    ],
  },
  {
    id: 2,
    date: "02/05/2026",
    invoices: 15,
    customers: 14,
    serviceRevenue: 33500000,
    discount: 1800000,
    netRevenue: 31700000,
    change: "-3.2%",
    categoryBreakdown: [
      { name: "Chăm sóc da mặt", revenue: 13500000 },
      { name: "Điều trị mụn", revenue: 8200000 },
      { name: "Massage body", revenue: 5000000 },
      { name: "Khác", revenue: 5000000 },
    ],
  },
  {
    id: 3,
    date: "03/05/2026",
    invoices: 21,
    customers: 19,
    serviceRevenue: 58500000,
    discount: 3200000,
    netRevenue: 55300000,
    change: "+12.4%",
    categoryBreakdown: [
      { name: "Tắm trắng", revenue: 24000000 },
      { name: "Chăm sóc da mặt", revenue: 12000000 },
      { name: "Massage body", revenue: 14000000 },
      { name: "Khác", revenue: 5300000 },
    ],
  },
  {
    id: 4,
    date: "04/05/2026",
    invoices: 24,
    customers: 22,
    serviceRevenue: 64200000,
    discount: 4100000,
    netRevenue: 60100000,
    change: "+6.7%",
    categoryBreakdown: [
      { name: "Massage body", revenue: 18500000 },
      { name: "Chăm sóc da mặt", revenue: 21000000 },
      { name: "Gội đầu dưỡng sinh", revenue: 9600000 },
      { name: "Khác", revenue: 11000000 },
    ],
  },
  {
    id: 5,
    date: "05/05/2026",
    invoices: 20,
    customers: 18,
    serviceRevenue: 52000000,
    discount: 2500000,
    netRevenue: 49500000,
    change: "+4.1%",
    categoryBreakdown: [
      { name: "Gội đầu dưỡng sinh", revenue: 12000000 },
      { name: "Chăm sóc da mặt", revenue: 16000000 },
      { name: "Tắm trắng", revenue: 14500000 },
      { name: "Khác", revenue: 7000000 },
    ],
  },
  {
    id: 6,
    date: "06/05/2026",
    invoices: 28,
    customers: 25,
    serviceRevenue: 76500000,
    discount: 4300000,
    netRevenue: 72200000,
    change: "+15.8%",
    categoryBreakdown: [
      { name: "Chăm sóc da mặt", revenue: 27000000 },
      { name: "Điều trị mụn", revenue: 18000000 },
      { name: "Massage body", revenue: 16200000 },
      { name: "Khác", revenue: 11000000 },
    ],
  },
  {
    id: 7,
    date: "07/05/2026",
    invoices: 31,
    customers: 28,
    serviceRevenue: 90500000,
    discount: 5500000,
    netRevenue: 85000000,
    change: "+9.6%",
    categoryBreakdown: [
      { name: "Tắm trắng", revenue: 31000000 },
      { name: "Chăm sóc da mặt", revenue: 25000000 },
      { name: "Massage body", revenue: 18000000 },
      { name: "Khác", revenue: 11000000 },
    ],
  },
]

const formatMoney = (value) => {
  return `${Number(value).toLocaleString("vi-VN")} đ`
}

const formatCompactMoney = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `${Math.round(value / 1000000)}M`
  return `${Math.round(value / 1000)}K`
}

const parseDate = (dateText) => {
  const [day, month, year] = dateText.split("/")
  return new Date(`${year}-${month}-${day}`)
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="revenue-report-tooltip">
      <h4>{label}</h4>
      <p>Doanh thu: {formatMoney(payload[0].value)}</p>
    </div>
  )
}

function RevenueReport() {
  const [fromDate, setFromDate] = useState("2026-05-01")
  const [toDate, setToDate] = useState("2026-05-07")
  const [compare, setCompare] = useState("So với kỳ trước")
  const [detailRow, setDetailRow] = useState(null)

  const filteredRows = useMemo(() => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)

    return revenueRows.filter((row) => {
      const rowDate = parseDate(row.date)
      return rowDate >= from && rowDate <= to
    })
  }, [fromDate, toDate])

  const summary = useMemo(() => {
    const totalRevenue = filteredRows.reduce(
      (sum, row) => sum + row.netRevenue,
      0
    )

    const totalInvoices = filteredRows.reduce(
      (sum, row) => sum + row.invoices,
      0
    )

    const totalCustomers = filteredRows.reduce(
      (sum, row) => sum + row.customers,
      0
    )

    const totalDiscount = filteredRows.reduce(
      (sum, row) => sum + row.discount,
      0
    )

    const totalServiceRevenue = filteredRows.reduce(
      (sum, row) => sum + row.serviceRevenue,
      0
    )

    const averageInvoice = totalInvoices
      ? Math.round(totalRevenue / totalInvoices)
      : 0

    return {
      totalRevenue,
      totalInvoices,
      totalCustomers,
      totalDiscount,
      totalServiceRevenue,
      averageInvoice,
    }
  }, [filteredRows])

  const chartData = filteredRows.map((row) => ({
    date: row.date.slice(0, 5),
    revenue: row.netRevenue,
  }))

  const categoryRevenue = useMemo(() => {
    const categoryMap = {}

    filteredRows.forEach((row) => {
      row.categoryBreakdown.forEach((item) => {
        categoryMap[item.name] = (categoryMap[item.name] || 0) + item.revenue
      })
    })

    return Object.entries(categoryMap).map(([name, revenue]) => ({
      name,
      revenue,
    }))
  }, [filteredRows])

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo doanh thu"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["So sánh", compare],
      [],
      [
        "Ngày",
        "Số hoá đơn",
        "Số khách",
        "Doanh thu dịch vụ",
        "Giảm giá",
        "Doanh thu thuần",
        "Tăng/giảm",
      ],
      ...filteredRows.map((row) => [
        row.date,
        row.invoices,
        row.customers,
        row.serviceRevenue,
        row.discount,
        row.netRevenue,
        row.change,
      ]),
      [],
      ["Tổng doanh thu", summary.totalRevenue],
      ["Tổng hoá đơn", summary.totalInvoices],
      ["Tổng khách", summary.totalCustomers],
      ["Trung bình / hoá đơn", summary.averageInvoice],
    ]

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "bao-cao-doanh-thu.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="revenue-report-page">
      <section className="revenue-report-filter-card">
        <div className="revenue-report-filter-left">
          <div className="revenue-report-filter-item">
            <CalendarDays size={17} />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <span className="revenue-report-date-separator">-</span>

          <div className="revenue-report-filter-item">
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="revenue-report-filter-item">
            <Filter size={17} />
            <select
              value={compare}
              onChange={(event) => setCompare(event.target.value)}
            >
              {compareOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="revenue-report-export-btn"
          onClick={handleExportReport}
        >
          <Download size={17} />
          Xuất báo cáo
        </button>
      </section>

      <section className="revenue-report-summary-grid">
        <div className="revenue-report-summary-card">
          <p>Tổng doanh thu</p>
          <h2>{formatMoney(summary.totalRevenue)}</h2>
          <span className="up">
            <TrendingUp size={15} />
            +12.5% {compare !== "Không so sánh" ? compare.toLowerCase() : ""}
          </span>
        </div>

        <div className="revenue-report-summary-card">
          <p>Tổng hoá đơn</p>
          <h2>{summary.totalInvoices}</h2>
          <span>Hoá đơn đã thanh toán trong kỳ</span>
        </div>

        <div className="revenue-report-summary-card">
          <p>Tổng số khách</p>
          <h2>{summary.totalCustomers}</h2>
          <span>Khách sử dụng dịch vụ</span>
        </div>

        <div className="revenue-report-summary-card">
          <p>Trung bình / hoá đơn</p>
          <h2>{formatMoney(summary.averageInvoice)}</h2>
          <span>Giá trị trung bình</span>
        </div>
      </section>

      <section className="revenue-report-card">
        <div className="revenue-report-card-header">
          <div>
            <h3>Báo cáo doanh thu theo thời gian</h3>
            <p>Doanh thu được tổng hợp theo ngày từ các hoá đơn đã thanh toán.</p>
          </div>

          <strong>{formatMoney(summary.totalRevenue)}</strong>
        </div>

        <div className="revenue-report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 18, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueReportGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={ADMIN_GOLD} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={ADMIN_GOLD} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf0f4"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => formatCompactMoney(value)}
              />

              <Tooltip content={<RevenueTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke={ADMIN_GOLD}
                strokeWidth={3}
                fill="url(#revenueReportGradient)"
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: ADMIN_GOLD,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: ADMIN_GOLD,
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="revenue-report-two-col">
        <div className="revenue-report-card">
          <div className="revenue-report-card-header">
            <div>
              <h3>Doanh thu theo danh mục dịch vụ</h3>
              <p>Cơ cấu doanh thu theo nhóm dịch vụ trong kỳ.</p>
            </div>
          </div>

          <div className="revenue-report-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryRevenue}
                margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f4"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => formatCompactMoney(value)}
                />

                <Tooltip content={<RevenueTooltip />} />

                <Bar
                  dataKey="revenue"
                  fill={ADMIN_GOLD}
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="revenue-report-card">
          <div className="revenue-report-card-header">
            <div>
              <h3>Tóm tắt doanh thu</h3>
              <p>Các chỉ số quan trọng trong kỳ.</p>
            </div>
          </div>

          <div className="revenue-report-insight-list">
            <div className="revenue-report-insight-item">
              <CircleDollarSign size={20} />
              <div>
                <span>Doanh thu dịch vụ</span>
                <strong>{formatMoney(summary.totalServiceRevenue)}</strong>
              </div>
            </div>

            <div className="revenue-report-insight-item">
              <ReceiptText size={20} />
              <div>
                <span>Tổng giảm giá</span>
                <strong>{formatMoney(summary.totalDiscount)}</strong>
              </div>
            </div>

            <div className="revenue-report-insight-item">
              <UsersRound size={20} />
              <div>
                <span>Số khách sử dụng dịch vụ</span>
                <strong>{summary.totalCustomers}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="revenue-report-table-card">
        <div className="revenue-report-table-header">
          <div>
            <h3>Bảng báo cáo doanh thu theo ngày</h3>
            <p>
              Hiển thị <strong>{filteredRows.length}</strong> dòng dữ liệu
            </p>
          </div>
        </div>

        <div className="revenue-report-table-wrapper">
          <table className="revenue-report-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số hoá đơn</th>
                <th>Số khách</th>
                <th>Doanh thu dịch vụ</th>
                <th>Giảm giá</th>
                <th>Doanh thu thuần</th>
                <th>Tăng/giảm</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.invoices}</td>
                    <td>{row.customers}</td>
                    <td>{formatMoney(row.serviceRevenue)}</td>
                    <td>{formatMoney(row.discount)}</td>
                    <td className="revenue-report-money">
                      {formatMoney(row.netRevenue)}
                    </td>
                    <td>
                      <span
                        className={
                          row.change.includes("-")
                            ? "revenue-report-change down"
                            : "revenue-report-change up"
                        }
                      >
                        {row.change}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="revenue-report-view-btn"
                        onClick={() => setDetailRow(row)}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="revenue-report-empty">
                      Chưa có dữ liệu doanh thu phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="5">Tổng cộng</td>
                <td>{formatMoney(summary.totalRevenue)}</td>
                <td colSpan="2">{summary.totalInvoices} hoá đơn</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {detailRow && (
        <div
          className="revenue-report-modal-overlay"
          onClick={() => setDetailRow(null)}
        >
          <div
            className="revenue-report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="revenue-report-modal-header">
              <div>
                <h3>Chi tiết doanh thu ngày {detailRow.date}</h3>
                <p>
                  Báo cáo tổng hợp theo ngày, không hiển thị từng hoá đơn chi
                  tiết.
                </p>
              </div>

              <button type="button" onClick={() => setDetailRow(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="revenue-report-modal-summary">
              <div>
                <span>Doanh thu thuần</span>
                <strong>{formatMoney(detailRow.netRevenue)}</strong>
              </div>

              <div>
                <span>Số hoá đơn</span>
                <strong>{detailRow.invoices}</strong>
              </div>

              <div>
                <span>Số khách</span>
                <strong>{detailRow.customers}</strong>
              </div>
            </div>

            <div className="revenue-report-modal-summary">
              <div>
                <span>Doanh thu dịch vụ</span>
                <strong>{formatMoney(detailRow.serviceRevenue)}</strong>
              </div>

              <div>
                <span>Giảm giá</span>
                <strong>{formatMoney(detailRow.discount)}</strong>
              </div>

              <div>
                <span>Tăng/giảm</span>
                <strong>{detailRow.change}</strong>
              </div>
            </div>

            <div className="revenue-report-detail-section">
              <div className="revenue-report-detail-title">
                <h4>Cơ cấu doanh thu theo danh mục</h4>
                <span>{detailRow.categoryBreakdown.length} danh mục</span>
              </div>

              <div className="revenue-report-category-list">
                {detailRow.categoryBreakdown.map((item) => {
                  const percent = detailRow.netRevenue
                    ? Math.round((item.revenue / detailRow.netRevenue) * 100)
                    : 0

                  return (
                    <div className="revenue-report-category-item" key={item.name}>
                      <div className="revenue-report-category-head">
                        <div>
                          <Sparkles size={16} />
                          <span>{item.name}</span>
                        </div>

                        <strong>{formatMoney(item.revenue)}</strong>
                      </div>

                      <div className="revenue-report-progress">
                        <div style={{ width: `${percent}%` }}></div>
                      </div>

                      <p>{percent}% doanh thu trong ngày</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueReport
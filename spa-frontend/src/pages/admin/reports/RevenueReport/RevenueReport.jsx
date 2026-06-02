import React, { useCallback, useEffect, useState } from "react"
import {
  CalendarDays,
  Download,
  CircleDollarSign,
  ReceiptText,
  UsersRound,
  TrendingUp,
  TrendingDown,
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

import { getAdminRevenueReportApi } from "../../../../services/adminRevenueReportApi"
import "./RevenueReport.css"

const ADMIN_GOLD = "#d7a93f"

const compareOptions = [
  { label: "Không so sánh", value: "none" },
  { label: "So với kỳ trước", value: "previous_period" },
  { label: "So với tháng trước", value: "previous_month" },
  { label: "So với năm trước", value: "previous_year" },
]

const defaultReportData = {
  fromDate: "",
  toDate: "",
  compare: "previous_period",
  summary: {
    totalRevenue: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    totalDiscount: 0,
    totalServiceRevenue: 0,
    averageInvoice: 0,
    growth: {
      totalRevenue: "0%",
      totalInvoices: "0%",
      totalCustomers: "0%",
      averageInvoice: "0%",
    },
  },
  chartData: [],
  categoryRevenue: [],
  rows: [],
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const formatCompactMoney = (value = 0) => {
  const numberValue = Number(value || 0)

  if (numberValue >= 1000000000) {
    return `${(numberValue / 1000000000).toFixed(1)}B`
  }

  if (numberValue >= 1000000) {
    return `${Math.round(numberValue / 1000000)}M`
  }

  if (numberValue >= 1000) {
    return `${Math.round(numberValue / 1000)}K`
  }

  return `${Math.round(numberValue)}`
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

const getCompareLabel = (value) => {
  return compareOptions.find((item) => item.value === value)?.label || ""
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

const getGrowthClassName = (value) => {
  const text = String(value || "")

  if (text.includes("-")) return "down"
  if (text.includes("Không phát sinh")) return "neutral"

  return "up"
}

const getGrowthIcon = (value) => {
  const text = String(value || "")

  if (text.includes("-")) return TrendingDown

  return TrendingUp
}

const getGrowthText = (value, compare) => {
  if (compare === "none") return ""

  return `${value} ${getCompareLabel(compare).toLowerCase()}`
}

function RevenueReport() {
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth())
  const [toDate, setToDate] = useState(getTodayInputValue())
  const [compare, setCompare] = useState("previous_period")
  const [detailRow, setDetailRow] = useState(null)

  const [reportData, setReportData] = useState(defaultReportData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchRevenueReport = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminRevenueReportApi({
        fromDate,
        toDate,
        compare,
      })

      setReportData({
        ...defaultReportData,
        ...data,
        summary: {
          ...defaultReportData.summary,
          ...(data?.summary || {}),
          growth: {
            ...defaultReportData.summary.growth,
            ...(data?.summary?.growth || {}),
          },
        },
        chartData: data?.chartData || [],
        categoryRevenue: data?.categoryRevenue || [],
        rows: data?.rows || [],
      })
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải báo cáo doanh thu.")
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, compare])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRevenueReport()
  }, [fetchRevenueReport])

  const filteredRows = reportData.rows || []
  const summary = reportData.summary || defaultReportData.summary
  const chartData = reportData.chartData || []
  const categoryRevenue = reportData.categoryRevenue || []

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo doanh thu"],
      ["Từ ngày", reportData.fromDate || fromDate],
      ["Đến ngày", reportData.toDate || toDate],
      ["So sánh", getCompareLabel(compare)],
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
    link.download = `bao-cao-doanh-thu-${fromDate}-${toDate}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="revenue-report-page">
      <section className="revenue-report-filter-card">
        <div className="revenue-report-filter-left">
          <label className="revenue-report-date-picker">
            <CalendarDays size={17} />
            <span>{formatDateVN(fromDate)}</span>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <span className="revenue-report-date-separator">-</span>

          <label className="revenue-report-date-picker">
            <span>{formatDateVN(toDate)}</span>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="revenue-report-filter-item">
            <Filter size={17} />
            <select
              value={compare}
              onChange={(event) => setCompare(event.target.value)}
            >
              {compareOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="revenue-report-export-btn"
          onClick={handleExportReport}
          disabled={isLoading}
        >
          <Download size={17} />
          Xuất báo cáo
        </button>
      </section>

      {isLoading && (
        <div className="revenue-report-state-card">
          Đang tải báo cáo doanh thu...
        </div>
      )}

      {errorMessage && (
        <div className="revenue-report-state-card">
          <p>{errorMessage}</p>

          <button
            type="button"
            className="revenue-report-export-btn"
            onClick={fetchRevenueReport}
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="revenue-report-summary-grid">
            <div className="revenue-report-summary-card">
              <p>Tổng doanh thu</p>
              <h2>{formatMoney(summary.totalRevenue)}</h2>
              {compare !== "none" ? (
                <span className={getGrowthClassName(summary.growth.totalRevenue)}>
                  {React.createElement(getGrowthIcon(summary.growth.totalRevenue), {
                    size: 15,
                  })}
                  {getGrowthText(summary.growth.totalRevenue, compare)}
                </span>
              ) : (
                <span>Doanh thu trong kỳ đã chọn</span>
              )}
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
                <p>
                  Doanh thu được tổng hợp theo ngày từ các hoá đơn đã thanh toán.
                </p>
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
                      <stop
                        offset="5%"
                        stopColor={ADMIN_GOLD}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor={ADMIN_GOLD}
                        stopOpacity={0.02}
                      />
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
                      <tr key={row.isoDate || row.id}>
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
                              String(row.change).includes("-")
                                ? "revenue-report-change down"
                                : String(row.change).includes("Không phát sinh")
                                  ? "revenue-report-change neutral"
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
        </>
      )}

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
                <span>{detailRow.categoryBreakdown?.length || 0} danh mục</span>
              </div>

              <div className="revenue-report-category-list">
                {detailRow.categoryBreakdown?.length > 0 ? (
                  detailRow.categoryBreakdown.map((item) => {
                    const percent = detailRow.netRevenue
                      ? Math.round((item.revenue / detailRow.netRevenue) * 100)
                      : 0

                    return (
                      <div
                        className="revenue-report-category-item"
                        key={item.name}
                      >
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
                  })
                ) : (
                  <div className="revenue-report-empty">
                    Chưa có dữ liệu danh mục trong ngày này
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueReport
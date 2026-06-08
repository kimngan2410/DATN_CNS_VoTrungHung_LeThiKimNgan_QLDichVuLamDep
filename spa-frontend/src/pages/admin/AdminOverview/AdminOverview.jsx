import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Download,
  CreditCard,
  CalendarDays,
  CalendarCheck,
  UsersRound,
  Sparkles,
  ReceiptText,
  TrendingUp,
  Activity,
  Clock3,
  WalletCards,
  ArrowUpRight,
  PackageOpen,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { getAdminOverviewApi } from "../../../services/adminOverviewApi"
import { exportStyledExcel, formatExcelMoney } from "../../../utils/exportExcel"
import "./AdminOverview.css"

const ADMIN_GOLD = "#d7a93f"

const OVERVIEW_PERIOD_OPTIONS = [
  {
    value: "date",
    label: "Ngày",
    inputLabel: "Chọn ngày",
  },
  {
    value: "week",
    label: "Tuần",
    inputLabel: "Chọn tuần",
  },
  {
    value: "month",
    label: "Tháng",
    inputLabel: "Chọn tháng",
  },
  {
    value: "year",
    label: "Năm",
    inputLabel: "Chọn năm",
  },
]

const defaultOverviewData = {
  period: "date",
  label: "Hôm nay",
  compareText: "",
  startDate: "",
  endDate: "",
  summary: {
    revenue: 0,
    appointments: 0,
    registeredCustomers: 0,
    usedServices: 0,
    paidInvoices: 0,
    completionRate: 0,
  },
  growth: {
    revenue: "0%",
    appointments: "0%",
    registeredCustomers: "0%",
    usedServices: "0%",
    paidInvoices: "0%",
  },
  revenueTrend: [],
  customerGrowth: [],
  topServices: [],
  paymentMethods: [],
  recentInvoices: [],
  recentActivities: [],
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const formatCompactMoney = (value = 0) => {
  const numberValue = Number(value || 0)

  if (numberValue >= 1000000000) {
    return `${(numberValue / 1000000000).toFixed(2)}B đ`
  }

  if (numberValue >= 1000000) {
    return `${Math.round(numberValue / 1000000)}M đ`
  }

  return formatMoney(numberValue)
}

const padNumber = (value) => {
  return String(value).padStart(2, "0")
}

const getDateInputValue = (date = new Date()) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}`
}

const getMonthInputValue = (date = new Date()) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`
}

const getWeekInputValue = (date = new Date()) => {
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )

  const dayNumber = tempDate.getUTCDay() || 7
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNumber)

  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil(((tempDate - yearStart) / 86400000 + 1) / 7)

  return `${tempDate.getUTCFullYear()}-W${padNumber(weekNumber)}`
}

const getDefaultFilterValue = (period) => {
  const now = new Date()

  if (period === "week") return getWeekInputValue(now)
  if (period === "month") return getMonthInputValue(now)
  if (period === "year") return String(now.getFullYear())

  return getDateInputValue(now)
}

const getFilterInputType = (period) => {
  if (period === "week") return "week"
  if (period === "month") return "month"
  if (period === "year") return "number"

  return "date"
}

const formatDateVN = (dateText) => {
  if (!dateText) return ""

  if (dateText.includes("-W")) return dateText

  if (!dateText.includes("-")) return dateText

  const parts = dateText.split("-")

  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }

  if (parts.length === 2) {
    const [year, month] = parts
    return `${month}/${year}`
  }

  return dateText
}

const getErrorMessage = (error) => {
  if (typeof error?.message === "string") return error.message
  if (typeof error === "string") return error

  try {
    return JSON.stringify(error)
  } catch {
    return "Không thể tải dữ liệu tổng quan."
  }
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="admin-overview-tooltip">
      <h4>{label}</h4>
      <p>Doanh thu: {formatMoney(payload[0].value)}</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="admin-overview-tooltip">
      <h4>{label}</h4>
      <p>Số lượng: {payload[0].value}</p>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="admin-overview-empty-card">
      <div className="admin-overview-empty-icon">
        <PackageOpen size={45} />
      </div>

      <p>{message}</p>
    </div>
  )
}

function AdminOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("date")
  const [selectedFilterValue, setSelectedFilterValue] = useState(
    getDefaultFilterValue("date")
  )
  const filterInputRef = useRef(null)

  const [overviewData, setOverviewData] = useState(defaultOverviewData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const activePeriodOption =
    OVERVIEW_PERIOD_OPTIONS.find((option) => option.value === selectedPeriod) ||
    OVERVIEW_PERIOD_OPTIONS[0]

  const handleChangePeriod = (periodValue) => {
    setSelectedPeriod(periodValue)
    setSelectedFilterValue(getDefaultFilterValue(periodValue))
  }

  const fetchOverview = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminOverviewApi(selectedPeriod, selectedFilterValue)

      setOverviewData({
        ...defaultOverviewData,
        ...data,
        summary: {
          ...defaultOverviewData.summary,
          ...(data?.summary || {}),
        },
        growth: {
          ...defaultOverviewData.growth,
          ...(data?.growth || {}),
        },
        revenueTrend: data?.revenueTrend || [],
        customerGrowth: data?.customerGrowth || [],
        topServices: data?.topServices || [],
        paymentMethods: data?.paymentMethods || [],
        recentInvoices: data?.recentInvoices || [],
        recentActivities: data?.recentActivities || [],
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [selectedPeriod, selectedFilterValue])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview()
  }, [fetchOverview])

  const currentData = useMemo(() => overviewData || defaultOverviewData, [overviewData])

  const totalPaymentAmount = currentData.paymentMethods.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  )

  const summaryCards = [
    {
      title: "Tổng doanh thu",
      value: formatCompactMoney(currentData.summary.revenue),
      growth: currentData.growth.revenue,
      icon: CreditCard,
    },
    {
      title: "Tổng lịch hẹn",
      value: currentData.summary.appointments,
      growth: currentData.growth.appointments,
      icon: CalendarCheck,
    },
    {
      title: "Khách hàng đăng ký",
      value: currentData.summary.registeredCustomers,
      growth: currentData.growth.registeredCustomers,
      icon: UsersRound,
    },
    {
      title: "Dịch vụ đã dùng",
      value: currentData.summary.usedServices,
      growth: currentData.growth.usedServices,
      icon: Sparkles,
    },
    {
      title: "Hoá đơn đã thanh toán",
      value: currentData.summary.paidInvoices,
      growth: currentData.growth.paidInvoices,
      icon: ReceiptText,
    },
  ]

  const handleExportOverview = () => {
    const overviewRows = [
      {
        group: "Tổng quan",
        metric: "Thời gian",
        value: currentData.label || "",
        note:
          currentData.startDate && currentData.endDate
            ? currentData.startDate === currentData.endDate
              ? formatDateVN(currentData.startDate)
              : `${formatDateVN(currentData.startDate)} đến ${formatDateVN(
                  currentData.endDate
                )}`
            : formatDateVN(selectedFilterValue),
      },
      {
        group: "Tổng quan",
        metric: "Tổng doanh thu",
        value: formatExcelMoney(currentData.summary.revenue),
        note: currentData.growth.revenue
          ? `${currentData.growth.revenue} ${currentData.compareText || ""}`
          : "",
      },
      {
        group: "Tổng quan",
        metric: "Tổng lịch hẹn",
        value: currentData.summary.appointments,
        note: currentData.growth.appointments
          ? `${currentData.growth.appointments} ${currentData.compareText || ""}`
          : "",
      },
      {
        group: "Tổng quan",
        metric: "Khách hàng đăng ký",
        value: currentData.summary.registeredCustomers,
        note: currentData.growth.registeredCustomers
          ? `${currentData.growth.registeredCustomers} ${
              currentData.compareText || ""
            }`
          : "",
      },
      {
        group: "Tổng quan",
        metric: "Dịch vụ đã dùng",
        value: currentData.summary.usedServices,
        note: currentData.growth.usedServices
          ? `${currentData.growth.usedServices} ${currentData.compareText || ""}`
          : "",
      },
      {
        group: "Tổng quan",
        metric: "Hoá đơn đã thanh toán",
        value: currentData.summary.paidInvoices,
        note: currentData.growth.paidInvoices
          ? `${currentData.growth.paidInvoices} ${currentData.compareText || ""}`
          : "",
      },
      {
        group: "Tổng quan",
        metric: "Tỷ lệ hoàn thành lịch hẹn",
        value: `${currentData.summary.completionRate}%`,
        note: "",
      },
      ...currentData.topServices.map((item) => ({
        group: "Top dịch vụ",
        metric: item.name,
        value: item.value,
        note: formatExcelMoney(item.revenue),
      })),
      ...currentData.paymentMethods.map((item) => ({
        group: "Phương thức thanh toán",
        metric: item.name,
        value: `${item.value} giao dịch`,
        note: formatExcelMoney(item.amount),
      })),
      ...currentData.recentInvoices.map((item) => ({
        group: "Hoá đơn gần đây",
        metric: item.id,
        value: item.customer,
        note: `${item.method || ""} - ${formatExcelMoney(item.amount)}`,
      })),
      ...currentData.recentActivities.map((item) => ({
        group: "Hoạt động gần đây",
        metric: item.title,
        value: item.desc,
        note: item.time,
      })),
    ]

    exportStyledExcel({
      title: "BÁO CÁO TỔNG QUAN",
      subtitle: `${
        currentData.label || activePeriodOption.label
      } · Kỳ xem: ${activePeriodOption.label}`,
      fileName: `tong-quan-${selectedPeriod}-${selectedFilterValue}`,
      columns: [
        {
          label: "Nhóm dữ liệu",
          value: "group",
        },
        {
          label: "Chỉ số / Nội dung",
          value: "metric",
        },
        {
          label: "Giá trị",
          value: "value",
        },
        {
          label: "Ghi chú",
          value: "note",
        },
      ],
      rows: overviewRows,
      summaryRows: [
        {
          label: "Tổng doanh thu",
          value: formatExcelMoney(currentData.summary.revenue),
          type: "money",
        },
        {
          label: "Tổng lịch hẹn",
          value: currentData.summary.appointments,
        },
        {
          label: "Khách hàng đăng ký",
          value: currentData.summary.registeredCustomers,
        },
        {
          label: "Dịch vụ đã dùng",
          value: currentData.summary.usedServices,
        },
        {
          label: "Hoá đơn đã thanh toán",
          value: currentData.summary.paidInvoices,
        },
        {
          label: "Tỷ lệ hoàn thành lịch hẹn",
          value: `${currentData.summary.completionRate}%`,
        },
      ],
    })
  }

  const renderFilterCard = () => (
    <section className="admin-overview-toolbar admin-overview-filter-toolbar">
      <div className="admin-overview-filter-info">
        <strong>{currentData.label || activePeriodOption.label}</strong>

        {currentData.startDate && currentData.endDate ? (
          <p>
            {currentData.startDate === currentData.endDate
              ? formatDateVN(currentData.startDate)
              : `${formatDateVN(currentData.startDate)} đến ${formatDateVN(
                  currentData.endDate
                )}`}
          </p>
        ) : (
          <p>{formatDateVN(selectedFilterValue)}</p>
        )}
      </div>

      <div className="admin-overview-filter-actions">
        <div className="admin-overview-period-tabs">
          {OVERVIEW_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                selectedPeriod === option.value
                  ? "admin-overview-period-tab active"
                  : "admin-overview-period-tab"
              }
              onClick={() => handleChangePeriod(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="admin-overview-date-picker"
          onClick={handleOpenFilterPicker}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              handleOpenFilterPicker()
            }
          }}
        >
          <span>{activePeriodOption.inputLabel}</span>

          <strong className="admin-overview-date-display">
            {formatDateVN(selectedFilterValue)}
          </strong>

          <CalendarDays className="admin-overview-date-icon" size={18} />

          <input
            ref={filterInputRef}
            type={getFilterInputType(selectedPeriod)}
            value={selectedFilterValue}
            min={selectedPeriod === "year" ? "2020" : undefined}
            max={selectedPeriod === "year" ? "2100" : undefined}
            onChange={(event) => setSelectedFilterValue(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          className="admin-overview-export-btn"
          onClick={handleExportOverview}
          disabled={isLoading}
        >
          <Download size={17} />
          Xuất báo cáo
        </button>
      </div>
    </section>
  )

  const handleOpenFilterPicker = () => {
    const input = filterInputRef.current

    if (!input || isLoading) return

    if (typeof input.showPicker === "function") {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
  }

  if (isLoading) {
    return (
      <div className="admin-overview-page">
        {renderFilterCard()}

        <div className="admin-overview-state-card">
          Đang tải dữ liệu tổng quan...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="admin-overview-page">
        {renderFilterCard()}

        <div className="admin-overview-state-card">
          <p>{errorMessage}</p>

          <button
            type="button"
            className="admin-overview-export-btn"
            onClick={fetchOverview}
          >
            Tải lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-overview-page">
      {renderFilterCard()}

      <section className="admin-overview-hero">
        <div className="admin-overview-hero-content">
          <span>Dashboard tổng quan</span>
          <h2>{formatMoney(currentData.summary.revenue)}</h2>

          <div className="admin-overview-hero-growth">
            <TrendingUp size={16} />
            {currentData.growth.revenue} {currentData.compareText}
          </div>
        </div>

        <div className="admin-overview-hero-cards">
          <div>
            <p>Hoá đơn</p>
            <strong>{currentData.summary.paidInvoices}</strong>
          </div>

          <div>
            <p>Khách hàng</p>
            <strong>{currentData.summary.registeredCustomers}</strong>
          </div>

          <div>
            <p>Hoàn thành lịch hẹn</p>
            <strong>{currentData.summary.completionRate}%</strong>
          </div>
        </div>
      </section>

      <section className="admin-overview-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div className="admin-overview-summary-card" key={card.title}>
              <div className="admin-overview-summary-top">
                <div className="admin-overview-summary-icon">
                  <Icon size={22} />
                </div>

                <span>
                  {card.growth}
                  <ArrowUpRight size={14} />
                </span>
              </div>

              <p>{card.title}</p>
              <h3>{card.value}</h3>
            </div>
          )
        })}
      </section>

      <section className="admin-overview-grid">
        <div className="admin-overview-card admin-overview-revenue-card">
          <div className="admin-overview-card-header">
            <div>
              <h3>Doanh thu theo thời gian</h3>
              <p>Doanh thu được tổng hợp từ các hoá đơn đã thanh toán</p>
            </div>

            <strong>{formatCompactMoney(currentData.summary.revenue)}</strong>
          </div>

          <div className="admin-overview-revenue-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentData.revenueTrend}
                margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="overviewRevenueGradient"
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
                  dataKey="label"
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
                  fill="url(#overviewRevenueGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: ADMIN_GOLD,
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-overview-card admin-overview-service-card">
          <div className="admin-overview-card-header compact">
            <div>
              <h3>Top dịch vụ</h3>
              <p>Dịch vụ được sử dụng nhiều nhất</p>
            </div>
          </div>

          {currentData.topServices.length > 0 ? (
            <>
              <div className="admin-overview-donut">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={currentData.topServices}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={78}
                      paddingAngle={5}
                    >
                      {currentData.topServices.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-overview-service-list">
                {currentData.topServices.map((item) => (
                  <div className="admin-overview-service-row" key={item.name}>
                    <div>
                      <span style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </div>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="Chưa có dữ liệu dịch vụ." />
          )}
        </div>

        <div className="admin-overview-card admin-overview-invoice-card">
          <div className="admin-overview-card-header compact">
            <div>
              <h3>Báo cáo hoá đơn nhanh</h3>
              <p>Tóm tắt các giao dịch đã thanh toán</p>
            </div>

            <ReceiptText size={20} />
          </div>

          <div className="admin-overview-invoice-summary">
            <div>
              <span>Tổng hoá đơn</span>
              <strong>{currentData.summary.paidInvoices}</strong>
            </div>

            <div>
              <span>Tổng tiền</span>
              <strong>{formatCompactMoney(currentData.summary.revenue)}</strong>
            </div>

            <div>
              <span>TB/hoá đơn</span>
              <strong>
                {currentData.summary.paidInvoices > 0
                  ? formatCompactMoney(
                      Math.round(
                        currentData.summary.revenue /
                          currentData.summary.paidInvoices
                      )
                    )
                  : "0 đ"}
              </strong>
            </div>
          </div>

          <div className="admin-overview-recent-invoices">
            {currentData.recentInvoices.length > 0 ? (
              currentData.recentInvoices.map((invoice) => (
                <div className="admin-overview-invoice-row" key={invoice.id}>
                  <div>
                    <h4>{invoice.id}</h4>
                    <p>
                      {invoice.customer} • {invoice.method}
                    </p>
                  </div>

                  <strong>{formatMoney(invoice.amount)}</strong>
                </div>
              ))
            ) : (
              <EmptyState message="Chưa có hoá đơn đã thanh toán." />
            )}
          </div>
        </div>

        <div className="admin-overview-card admin-overview-customer-card">
          <div className="admin-overview-card-header compact">
            <div>
              <h3>Tăng trưởng khách hàng</h3>
              <p>Khách hàng đăng ký theo thời gian</p>
            </div>

            <UsersRound size={20} />
          </div>

          <div className="admin-overview-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData.customerGrowth}
                margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#edf0f4"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />

                <Tooltip content={<BarTooltip />} />

                <Bar
                  dataKey="value"
                  fill={ADMIN_GOLD}
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-overview-card admin-overview-payment-card">
          <div className="admin-overview-card-header compact">
            <div>
              <h3>Phương thức thanh toán</h3>
              <p>Tỷ trọng giao dịch theo phương thức</p>
            </div>

            <WalletCards size={20} />
          </div>

          <div className="admin-overview-payment-list">
            {currentData.paymentMethods.length > 0 ? (
              currentData.paymentMethods.map((method) => {
                const percent =
                  totalPaymentAmount > 0
                    ? Math.round(
                        (Number(method.amount || 0) / totalPaymentAmount) * 100
                      )
                    : 0

                return (
                  <div className="admin-overview-payment-row" key={method.name}>
                    <div className="admin-overview-payment-top">
                      <span>{method.name}</span>
                      <strong>
                        {method.value} giao dịch · {percent}%
                      </strong>
                    </div>

                    <div className="admin-overview-progress">
                      <div style={{ width: `${percent}%` }}></div>
                    </div>

                    <p>{formatMoney(method.amount)}</p>
                  </div>
                )
              })
            ) : (
              <EmptyState message="Chưa có dữ liệu thanh toán." />
            )}
          </div>
        </div>

        <div className="admin-overview-card admin-overview-activity-card">
          <div className="admin-overview-card-header compact">
            <div>
              <h3>Hoạt động quản trị gần đây</h3>
              <p>Các thao tác mới nhất trong hệ thống</p>
            </div>

            <Activity size={20} />
          </div>

          <div className="admin-overview-activity-list">
            {currentData.recentActivities.length > 0 ? (
              currentData.recentActivities.map((activity, index) => (
                <div className="admin-overview-activity-item" key={index}>
                  <div className="admin-overview-activity-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <h4>{activity.title}</h4>
                    <p>{activity.desc}</p>
                  </div>

                  <span>{activity.time}</span>
                </div>
              ))
            ) : (
              <EmptyState message="Chưa có hoạt động gần đây." />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminOverview
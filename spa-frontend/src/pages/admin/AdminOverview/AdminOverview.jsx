import React, { useMemo, useState } from "react"
import {
  CalendarDays,
  Download,
  CreditCard,
  CalendarCheck,
  UsersRound,
  Sparkles,
  ReceiptText,
  TrendingUp,
  Activity,
  Clock3,
  WalletCards,
  ArrowUpRight,
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
import "./AdminOverview.css"

const ADMIN_GOLD = "#d7a93f"

const periodOptions = [
  { value: "today", label: "Hôm nay" },
  { value: "month", label: "Tháng này" },
  { value: "quarter", label: "Quý này" },
  { value: "year", label: "Năm nay" },
]

const overviewData = {
  today: {
    label: "Hôm nay",
    compareText: "so với hôm qua",
    summary: {
      revenue: 28500000,
      appointments: 24,
      registeredCustomers: 7,
      usedServices: 38,
      paidInvoices: 18,
      completionRate: 84,
    },
    growth: {
      revenue: "+8.5%",
      appointments: "+5.2%",
      registeredCustomers: "+11.4%",
      usedServices: "+6.8%",
      paidInvoices: "+7.1%",
    },
    revenueTrend: [
      { label: "8h", revenue: 2500000 },
      { label: "10h", revenue: 4200000 },
      { label: "12h", revenue: 3800000 },
      { label: "14h", revenue: 5600000 },
      { label: "16h", revenue: 7400000 },
      { label: "18h", revenue: 5000000 },
    ],
    customerGrowth: [
      { label: "T2", value: 4 },
      { label: "T3", value: 5 },
      { label: "T4", value: 6 },
      { label: "T5", value: 5 },
      { label: "T6", value: 7 },
      { label: "T7", value: 7 },
    ],
    topServices: [
      { name: "Chăm sóc da mặt", value: 9, revenue: 8100000, color: "#d7a93f" },
      { name: "Massage body", value: 7, revenue: 5600000, color: "#4d4a4b" },
      { name: "Gội đầu dưỡng sinh", value: 6, revenue: 2400000, color: "#ead6a0" },
      { name: "Điều trị mụn", value: 5, revenue: 4250000, color: "#f4ead0" },
    ],
    paymentMethods: [
      { name: "Chuyển khoản", value: 10, amount: 16500000 },
      { name: "Tiền mặt", value: 6, amount: 8200000 },
      { name: "Thẻ ngân hàng", value: 2, amount: 3800000 },
    ],
    recentInvoices: [
      {
        id: "HD001",
        customer: "Nguyễn Thị Hoa",
        method: "Chuyển khoản",
        amount: 750000,
        paidAt: "09:30",
        status: "Đã thanh toán",
      },
      {
        id: "HD002",
        customer: "Trần Văn Nam",
        method: "Tiền mặt",
        amount: 500000,
        paidAt: "10:15",
        status: "Đã thanh toán",
      },
      {
        id: "HD003",
        customer: "Phạm Thu Thủy",
        method: "Thẻ ngân hàng",
        amount: 1200000,
        paidAt: "14:20",
        status: "Đã thanh toán",
      },
    ],
  },

  month: {
    label: "Tháng này",
    compareText: "so với tháng trước",
    summary: {
      revenue: 795000000,
      appointments: 186,
      registeredCustomers: 48,
      usedServices: 312,
      paidInvoices: 154,
      completionRate: 86,
    },
    growth: {
      revenue: "+12.5%",
      appointments: "+9.4%",
      registeredCustomers: "+15.2%",
      usedServices: "+7.6%",
      paidInvoices: "+10.3%",
    },
    revenueTrend: [
      { label: "T1", revenue: 40000000 },
      { label: "T2", revenue: 30000000 },
      { label: "T3", revenue: 50000000 },
      { label: "T4", revenue: 45000000 },
      { label: "T5", revenue: 60000000 },
      { label: "T6", revenue: 55000000 },
      { label: "T7", revenue: 70000000 },
      { label: "T8", revenue: 85000000 },
      { label: "T9", revenue: 76000000 },
      { label: "T10", revenue: 90000000 },
      { label: "T11", revenue: 86000000 },
      { label: "T12", revenue: 110000000 },
    ],
    customerGrowth: [
      { label: "T7", value: 28 },
      { label: "T8", value: 35 },
      { label: "T9", value: 32 },
      { label: "T10", value: 41 },
      { label: "T11", value: 45 },
      { label: "T12", value: 48 },
    ],
    topServices: [
      { name: "Chăm sóc da mặt", value: 78, revenue: 156000000, color: "#d7a93f" },
      { name: "Massage body", value: 64, revenue: 96000000, color: "#4d4a4b" },
      { name: "Gội đầu dưỡng sinh", value: 58, revenue: 58000000, color: "#ead6a0" },
      { name: "Tắm trắng", value: 32, revenue: 192000000, color: "#f4ead0" },
    ],
    paymentMethods: [
      { name: "Chuyển khoản", value: 82, amount: 438000000 },
      { name: "Tiền mặt", value: 51, amount: 239000000 },
      { name: "Thẻ ngân hàng", value: 21, amount: 118000000 },
    ],
    recentInvoices: [
      {
        id: "HD128",
        customer: "Nguyễn Thị Hoa",
        method: "Chuyển khoản",
        amount: 750000,
        paidAt: "04/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD129",
        customer: "Trần Văn Nam",
        method: "Tiền mặt",
        amount: 500000,
        paidAt: "05/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD130",
        customer: "Lê Mai Anh",
        method: "Thẻ ngân hàng",
        amount: 850000,
        paidAt: "06/05/2026",
        status: "Đã thanh toán",
      },
    ],
  },

  quarter: {
    label: "Quý này",
    compareText: "so với quý trước",
    summary: {
      revenue: 1986000000,
      appointments: 524,
      registeredCustomers: 135,
      usedServices: 862,
      paidInvoices: 438,
      completionRate: 88,
    },
    growth: {
      revenue: "+18.5%",
      appointments: "+11.2%",
      registeredCustomers: "+17.4%",
      usedServices: "+10.8%",
      paidInvoices: "+13.6%",
    },
    revenueTrend: [
      { label: "Tháng 1", revenue: 530000000 },
      { label: "Tháng 2", revenue: 661000000 },
      { label: "Tháng 3", revenue: 795000000 },
    ],
    customerGrowth: [
      { label: "T1", value: 38 },
      { label: "T2", value: 49 },
      { label: "T3", value: 48 },
    ],
    topServices: [
      { name: "Chăm sóc da mặt", value: 190, revenue: 380000000, color: "#d7a93f" },
      { name: "Massage body", value: 156, revenue: 234000000, color: "#4d4a4b" },
      { name: "Gội đầu dưỡng sinh", value: 145, revenue: 145000000, color: "#ead6a0" },
      { name: "Tắm trắng", value: 88, revenue: 528000000, color: "#f4ead0" },
    ],
    paymentMethods: [
      { name: "Chuyển khoản", value: 236, amount: 1080000000 },
      { name: "Tiền mặt", value: 142, amount: 586000000 },
      { name: "Thẻ ngân hàng", value: 60, amount: 320000000 },
    ],
    recentInvoices: [
      {
        id: "HD301",
        customer: "Phạm Thu Thủy",
        method: "Chuyển khoản",
        amount: 1200000,
        paidAt: "03/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD302",
        customer: "Hoàng Minh Tuấn",
        method: "Tiền mặt",
        amount: 650000,
        paidAt: "05/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD303",
        customer: "Đỗ Khánh Linh",
        method: "Thẻ ngân hàng",
        amount: 950000,
        paidAt: "07/05/2026",
        status: "Đã thanh toán",
      },
    ],
  },

  year: {
    label: "Năm nay",
    compareText: "so với năm trước",
    summary: {
      revenue: 6842000000,
      appointments: 1860,
      registeredCustomers: 524,
      usedServices: 3048,
      paidInvoices: 1540,
      completionRate: 87,
    },
    growth: {
      revenue: "+23.1%",
      appointments: "+16.7%",
      registeredCustomers: "+19.8%",
      usedServices: "+14.3%",
      paidInvoices: "+18.2%",
    },
    revenueTrend: [
      { label: "T1", revenue: 420000000 },
      { label: "T2", revenue: 390000000 },
      { label: "T3", revenue: 510000000 },
      { label: "T4", revenue: 495000000 },
      { label: "T5", revenue: 580000000 },
      { label: "T6", revenue: 560000000 },
      { label: "T7", revenue: 615000000 },
      { label: "T8", revenue: 680000000 },
      { label: "T9", revenue: 640000000 },
      { label: "T10", revenue: 710000000 },
      { label: "T11", revenue: 720000000 },
      { label: "T12", revenue: 795000000 },
    ],
    customerGrowth: [
      { label: "T1", value: 35 },
      { label: "T2", value: 39 },
      { label: "T3", value: 42 },
      { label: "T4", value: 40 },
      { label: "T5", value: 44 },
      { label: "T6", value: 47 },
      { label: "T7", value: 43 },
      { label: "T8", value: 45 },
      { label: "T9", value: 46 },
      { label: "T10", value: 50 },
      { label: "T11", value: 55 },
      { label: "T12", value: 58 },
    ],
    topServices: [
      { name: "Chăm sóc da mặt", value: 612, revenue: 1224000000, color: "#d7a93f" },
      { name: "Massage body", value: 486, revenue: 729000000, color: "#4d4a4b" },
      { name: "Gội đầu dưỡng sinh", value: 452, revenue: 452000000, color: "#ead6a0" },
      { name: "Tắm trắng", value: 302, revenue: 1812000000, color: "#f4ead0" },
    ],
    paymentMethods: [
      { name: "Chuyển khoản", value: 812, amount: 3620000000 },
      { name: "Tiền mặt", value: 524, amount: 2050000000 },
      { name: "Thẻ ngân hàng", value: 204, amount: 1172000000 },
    ],
    recentInvoices: [
      {
        id: "HD901",
        customer: "Nguyễn Thị Hoa",
        method: "Chuyển khoản",
        amount: 750000,
        paidAt: "04/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD902",
        customer: "Phạm Thu Thủy",
        method: "Tiền mặt",
        amount: 1200000,
        paidAt: "08/05/2026",
        status: "Đã thanh toán",
      },
      {
        id: "HD903",
        customer: "Lê Mai Anh",
        method: "Thẻ ngân hàng",
        amount: 850000,
        paidAt: "10/05/2026",
        status: "Đã thanh toán",
      },
    ],
  },
}

const recentActivities = [
  {
    title: "Thanh toán hoá đơn",
    desc: "Hoá đơn HD128 đã được thanh toán thành công",
    time: "30 phút trước",
  },
  {
    title: "Thêm lịch hẹn mới",
    desc: "Khách hàng vừa đặt lịch chăm sóc da mặt",
    time: "1 giờ trước",
  },
  {
    title: "Cập nhật dịch vụ",
    desc: "Dịch vụ Massage body đã cập nhật giá và thời lượng",
    time: "2 giờ trước",
  },
  {
    title: "Tạo tài khoản nhân viên",
    desc: "Tài khoản lễ tân mới đã được tạo trong hệ thống",
    time: "3 giờ trước",
  },
]

const formatMoney = (value) => {
  return `${Number(value).toLocaleString("vi-VN")} đ`
}

const formatCompactMoney = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B đ`
  }

  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}M đ`
  }

  return formatMoney(value)
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

function AdminOverview() {
  const [period, setPeriod] = useState("month")

  const currentData = useMemo(() => overviewData[period], [period])

  const totalPaymentAmount = currentData.paymentMethods.reduce(
    (sum, item) => sum + item.amount,
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
    const lines = [
      ["Báo cáo tổng quan"],
      ["Thời gian", currentData.label],
      ["Tổng doanh thu", currentData.summary.revenue],
      ["Tổng lịch hẹn", currentData.summary.appointments],
      ["Khách hàng đăng ký", currentData.summary.registeredCustomers],
      ["Dịch vụ đã dùng", currentData.summary.usedServices],
      ["Hoá đơn đã thanh toán", currentData.summary.paidInvoices],
      ["Tỷ lệ hoàn thành lịch hẹn", `${currentData.summary.completionRate}%`],
      [],
      ["Top dịch vụ", "Số lượt", "Doanh thu"],
      ...currentData.topServices.map((item) => [
        item.name,
        item.value,
        item.revenue,
      ]),
      [],
      ["Phương thức thanh toán", "Số giao dịch", "Tổng tiền"],
      ...currentData.paymentMethods.map((item) => [
        item.name,
        item.value,
        item.amount,
      ]),
    ]

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `tong-quan-${period}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-overview-page">
      <section className="admin-overview-toolbar">
        <div className="admin-overview-period">
          <CalendarDays size={18} />
          <span>Thời gian:</span>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {periodOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="admin-overview-export-btn"
          onClick={handleExportOverview}
        >
          <Download size={17} />
          Xuất báo cáo
        </button>
      </section>

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
                {formatCompactMoney(
                  Math.round(
                    currentData.summary.revenue / currentData.summary.paidInvoices
                  )
                )}
              </strong>
            </div>
          </div>

          <div className="admin-overview-recent-invoices">
            {currentData.recentInvoices.map((invoice) => (
              <div className="admin-overview-invoice-row" key={invoice.id}>
                <div>
                  <h4>{invoice.id}</h4>
                  <p>
                    {invoice.customer} • {invoice.method}
                  </p>
                </div>

                <strong>{formatMoney(invoice.amount)}</strong>
              </div>
            ))}
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
            {currentData.paymentMethods.map((method) => {
              const percent = Math.round((method.amount / totalPaymentAmount) * 100)

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
            })}
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
            {recentActivities.map((activity, index) => (
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
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminOverview
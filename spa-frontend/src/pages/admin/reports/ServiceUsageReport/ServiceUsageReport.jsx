import React, { useCallback, useEffect, useState } from "react"
import {
  CalendarDays,
  Download,
  Filter,
  Search,
  ClipboardList,
  RotateCcw,
  CircleCheckBig,
  CircleMinus,
  TrendingUp,
  Star,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { exportStyledExcel, formatExcelMoney } from "../../../../utils/exportExcel"
import { getAdminServiceUsageReportApi } from "../../../../services/adminServiceUsageReportApi"
import "./ServiceUsageReport.css"

const ADMIN_GOLD = "#d7a93f"

const usageStatusOptions = ["Tất cả", "Đã sử dụng", "Chưa sử dụng"]

const serviceStatusOptions = ["Tất cả", "Đang cung cấp", "Ngừng cung cấp"]

const sortOptions = [
  "Lượt sử dụng cao nhất",
  "Doanh thu cao nhất",
  "Số khách cao nhất",
  "Thời lượng cao nhất",
  "Số sao cao nhất",
  "Lượt đánh giá cao nhất",
  "Tên dịch vụ A-Z",
]

const defaultReportData = {
  fromDate: "",
  toDate: "",
  keyword: "",
  category: "Tất cả",
  usageStatus: "Tất cả",
  serviceStatus: "Tất cả",
  sortBy: "Lượt sử dụng cao nhất",
  categoryOptions: ["Tất cả"],
  summary: {
    totalServices: 0,
    usedServices: 0,
    unusedServices: 0,
    totalUsage: 0,
    totalCustomers: 0,
    totalDuration: 0,
    totalRevenue: 0,
    totalReviews: 0,
    averageRating: 0,
  },
  chartData: [],
  services: [],
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const formatDuration = (minutes = 0) => {
  const totalMinutes = Number(minutes || 0)
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60

  if (hour === 0) return `${minute} phút`
  if (minute === 0) return `${hour} giờ`

  return `${hour} giờ ${minute} phút`
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

function ServiceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="service-usage-tooltip">
      <h4>{label}</h4>
      <p>{payload[0].value} lượt sử dụng</p>
    </div>
  )
}

function ServiceUsageReport() {
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth())
  const [toDate, setToDate] = useState(getTodayInputValue())
  const [keyword, setKeyword] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [usageStatusFilter, setUsageStatusFilter] = useState("Tất cả")
  const [serviceStatusFilter, setServiceStatusFilter] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("Lượt sử dụng cao nhất")

  const [reportData, setReportData] = useState(defaultReportData)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchServiceUsageReport = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminServiceUsageReportApi({
        fromDate,
        toDate,
        keyword,
        category: categoryFilter,
        usageStatus: usageStatusFilter,
        serviceStatus: serviceStatusFilter,
        sortBy,
      })

      setReportData({
        ...defaultReportData,
        ...data,
        categoryOptions: data?.categoryOptions || ["Tất cả"],
        summary: {
          ...defaultReportData.summary,
          ...(data?.summary || {}),
        },
        chartData: data?.chartData || [],
        services: data?.services || [],
      })
    } catch (error) {
      setErrorMessage(
        error.message || "Không thể tải báo cáo tình hình sử dụng dịch vụ."
      )
    } finally {
      setIsLoading(false)
    }
  }, [
    fromDate,
    toDate,
    keyword,
    categoryFilter,
    usageStatusFilter,
    serviceStatusFilter,
    sortBy,
  ])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServiceUsageReport()
  }, [fetchServiceUsageReport])

  const filteredServices = reportData.services || []
  const summary = reportData.summary || defaultReportData.summary
  const chartData = reportData.chartData || []
  const categoryOptions = reportData.categoryOptions || ["Tất cả"]

  const handleResetFilter = () => {
    setFromDate(getFirstDayOfCurrentMonth())
    setToDate(getTodayInputValue())
    setKeyword("")
    setCategoryFilter("Tất cả")
    setUsageStatusFilter("Tất cả")
    setServiceStatusFilter("Tất cả")
    setSortBy("Lượt sử dụng cao nhất")
  }

  const handleExportReport = () => {
    exportStyledExcel({
      title: "BÁO CÁO TÌNH HÌNH SỬ DỤNG DỊCH VỤ",
      subtitle: `Từ ngày ${formatDateVN(fromDate)} đến ${formatDateVN(
        toDate
      )} · Danh mục: ${categoryFilter}`,
      fileName: `bao-cao-tinh-hinh-su-dung-dich-vu-${fromDate}-${toDate}`,
      columns: [
        {
          label: "STT",
          value: (_, index) => index + 1,
          align: "center",
        },
        {
          label: "Mã DV",
          value: "serviceCode",
        },
        {
          label: "Tên dịch vụ",
          value: "serviceName",
        },
        {
          label: "Danh mục",
          value: "category",
        },
        {
          label: "Lượt dùng",
          value: "usageCount",
          align: "center",
        },
        {
          label: "Số khách",
          value: "customerCount",
          align: "center",
        },
        {
          label: "Tổng thời lượng",
          value: (item) => formatDuration(item.totalDuration),
        },
        {
          label: "Doanh thu",
          value: (item) => formatExcelMoney(item.revenue),
          type: "money",
        },
        {
          label: "Đánh giá",
          value: (item) => item.reviewCount || 0,
          align: "center",
        },
        {
          label: "Sao TB",
          value: (item) => (item.averageRating ? `${item.averageRating}/5` : "Chưa có"),
          align: "center",
        },
        {
          label: "Trạng thái",
          value: "serviceStatus",
          type: "status",
        },
        {
          label: "Cập nhật gần nhất",
          value: (item) => item.lastUsedAt || "",
        },
      ],
      rows: filteredServices,
      summaryRows: [
        {
          label: "Tổng dịch vụ",
          value: summary.totalServices,
        },
        {
          label: "Dịch vụ đã sử dụng",
          value: summary.usedServices,
        },
        {
          label: "Dịch vụ chưa sử dụng",
          value: summary.unusedServices,
        },
        {
          label: "Tổng lượt sử dụng",
          value: summary.totalUsage,
        },
        {
          label: "Tổng số khách",
          value: summary.totalCustomers,
        },
        {
          label: "Tổng thời lượng phục vụ",
          value: formatDuration(summary.totalDuration),
        },
        {
          label: "Tổng doanh thu tham khảo",
          value: formatExcelMoney(summary.totalRevenue),
          type: "money",
        },
        {
          label: "Số sao trung bình",
          value: `${summary.averageRating || 0}/5`,
        },
      ],
    })
  }

  return (
    <div className="service-usage-page">
      <section className="service-usage-filter-card">
        <div className="service-usage-filter-left">
          <label className="service-usage-date-picker">
            <CalendarDays size={17} />
            <span>{formatDateVN(fromDate)}</span>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <span className="service-usage-date-separator">-</span>

          <label className="service-usage-date-picker">
            <span>{formatDateVN(toDate)}</span>

            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>

          <div className="service-usage-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Tìm mã dịch vụ, tên dịch vụ..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="service-usage-filter-item">
            <Filter size={17} />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categoryOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="service-usage-filter-item">
            <select
              value={usageStatusFilter}
              onChange={(event) => setUsageStatusFilter(event.target.value)}
            >
              {usageStatusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="service-usage-filter-item">
            <select
              value={serviceStatusFilter}
              onChange={(event) => setServiceStatusFilter(event.target.value)}
            >
              {serviceStatusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="service-usage-filter-item">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="service-usage-actions">
          <button
            type="button"
            className="service-usage-reset-btn"
            onClick={handleResetFilter}
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="service-usage-export-btn"
            onClick={handleExportReport}
            disabled={isLoading}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      {isLoading && (
        <div className="service-usage-state-card">
          Đang tải báo cáo tình hình sử dụng dịch vụ...
        </div>
      )}

      {errorMessage && (
        <div className="service-usage-state-card">
          <p>{errorMessage}</p>

          <button
            type="button"
            className="service-usage-export-btn"
            onClick={fetchServiceUsageReport}
          >
            Tải lại
          </button>
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className="service-usage-summary-grid">
            <div className="service-usage-summary-card">
              <div className="service-usage-summary-icon">
                <ClipboardList size={22} />
              </div>

              <p>Tổng dịch vụ</p>
              <h2>{summary.totalServices}</h2>
              <span>Dịch vụ phù hợp với bộ lọc</span>
            </div>

            <div className="service-usage-summary-card">
              <div className="service-usage-summary-icon">
                <CircleCheckBig size={22} />
              </div>

              <p>Đã sử dụng</p>
              <h2>{summary.usedServices}</h2>
              <span>Dịch vụ đã có lượt dùng</span>
            </div>

            <div className="service-usage-summary-card">
              <div className="service-usage-summary-icon">
                <CircleMinus size={22} />
              </div>

              <p>Chưa sử dụng</p>
              <h2>{summary.unusedServices}</h2>
              <span>Dịch vụ chưa phát sinh lượt dùng</span>
            </div>

            <div className="service-usage-summary-card">
              <div className="service-usage-summary-icon">
                <TrendingUp size={22} />
              </div>

              <p>Tổng lượt sử dụng</p>
              <h2>{summary.totalUsage}</h2>
              <span>{formatMoney(summary.totalRevenue)} doanh thu tham khảo</span>
            </div>

            <div className="service-usage-summary-card">
              <div className="service-usage-summary-icon">
                <Star size={22} />
              </div>

              <p>Đánh giá dịch vụ</p>
              <h2>{summary.averageRating || 0}/5</h2>
              <span>{summary.totalReviews || 0} lượt đánh giá trong kỳ</span>
            </div>
          </section>

          <section className="service-usage-chart-card">
            <div className="service-usage-card-header">
              <div>
                <h3>Top dịch vụ được sử dụng nhiều nhất</h3>
                <p>
                  Biểu đồ chỉ hiển thị các dịch vụ đã có lượt sử dụng trong
                  khoảng thời gian được chọn.
                </p>
              </div>

              <strong>{summary.totalUsage} lượt</strong>
            </div>

            <div className="service-usage-chart">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
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
                    />

                    <Tooltip content={<ServiceTooltip />} />

                    <Bar
                      dataKey="usage"
                      fill={ADMIN_GOLD}
                      radius={[8, 8, 0, 0]}
                      barSize={34}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="service-usage-chart-empty">
                  Chưa có dịch vụ nào phát sinh lượt sử dụng
                </div>
              )}
            </div>
          </section>

          <section className="service-usage-table-card">
            <div className="service-usage-table-header">
              <div>
                <h3>Bảng báo cáo tình hình sử dụng dịch vụ</h3>
                <p>
                  Hiển thị <strong>{filteredServices.length}</strong> dịch vụ
                </p>
              </div>

              <div className="service-usage-table-total">
                Doanh thu tham khảo:{" "}
                <strong>{formatMoney(summary.totalRevenue)}</strong>
              </div>
            </div>

            <div className="service-usage-table-wrapper">
              <table className="service-usage-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mã DV</th>
                    <th>Tên dịch vụ</th>
                    <th>Danh mục</th>
                    <th>Lượt dùng</th>
                    <th>Số khách</th>
                    <th>Tổng thời lượng</th>
                    <th>Doanh thu</th>
                    <th>Đánh giá</th>
                    <th>Sao TB</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service, index) => (
                      <tr key={service.id}>
                        <td>{index + 1}</td>

                        <td className="service-usage-code">
                          {service.serviceCode}
                        </td>

                        <td>
                          <strong className="service-usage-name">
                            {service.serviceName}
                          </strong>

                          <p>
                            {service.lastUsedAt
                              ? `Cập nhật gần nhất: ${service.lastUsedAt}`
                              : "Chưa phát sinh lượt sử dụng"}
                          </p>
                        </td>

                        <td>{service.category}</td>
                        <td>{service.usageCount}</td>
                        <td>{service.customerCount}</td>
                        <td>{formatDuration(service.totalDuration)}</td>

                        <td className="service-usage-money">
                          {formatMoney(service.revenue)}
                        </td>

                        <td>{service.reviewCount || 0}</td>

                        <td>
                          <span className="service-usage-rating">
                            <Star size={14} />
                            {service.averageRating ? `${service.averageRating}/5` : "Chưa có"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              service.serviceStatus === "Đang cung cấp"
                                ? "service-usage-status active"
                                : "service-usage-status inactive"
                            }
                          >
                            {service.serviceStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11">
                        <div className="service-usage-empty">
                          Chưa có dữ liệu dịch vụ phù hợp
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan="4">Tổng cộng</td>
                    <td>{summary.totalUsage}</td>
                    <td>{summary.totalCustomers}</td>
                    <td>{formatDuration(summary.totalDuration)}</td>
                    <td>{formatMoney(summary.totalRevenue)}</td>
                    <td>{summary.totalReviews || 0}</td>
                    <td>{summary.averageRating ? `${summary.averageRating}/5` : "0/5"}</td>
                    <td>
                      {summary.usedServices} đã dùng ·{" "}
                      {summary.unusedServices} chưa dùng
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default ServiceUsageReport
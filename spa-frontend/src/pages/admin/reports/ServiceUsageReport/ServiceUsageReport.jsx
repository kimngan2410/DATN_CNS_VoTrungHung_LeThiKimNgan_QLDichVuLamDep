import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./ServiceUsageReport.css";

const ADMIN_GOLD = "#d7a93f";

const serviceUsageRows = [
  {
    id: 1,
    serviceCode: "DV001",
    serviceName: "Chăm sóc da mặt",
    category: "Chăm sóc da",
    usageCount: 46,
    customerCount: 39,
    totalDuration: 2760,
    revenue: 18400000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-07",
  },
  {
    id: 2,
    serviceCode: "DV002",
    serviceName: "Gội đầu dưỡng sinh",
    category: "Gội đầu",
    usageCount: 38,
    customerCount: 34,
    totalDuration: 1710,
    revenue: 13300000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-07",
  },
  {
    id: 3,
    serviceCode: "DV003",
    serviceName: "Massage body",
    category: "Massage",
    usageCount: 31,
    customerCount: 27,
    totalDuration: 1860,
    revenue: 15500000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-06",
  },
  {
    id: 4,
    serviceCode: "DV004",
    serviceName: "Tắm trắng phi thuyền",
    category: "Tắm trắng",
    usageCount: 24,
    customerCount: 22,
    totalDuration: 2160,
    revenue: 28800000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-07",
  },
  {
    id: 5,
    serviceCode: "DV005",
    serviceName: "Điều trị mụn chuyên sâu",
    category: "Chăm sóc da",
    usageCount: 19,
    customerCount: 18,
    totalDuration: 1520,
    revenue: 16150000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-06",
  },
  {
    id: 6,
    serviceCode: "DV006",
    serviceName: "Massage cổ vai gáy",
    category: "Massage",
    usageCount: 17,
    customerCount: 16,
    totalDuration: 510,
    revenue: 3400000,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: "2026-05-05",
  },
  {
    id: 7,
    serviceCode: "DV007",
    serviceName: "Triệt lông tay",
    category: "Triệt lông",
    usageCount: 0,
    customerCount: 0,
    totalDuration: 0,
    revenue: 0,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: null,
  },
  {
    id: 8,
    serviceCode: "DV008",
    serviceName: "Ủ trắng body",
    category: "Tắm trắng",
    usageCount: 0,
    customerCount: 0,
    totalDuration: 0,
    revenue: 0,
    serviceStatus: "Đang cung cấp",
    lastUsedAt: null,
  },
  {
    id: 9,
    serviceCode: "DV009",
    serviceName: "Chăm sóc da lưng",
    category: "Chăm sóc da",
    usageCount: 0,
    customerCount: 0,
    totalDuration: 0,
    revenue: 0,
    serviceStatus: "Ngừng cung cấp",
    lastUsedAt: null,
  },
];

const categoryOptions = [
  "Tất cả",
  ...Array.from(new Set(serviceUsageRows.map((item) => item.category))),
];

const usageStatusOptions = ["Tất cả", "Đã sử dụng", "Chưa sử dụng"];

const serviceStatusOptions = ["Tất cả", "Đang cung cấp", "Ngừng cung cấp"];

const sortOptions = [
  "Lượt sử dụng cao nhất",
  "Doanh thu cao nhất",
  "Số khách cao nhất",
  "Thời lượng cao nhất",
  "Tên dịch vụ A-Z",
];

const formatMoney = (value) => {
  return `${Number(value).toLocaleString("vi-VN")} đ`;
};

const formatDuration = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  if (hour === 0) return `${minute} phút`;
  if (minute === 0) return `${hour} giờ`;

  return `${hour} giờ ${minute} phút`;
};

const getUsageStatus = (service) => {
  return service.usageCount > 0 ? "Đã sử dụng" : "Chưa sử dụng";
};

function ServiceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="service-usage-tooltip">
      <h4>{label}</h4>
      <p>{payload[0].value} lượt sử dụng</p>
    </div>
  );
}

function ServiceUsageReport() {
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-07");
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [usageStatusFilter, setUsageStatusFilter] = useState("Tất cả");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Lượt sử dụng cao nhất");

  const filteredServices = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();

    const result = serviceUsageRows.filter((service) => {
      const usageStatus = getUsageStatus(service);

      const matchesKeyword =
        keywordText === "" ||
        service.serviceCode.toLowerCase().includes(keywordText) ||
        service.serviceName.toLowerCase().includes(keywordText) ||
        service.category.toLowerCase().includes(keywordText);

      const matchesCategory =
        categoryFilter === "Tất cả" || service.category === categoryFilter;

      const matchesUsageStatus =
        usageStatusFilter === "Tất cả" || usageStatus === usageStatusFilter;

      const matchesServiceStatus =
        serviceStatusFilter === "Tất cả" ||
        service.serviceStatus === serviceStatusFilter;

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesUsageStatus &&
        matchesServiceStatus
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "Doanh thu cao nhất") return b.revenue - a.revenue;

      if (sortBy === "Số khách cao nhất") {
        return b.customerCount - a.customerCount;
      }

      if (sortBy === "Thời lượng cao nhất") {
        return b.totalDuration - a.totalDuration;
      }

      if (sortBy === "Tên dịch vụ A-Z") {
        return a.serviceName.localeCompare(b.serviceName, "vi");
      }

      return b.usageCount - a.usageCount;
    });
  }, [
    keyword,
    categoryFilter,
    usageStatusFilter,
    serviceStatusFilter,
    sortBy,
  ]);

  const summary = useMemo(() => {
    const totalServices = filteredServices.length;

    const usedServices = filteredServices.filter(
      (item) => item.usageCount > 0
    ).length;

    const unusedServices = filteredServices.filter(
      (item) => item.usageCount === 0
    ).length;

    const totalUsage = filteredServices.reduce(
      (sum, item) => sum + item.usageCount,
      0
    );

    const totalCustomers = filteredServices.reduce(
      (sum, item) => sum + item.customerCount,
      0
    );

    const totalDuration = filteredServices.reduce(
      (sum, item) => sum + item.totalDuration,
      0
    );

    const totalRevenue = filteredServices.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return {
      totalServices,
      usedServices,
      unusedServices,
      totalUsage,
      totalCustomers,
      totalDuration,
      totalRevenue,
    };
  }, [filteredServices]);

  const chartData = filteredServices
    .filter((item) => item.usageCount > 0)
    .slice(0, 6)
    .map((item) => ({
      name: item.serviceName,
      usage: item.usageCount,
    }));

  const handleResetFilter = () => {
    setFromDate("2026-05-01");
    setToDate("2026-05-07");
    setKeyword("");
    setCategoryFilter("Tất cả");
    setUsageStatusFilter("Tất cả");
    setServiceStatusFilter("Tất cả");
    setSortBy("Lượt sử dụng cao nhất");
  };

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo tình hình sử dụng dịch vụ"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["Danh mục", categoryFilter],
      ["Tình trạng sử dụng", usageStatusFilter],
      ["Trạng thái dịch vụ", serviceStatusFilter],
      ["Sắp xếp", sortBy],
      [],
      [
        "Mã dịch vụ",
        "Tên dịch vụ",
        "Danh mục",
        "Lượt sử dụng",
        "Số khách sử dụng",
        "Tổng thời lượng phục vụ",
        "Doanh thu tham khảo",
        "Trạng thái dịch vụ",
      ],
      ...filteredServices.map((item) => [
        item.serviceCode,
        item.serviceName,
        item.category,
        item.usageCount,
        item.customerCount,
        item.totalDuration,
        item.revenue,
        item.serviceStatus,
      ]),
      [],
      ["Tổng dịch vụ", summary.totalServices],
      ["Dịch vụ đã sử dụng", summary.usedServices],
      ["Dịch vụ chưa sử dụng", summary.unusedServices],
      ["Tổng lượt sử dụng", summary.totalUsage],
      ["Tổng số khách", summary.totalCustomers],
      ["Tổng thời lượng phục vụ", summary.totalDuration],
      ["Tổng doanh thu tham khảo", summary.totalRevenue],
    ];

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-tinh-hinh-su-dung-dich-vu.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="service-usage-page">
      <section className="service-usage-filter-card">
        <div className="service-usage-filter-left">
          <div className="service-usage-filter-item">
            <CalendarDays size={17} />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <span className="service-usage-date-separator">-</span>

          <div className="service-usage-filter-item">
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

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
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="service-usage-export-btn"
            onClick={handleExportReport}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

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
      </section>

      <section className="service-usage-chart-card">
        <div className="service-usage-card-header">
          <div>
            <h3>Top dịch vụ được sử dụng nhiều nhất</h3>
            <p>
              Biểu đồ chỉ hiển thị các dịch vụ đã có lượt sử dụng trong khoảng
              thời gian được chọn.
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
                      <strong className="service-usage-name">{service.serviceName}</strong>
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
                  <td colSpan="9">
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
                <td>
                  {summary.usedServices} đã dùng · {summary.unusedServices} chưa dùng
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ServiceUsageReport;
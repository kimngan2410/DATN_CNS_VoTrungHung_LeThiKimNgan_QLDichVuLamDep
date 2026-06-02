import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck2,
  Clock3,
  Loader2,
  UserCheck,
  Wallet,
  CalendarDays,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./StaffOverview.css";
import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader";
import { getStaffOverviewApi } from "../../../services/staffOverviewApi";

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
};

const formatAxisMoney = (value) => {
  if (value === 0) return "0";

  if (value >= 1000000) {
    return `${value / 1000000}M`;
  }

  return value.toLocaleString("vi-VN");
};

const formatDateVN = (dateValue) => {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) return dateValue;

  return `${day}/${month}/${year}`;
};

const formatMonthVN = (monthValue) => {
  if (!monthValue) return "";

  const [year, month] = monthValue.split("-");

  if (!year || !month) return monthValue;

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatWeekVN = (weekValue) => {
  if (!weekValue) return "";

  const [year, week] = weekValue.split("-W");

  if (!year || !week) return weekValue;

  return `Week ${Number(week)}, ${year}`;
};

const getFilterDisplayValue = (period, value) => {
  if (period === "date") return formatDateVN(value);
  if (period === "week") return formatWeekVN(value);
  if (period === "month") return formatMonthVN(value);
  if (period === "year") return value;

  return value;
};

const defaultOverviewData = {
  period: {
    key: "date",
    label: "Hôm nay",
    startDate: "",
    endDate: "",
  },
  stats: {
    totalAppointmentsToday: 0,
    checkedInToday: 0,
    doingToday: 0,
    todayRevenue: 0,
  },
  revenueData: [],
  appointmentData: [],
  appointmentStatusData: [],
  popularServicesData: [],
  recentAppointments: [],
};

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
];

const padNumber = (value) => {
  return String(value).padStart(2, "0");
};

const getDateInputValue = (date = new Date()) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}`;
};

const getMonthInputValue = (date = new Date()) => {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;
};

const getWeekInputValue = (date = new Date()) => {
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  const dayNumber = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((tempDate - yearStart) / 86400000 + 1) / 7
  );

  return `${tempDate.getUTCFullYear()}-W${padNumber(weekNumber)}`;
};

const getDefaultFilterValue = (period) => {
  const now = new Date();

  if (period === "week") return getWeekInputValue(now);
  if (period === "month") return getMonthInputValue(now);
  if (period === "year") return String(now.getFullYear());

  return getDateInputValue(now);
};

const getFilterInputType = (period) => {
  if (period === "week") return "week";
  if (period === "month") return "month";
  if (period === "year") return "number";

  return "date";
};

const getServiceNamesText = (services) => {
  if (!services || services.length === 0) return "";

  const serviceNames = services.map((service) => service.name);

  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  return `${serviceNames.slice(0, 2).join(", ")}...`;
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="staff-chart-tooltip">
        <strong>{label}</strong>
        <p>Doanh thu : {formatMoney(payload[0].value)}</p>
      </div>
    );
  }

  return null;
};

const SimpleTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="staff-chart-tooltip">
        <strong>{label}</strong>
        <p>Giá trị : {payload[0].value}</p>
      </div>
    );
  }

  return null;
};

const PopularServiceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;

    return (
      <div className="staff-chart-tooltip">
        <strong>{label}</strong>
        <p>Lượt sử dụng : {data.usage}</p>
        <p>Doanh thu : {formatMoney(data.revenue)}</p>
      </div>
    );
  }

  return null;
};

const StatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="staff-chart-tooltip">
        <strong>{payload[0].name}</strong>
        <p>Số lịch hẹn : {payload[0].value}</p>
      </div>
    );
  }

  return null;
};

const getStatusClass = (status) => {
  switch (status) {
    case "Chờ xác nhận":
      return "pending";
    case "Đã xác nhận":
      return "confirmed";
    case "Đã check-in":
      return "checked";
    case "Đang thực hiện":
      return "doing";
    case "Đã hoàn thành":
      return "completed";
    case "Đã huỷ":
      return "cancelled";
    case "Không đến":
      return "no-show";
    default:
      return "";
  }
};

function StaffOverview() {
  const navigate = useNavigate();

  const [overviewData, setOverviewData] = useState(defaultOverviewData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("date");
  const [selectedFilterValue, setSelectedFilterValue] = useState(
    getDefaultFilterValue("date")
  );

  const handleChangePeriod = (periodValue) => {
    setSelectedPeriod(periodValue);
    setSelectedFilterValue(getDefaultFilterValue(periodValue));
  };

  const fetchOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getStaffOverviewApi(
        selectedPeriod,
        selectedFilterValue
      );

      setOverviewData({
        period: data?.period || defaultOverviewData.period,
        stats: data?.stats || defaultOverviewData.stats,
        revenueData: data?.revenueData || [],
        appointmentData: data?.appointmentData || [],
        appointmentStatusData: data?.appointmentStatusData || [],
        popularServicesData: data?.popularServicesData || [],
        recentAppointments: data?.recentAppointments || [],
      });
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, selectedFilterValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  const {
    period,
    stats,
    revenueData,
    appointmentData,
    appointmentStatusData,
    popularServicesData,
    recentAppointments,
  } = overviewData;

  const activePeriodOption =
    OVERVIEW_PERIOD_OPTIONS.find((option) => option.value === selectedPeriod) ||
    OVERVIEW_PERIOD_OPTIONS[0];

  const renderFilterCard = () => (
    <div className="staff-overview-filter-card">
      <div className="staff-overview-filter-info">
        <span>Bộ lọc thời gian</span>
        <strong>{period?.label || activePeriodOption.label}</strong>

        {period?.startDate && period?.endDate && (
          <small>
            {period.startDate === period.endDate
              ? period.startDate
              : `${period.startDate} đến ${period.endDate}`}
          </small>
        )}
      </div>

      <div className="staff-overview-filter-control">
        <div className="staff-overview-filter-tabs">
          {OVERVIEW_PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`staff-overview-filter-btn ${
                selectedPeriod === option.value ? "active" : ""
              }`}
              onClick={() => handleChangePeriod(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="staff-overview-date-picker">
          <span>{activePeriodOption.inputLabel}</span>

          <strong>
            {getFilterDisplayValue(selectedPeriod, selectedFilterValue)}
          </strong>

          <CalendarDays className="staff-overview-date-icon" size={18} />

          <input
            type={getFilterInputType(selectedPeriod)}
            value={selectedFilterValue}
            min={selectedPeriod === "year" ? "2020" : undefined}
            max={selectedPeriod === "year" ? "2100" : undefined}
            onChange={(event) => setSelectedFilterValue(event.target.value)}
          />
        </label>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="staff-overview">
        <StaffPageHeader title="Tổng quan" />

        <section className="staff-dashboard-content">
          {renderFilterCard()}

          <div className="staff-dashboard-card staff-overview-state-card">
            <Loader2 className="staff-overview-loading-icon" size={34} />
            <h3>Đang tải dữ liệu tổng quan</h3>
            <p>Vui lòng chờ trong giây lát...</p>
          </div>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="staff-overview">
        <StaffPageHeader title="Tổng quan" />

        <section className="staff-dashboard-content">
          {renderFilterCard()}

          <div className="staff-dashboard-card staff-overview-state-card">
            <AlertCircle size={36} />
            <h3>Không thể tải dữ liệu</h3>
            <p>{errorMessage}</p>

            <button type="button" onClick={fetchOverview}>
              Thử lại
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="staff-overview">
      <StaffPageHeader title="Tổng quan" />

      <section className="staff-dashboard-content">
        {renderFilterCard()}

        <div className="staff-stat-grid">
          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <CalendarCheck2 size={26} />
            </div>

            <div>
              <p>Tổng lịch hẹn</p>
              <h2>{stats.totalAppointmentsToday}</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <UserCheck size={26} />
            </div>

            <div>
              <p>Khách đã check-in</p>
              <h2>{stats.checkedInToday}</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <Clock3 size={26} />
            </div>

            <div>
              <p>Đang thực hiện</p>
              <h2>{stats.doingToday}</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon dark-gold">
              <Wallet size={26} />
            </div>

            <div>
              <p>Doanh thu</p>
              <h2>{formatMoney(stats.todayRevenue)}</h2>
            </div>
          </div>
        </div>

        <div className="staff-chart-grid first-row">
          <div className="staff-dashboard-card">
            <h3>Doanh thu - {period?.label || "Hôm nay"}</h3>

            <div className="staff-chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#eadfcb"
                  />

                  <XAxis dataKey="day" axisLine={false} tickLine={false} />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 10000000]}
                    ticks={[0, 2500000, 5000000, 7500000, 10000000]}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />

                  <Tooltip content={<RevenueTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4d4a4b"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      fill: "#d7a93f",
                      stroke: "#4d4a4b",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#d7a93f",
                      stroke: "#4d4a4b",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="staff-dashboard-card">
            <h3>Số lượng lịch hẹn - {period?.label || "Hôm nay"}</h3>

            <div className="staff-chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={appointmentData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#eadfcb"
                  />

                  <XAxis dataKey="day" axisLine={false} tickLine={false} />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 45]}
                    ticks={[0, 10, 20, 30, 40]}
                  />

                  <Tooltip
                    content={<SimpleTooltip />}
                    cursor={{ fill: "transparent" }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#d7a93f"
                    radius={[4, 4, 0, 0]}
                    barSize={46}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="staff-chart-grid second-row">
          <div className="staff-dashboard-card staff-status-distribution-card">
            <h3>Phân bố trạng thái</h3>

            <p className="staff-card-subtitle">
              Tổng lịch hẹn theo trạng thái - {period?.label || "Hôm nay"}
            </p>

            <div className="staff-status-chart-wrap">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {appointmentStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip content={<StatusTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="staff-status-legend">
              {appointmentStatusData.map((item) => (
                <div className="staff-status-legend-item" key={item.name}>
                  <div className="staff-status-legend-left">
                    <span
                      className="staff-status-legend-dot"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span>{item.name}</span>
                  </div>

                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="staff-dashboard-card staff-popular-service-card">
            <h3>Dịch vụ phổ biến</h3>

            <p className="staff-card-subtitle">
              Số lượt sử dụng và doanh thu theo dịch vụ -{" "}
              {period?.label || "Hôm nay"}
            </p>

            <div className="staff-horizontal-bar-box">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={popularServicesData}
                  margin={{ top: 8, right: 10, left: 26, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    horizontal={false}
                    stroke="#eadfcb"
                  />

                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatAxisMoney}
                    tick={{
                      fontSize: 14,
                      fill: "#6f6a6b",
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={125}
                    tick={{
                      fontSize: 12,
                      fill: "#6f6a6b",
                    }}
                  />

                  <Tooltip content={<PopularServiceTooltip />} />

                  <Bar
                    dataKey="revenue"
                    fill="#d7a93f"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="staff-popular-service-note">
              <span className="staff-note-dot gold"></span>
              <span>Doanh thu theo dịch vụ (VNĐ)</span>
            </div>
          </div>
        </div>

        <div className="staff-dashboard-card staff-appointment-card">
          <div className="staff-card-header">
            <h3>Lịch hẹn gần đây</h3>

            <button type="button" onClick={() => navigate("/staff/lich-hen")}>
              Xem tất cả
            </button>
          </div>

          <div className="staff-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã LH</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <p>Không có lịch hẹn trong khoảng thời gian này.</p>
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((item) => (
                    <tr key={item.id}>
                      <td className="staff-appointment-id">{item.id}</td>

                      <td>
                        <strong>{item.customer}</strong>
                        <p>{item.phone}</p>
                      </td>

                      <td>
                        <div className="appointment-service-text">
                          {getServiceNamesText(item.services)}
                        </div>
                      </td>

                      <td>
                        <strong>{item.time}</strong>
                        <p>{item.date}</p>
                      </td>

                      <td>
                        <span
                          className={`staff-status ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StaffOverview;
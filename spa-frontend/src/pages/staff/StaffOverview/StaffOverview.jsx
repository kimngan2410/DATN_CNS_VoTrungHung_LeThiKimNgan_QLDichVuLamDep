import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  UserRound,
  CalendarCheck2,
  UserCheck,
  Wallet,
  Clock3,
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

const revenueData = [
  { day: "T2", revenue: 3000000 },
  { day: "T3", revenue: 4500000 },
  { day: "T4", revenue: 3800000 },
  { day: "T5", revenue: 5200000 },
  { day: "T6", revenue: 6100000 },
  { day: "T7", revenue: 8700000 },
  { day: "CN", revenue: 9200000 },
];

const appointmentData = [
  { day: "T2", count: 15 },
  { day: "T3", count: 20 },
  { day: "T4", count: 18 },
  { day: "T5", count: 22 },
  { day: "T6", count: 28 },
  { day: "T7", count: 35 },
  { day: "CN", count: 41 },
];

const popularServicesData = [
  {
    name: "Massage thư giãn",
    usage: 42,
    revenue: 11200000,
  },
  {
    name: "Chăm sóc da mặt",
    usage: 45,
    revenue: 12000000,
  },
  {
    name: "Tắm trắng",
    usage: 45,
    revenue: 12000000,
  },
  {
    name: "Gội đầu dưỡng sinh",
    usage: 18,
    revenue: 4200000,
  },
  {
    name: "Nail art",
    usage: 15,
    revenue: 3600000,
  },
];

const appointmentStatusData = [
  {
    name: "Chờ xác nhận",
    value: 5,
    color: "#d7a93f",
  },
  {
    name: "Đã xác nhận",
    value: 12,
    color: "#ead6a0",
  },
  {
    name: "Đã check-in",
    value: 8,
    color: "#8b7f73",
  },
  {
    name: "Đang thực hiện",
    value: 4,
    color: "#6a6667",
  },
  {
    name: "Đã hoàn thành",
    value: 45,
    color: "#4d4a4b",
  },
  {
    name: "Đã huỷ",
    value: 3,
    color: "#ef6f6c",
  },
  {
    name: "Không đến",
    value: 2,
    color: "#b45309",
  },
];

const recentAppointments = [
  {
    id: "LH001",
    customer: "Nguyễn Thị Mai",
    phone: "0901234567",
    services: [
      { name: "Massage body", duration: 60, price: 500000 },
      { name: "Gội đầu dưỡng sinh", duration: 45, price: 250000 },
    ],
    time: "09:00",
    date: "2026-05-04",
    status: "Đã hoàn thành",
  },
  {
    id: "LH002",
    customer: "Trần Văn Hùng",
    phone: "0912345678",
    services: [
      { name: "Gội đầu dưỡng sinh", duration: 45, price: 250000 },
      { name: "Chăm sóc da mặt", duration: 60, price: 400000 },
      { name: "Massage cổ vai gáy", duration: 30, price: 200000 },
    ],
    time: "10:30",
    date: "2026-05-04",
    status: "Đang thực hiện",
  },
  {
    id: "LH003",
    customer: "Lê Thị Hoa",
    phone: "0923456789",
    services: [{ name: "Chăm sóc da mặt", duration: 60, price: 400000 }],
    time: "14:00",
    date: "2026-05-04",
    status: "Đã check-in",
  },
  {
    id: "LH004",
    customer: "Phạm Minh Tuấn",
    phone: "0934567890",
    services: [
      { name: "Massage body", duration: 60, price: 500000 },
      { name: "Xông hơi thư giãn", duration: 30, price: 180000 },
    ],
    time: "15:30",
    date: "2026-05-04",
    status: "Đã xác nhận",
  },
  {
    id: "LH005",
    customer: "Hoàng Thu Trang",
    phone: "0945678901",
    services: [
      { name: "Nail art", duration: 45, price: 300000 },
      { name: "Sơn gel", duration: 30, price: 180000 },
      { name: "Gội đầu dưỡng sinh", duration: 45, price: 250000 },
    ],
    time: "16:00",
    date: "2026-05-04",
    status: "Chờ xác nhận",
  },
];

const formatMoney = (value) => {
  return `${value.toLocaleString("vi-VN")} đ`;
};

const formatAxisMoney = (value) => {
  if (value === 0) return "0";

  if (value >= 1000000) {
    return `${value / 1000000}M`;
  }

  return value.toLocaleString("vi-VN");
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

  return (
    <div className="staff-overview">
      <StaffPageHeader title="Tổng quan" />

      <section className="staff-dashboard-content">
        <div className="staff-stat-grid">
          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <CalendarCheck2 size={26} />
            </div>

            <div>
              <p>Tổng lịch hẹn hôm nay</p>
              <h2>12</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <UserCheck size={26} />
            </div>

            <div>
              <p>Khách đã check-in</p>
              <h2>5</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon gold-soft">
              <Clock3 size={26} />
            </div>

            <div>
              <p>Đang thực hiện</p>
              <h2>4</h2>
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="staff-stat-icon dark-gold">
              <Wallet size={26} />
            </div>

            <div>
              <p>Doanh thu hôm nay</p>
              <h2>4.500.000 đ</h2>
            </div>
          </div>
        </div>

        <div className="staff-chart-grid first-row">
          <div className="staff-dashboard-card">
            <h3>Doanh thu 7 ngày gần nhất</h3>

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
            <h3>Số lượng lịch hẹn theo ngày</h3>

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
            <p className="staff-card-subtitle">Tổng lịch hẹn trong tuần</p>

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
              Số lượt sử dụng và doanh thu theo dịch vụ trong tuần
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
            <button
              type="button"
              onClick={() => navigate("/staff/lich-hen")}
            >
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
                {recentAppointments.map((item) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StaffOverview;
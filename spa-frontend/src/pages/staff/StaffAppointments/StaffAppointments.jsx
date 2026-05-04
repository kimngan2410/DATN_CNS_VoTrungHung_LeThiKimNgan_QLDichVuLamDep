import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  UserRound,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./StaffAppointments.css";

const TODAY = new Date("2026-05-04");

const appointmentList = [
  {
    id: "LH001",
    customer: "Nguyễn Thị Mai",
    phone: "0901234567",
    services: [{ name: "Massage body" }, { name: "Gội đầu dưỡng sinh" }],
    date: "2026-05-04",
    time: "09:00",
    status: "Đã hoàn thành",
  },
  {
    id: "LH002",
    customer: "Trần Văn Hùng",
    phone: "0912345678",
    services: [
      { name: "Gội đầu dưỡng sinh" },
      { name: "Chăm sóc da mặt" },
      { name: "Massage cổ vai gáy" },
    ],
    date: "2026-05-04",
    time: "10:30",
    status: "Đang thực hiện",
  },
  {
    id: "LH003",
    customer: "Lê Thị Hoa",
    phone: "0923456789",
    services: [{ name: "Chăm sóc da mặt" }],
    date: "2026-05-04",
    time: "14:00",
    status: "Đã check-in",
  },
  {
    id: "LH004",
    customer: "Phạm Minh Tuấn",
    phone: "0934567890",
    services: [{ name: "Massage body" }],
    date: "2026-05-04",
    time: "15:30",
    status: "Đã xác nhận",
  },
  {
    id: "LH005",
    customer: "Hoàng Thu Trang",
    phone: "0945678901",
    services: [{ name: "Nail art" }, { name: "Sơn gel" }],
    date: "2026-05-04",
    time: "16:00",
    status: "Chờ xác nhận",
  },
  {
    id: "LH006",
    customer: "Nguyễn Thị Mai",
    phone: "0901234567",
    services: [{ name: "Tắm trắng" }],
    date: "2026-05-05",
    time: "10:00",
    status: "Đã xác nhận",
  },
  {
    id: "LH007",
    customer: "Lê Thị Hoa",
    phone: "0923456789",
    services: [{ name: "Waxing" }],
    date: "2026-05-03",
    time: "11:00",
    status: "Đã huỷ",
  },
  {
    id: "LH008",
    customer: "Đặng Minh Anh",
    phone: "0967891234",
    services: [{ name: "Gội đầu dưỡng sinh" }],
    date: "2026-05-04",
    time: "17:00",
    status: "Không đến",
  },
];

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đã check-in",
  "Đang thực hiện",
  "Đã hoàn thành",
  "Đã huỷ",
  "Không đến",
];

const formatDateToValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  const weekdays = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  return `${weekdays[date.getDay()]} ${date.getDate()} thg ${
    date.getMonth() + 1
  }`;
};

const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
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

const getServiceNamesText = (services) => {
  if (!services || services.length === 0) return "";

  const serviceNames = services.map((service) => service.name);

  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  return `${serviceNames.slice(0, 2).join(", ")}...`;
};

function StaffAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const selectedDateValue = formatDateToValue(selectedDate);

  const filteredAppointments = useMemo(() => {
    return appointmentList.filter((appointment) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesKeyword =
        keyword === "" ||
        appointment.id.toLowerCase().includes(keyword) ||
        appointment.customer.toLowerCase().includes(keyword) ||
        appointment.phone.toLowerCase().includes(keyword) ||
        appointment.services.some((service) =>
          service.name.toLowerCase().includes(keyword)
        );

      const matchesStatus =
        statusFilter === "Tất cả" || appointment.status === statusFilter;

      const matchesDate = appointment.date === selectedDateValue;

      return matchesKeyword && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, selectedDateValue]);

  const handleGoToday = () => {
    setSelectedDate(TODAY);
  };

  const handlePrevDate = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDate = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleCreateAppointment = () => {
    alert("Đi tới giao diện Tạo lịch hẹn");
  };

  const handleViewDetail = (appointment) => {
    alert(`Đi tới chi tiết lịch hẹn: ${appointment.id}`);
  };

  return (
    <div className="staff-appointments-page">
      <header className="staff-appointments-topbar">
        <h1>Quản lý lịch hẹn</h1>

        <div className="staff-appointments-topbar-actions">
          <div className="staff-appointments-global-search">
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm nhanh..." />
          </div>

          <button type="button" className="staff-appointments-bell-btn">
            <Bell size={18} />
            <span></span>
          </button>

          <div className="staff-appointments-user-divider"></div>

          <div className="staff-appointments-user-info">
            <div className="staff-appointments-avatar">
              <UserRound size={18} />
            </div>

            <div>
              <strong>Lễ tân 01</strong>
              <p>Ca sáng</p>
            </div>
          </div>
        </div>
      </header>

      <section className="staff-appointments-content">
        <div className="staff-appointments-card">
          <div className="staff-appointments-toolbar">
            <div className="staff-appointments-toolbar-left">
              <div className="staff-appointments-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã lịch hẹn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="staff-appointments-filter-box">
                <Filter size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-appointments-date-group">
                <button
                  type="button"
                  className="staff-appointments-today-btn"
                  onClick={handleGoToday}
                >
                  Hôm nay
                </button>

                <div className="staff-appointments-date-navigator">
                  <button
                    type="button"
                    className="staff-appointments-date-nav-btn"
                    onClick={handlePrevDate}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="staff-appointments-date-display">
                    {formatDisplayDate(selectedDate)}
                  </div>

                  <button
                    type="button"
                    className="staff-appointments-date-nav-btn"
                    onClick={handleNextDate}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="staff-appointments-create-btn"
              onClick={handleCreateAppointment}
            >
              <Plus size={18} />
              <span>Tạo lịch hẹn</span>
            </button>
          </div>

          <div className="staff-appointments-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã LH</th>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Ngày hẹn</th>
                  <th>Giờ hẹn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="staff-appointments-empty">
                      Hiện chưa có lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="staff-appointments-row"
                      onClick={() => handleViewDetail(appointment)}
                      title="Nhấn để xem chi tiết lịch hẹn"
                    >
                      <td className="staff-appointments-id">
                        {appointment.id}
                      </td>

                      <td>
                        <strong>{appointment.customer}</strong>
                        <p>{appointment.phone}</p>
                      </td>

                      <td>
                        <div
                          className="staff-appointments-service"
                          title={appointment.services
                            .map((service) => service.name)
                            .join(", ")}
                        >
                          {getServiceNamesText(appointment.services)}
                        </div>
                      </td>

                      <td>{appointment.date}</td>

                      <td>{appointment.time}</td>

                      <td>
                        <span
                          className={`staff-appointments-status ${getStatusClass(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
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

export default StaffAppointments;
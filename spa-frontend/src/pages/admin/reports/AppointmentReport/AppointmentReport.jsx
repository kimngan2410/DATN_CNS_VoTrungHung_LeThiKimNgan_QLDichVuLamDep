import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  Search,
  Filter,
  ClipboardList,
  CircleCheckBig,
  AlertTriangle,
  Percent,
  RotateCcw,
  Eye,
  X,
} from "lucide-react";
import "./AppointmentReport.css";

const appointmentRows = [
  {
    id: 1,
    maLH: "LH001",
    customer: "Nguyễn Thị Hoa",
    phone: "0901234567",
    services: ["Chăm sóc da mặt", "Gội đầu dưỡng sinh"],
    thoiGianBatDau: "2026-05-01T09:30:00",
    thoiGianKetThuc: "2026-05-01T11:00:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 2,
    maLH: "LH002",
    customer: "Trần Văn Nam",
    phone: "0912345678",
    services: ["Massage body"],
    thoiGianBatDau: "2026-05-01T10:15:00",
    thoiGianKetThuc: "2026-05-01T11:45:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 3,
    maLH: "LH003",
    customer: "Lê Mai Anh",
    phone: "0923456789",
    services: ["Điều trị mụn chuyên sâu"],
    thoiGianBatDau: "2026-05-02T14:20:00",
    thoiGianKetThuc: "2026-05-02T15:50:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 4,
    maLH: "LH004",
    customer: "Phạm Thu Thủy",
    phone: "0934567890",
    services: ["Tắm trắng phi thuyền", "Massage body"],
    thoiGianBatDau: "2026-05-03T11:00:00",
    thoiGianKetThuc: "2026-05-03T13:30:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 5,
    maLH: "LH005",
    customer: "Hoàng Minh Tuấn",
    phone: "0945678901",
    services: ["Massage cổ vai gáy"],
    thoiGianBatDau: "2026-05-04T15:30:00",
    thoiGianKetThuc: "2026-05-04T16:00:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 6,
    maLH: "LH006",
    customer: "Đỗ Khánh Linh",
    phone: "0956789012",
    services: ["Gội đầu dưỡng sinh"],
    thoiGianBatDau: "2026-05-05T16:10:00",
    thoiGianKetThuc: "2026-05-05T17:00:00",
    trangThai: "Đã hoàn thành",
    lyDoHuy: "",
  },
  {
    id: 7,
    maLH: "LH007",
    customer: "Võ Ngọc Anh",
    phone: "0967890123",
    services: ["Chăm sóc da mặt chuyên sâu"],
    thoiGianBatDau: "2026-05-06T13:45:00",
    thoiGianKetThuc: "2026-05-06T15:15:00",
    trangThai: "Đang thực hiện",
    lyDoHuy: "",
  },
  {
    id: 8,
    maLH: "LH008",
    customer: "Bùi Thanh Hà",
    phone: "0978901234",
    services: ["Tắm trắng phi thuyền"],
    thoiGianBatDau: "2026-05-06T17:10:00",
    thoiGianKetThuc: "2026-05-06T18:40:00",
    trangThai: "Đã huỷ",
    lyDoHuy: "Khách huỷ lịch trước thời gian hẹn.",
  },
  {
    id: 9,
    maLH: "LH009",
    customer: "Mai Phương",
    phone: "0989012345",
    services: ["Chăm sóc da mặt", "Đắp mặt nạ collagen"],
    thoiGianBatDau: "2026-05-07T09:40:00",
    thoiGianKetThuc: "2026-05-07T11:00:00",
    trangThai: "Đã xác nhận",
    lyDoHuy: "",
  },
  {
    id: 10,
    maLH: "LH010",
    customer: "Lê Quang Minh",
    phone: "0909988776",
    services: ["Massage body"],
    thoiGianBatDau: "2026-05-07T15:00:00",
    thoiGianKetThuc: "2026-05-07T16:30:00",
    trangThai: "Không đến",
    lyDoHuy: "Khách không đến theo lịch hẹn.",
  },
  {
    id: 11,
    maLH: "LH011",
    customer: "Nguyễn Hà Vy",
    phone: "0908877665",
    services: ["Gội đầu dưỡng sinh"],
    thoiGianBatDau: "2026-05-08T10:00:00",
    thoiGianKetThuc: "2026-05-08T10:50:00",
    trangThai: "Chờ xác nhận",
    lyDoHuy: "",
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

const formatDateTime = (dateValue) => {
  const date = new Date(dateValue);

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  if (status === "Đã hoàn thành") return "completed";
  if (status === "Đã huỷ") return "cancelled";
  if (status === "Không đến") return "no-show";
  if (status === "Đang thực hiện") return "processing";
  if (status === "Đã xác nhận" || status === "Đã check-in") return "confirmed";

  return "waiting";
};

function AppointmentReport() {
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-08");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const filteredAppointments = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();
    const from = new Date(fromDate);
    const to = new Date(toDate);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    return appointmentRows.filter((appointment) => {
      const appointmentDate = new Date(appointment.thoiGianBatDau);
      const serviceText = appointment.services.join(" ").toLowerCase();

      const matchesDate = appointmentDate >= from && appointmentDate <= to;

      const matchesKeyword =
        keywordText === "" ||
        appointment.maLH.toLowerCase().includes(keywordText) ||
        appointment.customer.toLowerCase().includes(keywordText) ||
        appointment.phone.includes(keywordText) ||
        serviceText.includes(keywordText);

      const matchesStatus =
        statusFilter === "Tất cả" || appointment.trangThai === statusFilter;

      return matchesDate && matchesKeyword && matchesStatus;
    });
  }, [fromDate, toDate, keyword, statusFilter]);

  const summary = useMemo(() => {
    const totalAppointments = filteredAppointments.length;

    const completedCount = filteredAppointments.filter(
      (item) => item.trangThai === "Đã hoàn thành"
    ).length;

    const cancelledCount = filteredAppointments.filter(
      (item) => item.trangThai === "Đã huỷ"
    ).length;

    const noShowCount = filteredAppointments.filter(
      (item) => item.trangThai === "Không đến"
    ).length;

    const completionRate =
      totalAppointments > 0
        ? Math.round((completedCount / totalAppointments) * 100)
        : 0;

    return {
      totalAppointments,
      completedCount,
      cancelledCount,
      noShowCount,
      completionRate,
    };
  }, [filteredAppointments]);

  const handleResetFilter = () => {
    setFromDate("2026-05-01");
    setToDate("2026-05-08");
    setKeyword("");
    setStatusFilter("Tất cả");
  };

  const handleExportReport = () => {
    const lines = [
      ["Báo cáo lịch hẹn"],
      ["Từ ngày", fromDate],
      ["Đến ngày", toDate],
      ["Trạng thái", statusFilter],
      [],
      [
        "Mã lịch hẹn",
        "Khách hàng",
        "Số điện thoại",
        "Dịch vụ",
        "Thời gian bắt đầu",
        "Thời gian kết thúc",
        "Trạng thái",
        "Lý do huỷ/không đến",
      ],
      ...filteredAppointments.map((item) => [
        item.maLH,
        item.customer,
        item.phone,
        item.services.join(" | "),
        formatDateTime(item.thoiGianBatDau),
        formatDateTime(item.thoiGianKetThuc),
        item.trangThai,
        item.lyDoHuy || "",
      ]),
      [],
      ["Tổng lịch hẹn", summary.totalAppointments],
      ["Đã hoàn thành", summary.completedCount],
      ["Đã huỷ", summary.cancelledCount],
      ["Không đến", summary.noShowCount],
      ["Tỷ lệ hoàn thành", `${summary.completionRate}%`],
    ];

    const csv = "\uFEFF" + lines.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-lich-hen.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="appointment-report-page">
      <section className="appointment-report-filter-card">
        <div className="appointment-report-filter-left">
          <div className="appointment-report-filter-item">
            <CalendarDays size={17} />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <span className="appointment-report-date-separator">-</span>

          <div className="appointment-report-filter-item">
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="appointment-report-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Tìm mã lịch, khách hàng, SĐT, dịch vụ..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <div className="appointment-report-filter-item">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="appointment-report-actions">
          <button
            type="button"
            className="appointment-report-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>

          <button
            type="button"
            className="appointment-report-export-btn"
            onClick={handleExportReport}
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      <section className="appointment-report-summary-grid">
        <div className="appointment-report-summary-card">
          <div className="appointment-report-summary-icon">
            <ClipboardList size={22} />
          </div>

          <p>Tổng lịch hẹn</p>
          <h2>{summary.totalAppointments}</h2>
          <span>Lịch hẹn phù hợp với bộ lọc</span>
        </div>

        <div className="appointment-report-summary-card">
          <div className="appointment-report-summary-icon">
            <CircleCheckBig size={22} />
          </div>

          <p>Đã hoàn thành</p>
          <h2>{summary.completedCount}</h2>
          <span>Lịch đã hoàn tất dịch vụ</span>
        </div>

        <div className="appointment-report-summary-card">
          <div className="appointment-report-summary-icon">
            <AlertTriangle size={22} />
          </div>

          <p>Huỷ / Không đến</p>
          <h2>{summary.cancelledCount + summary.noShowCount}</h2>
          <span>
            {summary.cancelledCount} huỷ · {summary.noShowCount} không đến
          </span>
        </div>

        <div className="appointment-report-summary-card">
          <div className="appointment-report-summary-icon">
            <Percent size={22} />
          </div>

          <p>Tỷ lệ hoàn thành</p>
          <h2>{summary.completionRate}%</h2>
          <span>Tính trên tổng lịch hẹn</span>
        </div>
      </section>

      <section className="appointment-report-table-card">
        <div className="appointment-report-table-header">
          <div>
            <h3>Bảng báo cáo lịch hẹn</h3>
            <p>
              Hiển thị <strong>{filteredAppointments.length}</strong> lịch hẹn
            </p>
          </div>

          <div className="appointment-report-table-total">
            Hoàn thành: <strong>{summary.completedCount}</strong> /{" "}
            {summary.totalAppointments}
          </div>
        </div>

        <div className="appointment-report-table-wrapper">
          <table className="appointment-report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã LH</th>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Thời gian hẹn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment, index) => (
                  <tr key={appointment.id}>
                    <td>{index + 1}</td>

                    <td className="appointment-report-code">
                      {appointment.maLH}
                    </td>

                    <td>
                      <strong className="appointment-report-name">{appointment.customer}</strong>
                      <p>{appointment.phone}</p>
                    </td>

                    <td>
                      <div className="appointment-report-service-list">
                        {appointment.services.map((service) => (
                          <span key={service}>{service}</span>
                        ))}
                      </div>
                    </td>

                    <td>{formatDateTime(appointment.thoiGianBatDau)}</td>

                    <td>
                      <span
                        className={`appointment-report-status ${getStatusClass(
                          appointment.trangThai
                        )}`}
                      >
                        {appointment.trangThai}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="appointment-report-view-btn"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="appointment-report-empty">
                      Chưa có lịch hẹn phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="3">Tổng cộng</td>
                <td>{summary.totalAppointments} lịch hẹn</td>
                <td>{summary.completedCount} hoàn thành</td>
                <td>
                  {summary.cancelledCount} huỷ · {summary.noShowCount} không đến
                </td>
                <td>{summary.completionRate}% hoàn thành</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {selectedAppointment && (
        <div
          className="appointment-report-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="appointment-report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-report-modal-header">
              <div>
                <h3>Chi tiết lịch hẹn {selectedAppointment.maLH}</h3>
                <p>{selectedAppointment.customer}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="appointment-report-modal-grid">
              <div>
                <span>Khách hàng</span>
                <strong>{selectedAppointment.customer}</strong>
                <p>{selectedAppointment.phone}</p>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{selectedAppointment.trangThai}</strong>
              </div>

              <div>
                <span>Bắt đầu</span>
                <strong>{formatDateTime(selectedAppointment.thoiGianBatDau)}</strong>
              </div>

              <div>
                <span>Kết thúc</span>
                <strong>{formatDateTime(selectedAppointment.thoiGianKetThuc)}</strong>
              </div>
            </div>

            <div className="appointment-report-modal-section">
              <h4>Dịch vụ trong lịch hẹn</h4>

              <div className="appointment-report-modal-service-list">
                {selectedAppointment.services.map((service) => (
                  <span key={service}>{service}</span>
                ))}
              </div>
            </div>

            {selectedAppointment.lyDoHuy && (
              <div className="appointment-report-cancel-reason">
                <h4>Lý do huỷ / không đến</h4>
                <p>{selectedAppointment.lyDoHuy}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentReport;
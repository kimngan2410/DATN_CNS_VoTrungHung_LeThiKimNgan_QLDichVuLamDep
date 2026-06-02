import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRound,
  Filter,
  X,
  Phone,
  Mail,
  CalendarDays,
  User,
  Clock3,
  ClipboardList,
  Wallet,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";

import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader";
import { getStaffCustomersApi } from "../../../services/staffCustomerApi";

import "./StaffCustomersList.css";

const statusOptions = ["Tất cả", "Đang hoạt động", "Tạm khoá"];
const genderOptions = ["Tất cả", "Nam", "Nữ", "Khác", "Chưa cập nhật"];
const customerTypeOptions = ["Tất cả", "VIP", "Thường"];
const HISTORY_PREVIEW_LIMIT = 5;

const currentYear = new Date().getFullYear();
const startYear = 2015;

const createdYearOptions = [
  "Tất cả",
  ...Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => String(currentYear - index)
  ),
];

const createdMonthOptions = [
  { label: "Tất cả tháng", value: "Tất cả" },
  { label: "Tháng 01", value: "01" },
  { label: "Tháng 02", value: "02" },
  { label: "Tháng 03", value: "03" },
  { label: "Tháng 04", value: "04" },
  { label: "Tháng 05", value: "05" },
  { label: "Tháng 06", value: "06" },
  { label: "Tháng 07", value: "07" },
  { label: "Tháng 08", value: "08" },
  { label: "Tháng 09", value: "09" },
  { label: "Tháng 10", value: "10" },
  { label: "Tháng 11", value: "11" },
  { label: "Tháng 12", value: "12" },
];

const formatMoney = (value) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
};

const getCreatedAtTimestamp = (customer) => {
  const createdAt = customer?.createdAt;

  if (!createdAt || createdAt === "Chưa cập nhật") return 0;

  if (createdAt.includes("/")) {
    const [day, month, year] = createdAt.split("/");
    return new Date(`${year}-${month}-${day}`).getTime();
  }

  if (createdAt.includes("-")) {
    return new Date(createdAt).getTime();
  }

  return 0;
};

const getCustomerSortNumber = (customer) => {
  const code = String(customer?.id || customer?.maKH || "");
  const numberText = code.replace(/\D/g, "");

  return Number(numberText || customer?.idKhachHang || 0);
};

const getCustomerStatusClass = (status) => {
  switch (status) {
    case "Đang hoạt động":
      return "active";
    case "Tạm khoá":
      return "locked";
    default:
      return "";
  }
};

const getCustomerTypeClass = (loaiKH) => {
  switch (loaiKH) {
    case "VIP":
      return "vip";
    case "Thường":
      return "normal";
    default:
      return "";
  }
};

const getAppointmentStatusClass = (status) => {
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

function StaffCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [genderFilter, setGenderFilter] = useState("Tất cả");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("Tất cả");
  const [createdYearFilter, setCreatedYearFilter] = useState("Tất cả");
  const [createdMonthFilter, setCreatedMonthFilter] = useState("Tất cả");
  const [sortOption, setSortOption] = useState("default");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        setCustomerError("");

        const data = await getStaffCustomersApi();

        setCustomers(data);
      } catch (error) {
        setCustomerError(
          error.message || "Không thể tải danh sách khách hàng."
        );
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter((customer) => {
      const keyword = searchTerm.trim().toLowerCase();

      const customerId = String(customer.id || "").toLowerCase();
      const fullName = String(customer.fullName || "").toLowerCase();
      const phone = String(customer.phone || "");
      const email = String(customer.email || "").toLowerCase();

      const matchesKeyword =
        keyword === "" ||
        customerId.includes(keyword) ||
        fullName.includes(keyword) ||
        phone.includes(keyword) ||
        email.includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" || customer.status === statusFilter;

      const matchesGender =
        genderFilter === "Tất cả" || customer.gender === genderFilter;

      const matchesCustomerType =
        customerTypeFilter === "Tất cả" ||
        customer.loaiKH === customerTypeFilter;

      const createdAt = String(customer.createdAt || "");
      const createdYear = createdAt.slice(0, 4);
      const createdMonth = createdAt.slice(5, 7);

      const matchesCreatedYear =
        createdYearFilter === "Tất cả" || createdYear === createdYearFilter;

      const matchesCreatedMonth =
        createdMonthFilter === "Tất cả" || createdMonth === createdMonthFilter;

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesGender &&
        matchesCustomerType &&
        matchesCreatedYear &&
        matchesCreatedMonth
      );
    });

    if (sortOption === "default") {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const codeA = getCustomerSortNumber(a);
      const codeB = getCustomerSortNumber(b);

      const nameA = (a.fullName || "").toLowerCase();
      const nameB = (b.fullName || "").toLowerCase();

      const createdAtA = getCreatedAtTimestamp(a);
      const createdAtB = getCreatedAtTimestamp(b);

      if (sortOption === "code-desc") return codeB - codeA;
      if (sortOption === "code-asc") return codeA - codeB;

      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB, "vi");
      }

      if (sortOption === "name-desc") {
        return nameB.localeCompare(nameA, "vi");
      }

      if (sortOption === "created-desc") return createdAtB - createdAtA;
      if (sortOption === "created-asc") return createdAtA - createdAtB;

      return 0;
    });
  }, [
    customers,
    searchTerm,
    statusFilter,
    genderFilter,
    customerTypeFilter,
    createdYearFilter,
    createdMonthFilter,
    sortOption,
  ]);

  const handleResetFilter = () => {
    setSearchTerm("");
    setStatusFilter("Tất cả");
    setGenderFilter("Tất cả");
    setCustomerTypeFilter("Tất cả");
    setCreatedYearFilter("Tất cả");
    setCreatedMonthFilter("Tất cả");
    setSortOption("default");
  };

  const handleCloseDetailModal = () => {
    setSelectedCustomer(null);
    setHistoryModal(null);
  };

  return (
    <div className="staff-customers-page">
      <StaffPageHeader title="Danh sách khách hàng" />

      <section className="staff-customers-content">
        <div className="staff-customers-card">
          <div className="staff-customers-toolbar">
            <div className="staff-customers-toolbar-left">
              <div className="staff-customers-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, mã KH..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <button
                type="button"
                className={
                  isFilterOpen
                    ? "staff-customers-filter-btn active"
                    : "staff-customers-filter-btn"
                }
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Filter size={18} />
                <span>Bộ lọc</span>
              </button>
            </div>

            <div className="staff-customers-sort">
              <label>
                <ArrowUpDown size={15} />
                Sắp xếp
              </label>

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="code-desc">Mã KH giảm dần</option>
                <option value="code-asc">Mã KH tăng dần</option>
                <option value="name-asc">Tên A - Z</option>
                <option value="name-desc">Tên Z - A</option>
                <option value="created-desc">Ngày tạo mới nhất</option>
                <option value="created-asc">Ngày tạo cũ nhất</option>
              </select>
            </div>
          </div>

          {isFilterOpen && (
            <div className="staff-customers-filter-panel">
              <div className="staff-customers-filter-item">
                <label>Trạng thái tài khoản</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-customers-filter-item">
                <label>Giới tính</label>
                <select
                  value={genderFilter}
                  onChange={(event) => setGenderFilter(event.target.value)}
                >
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-customers-filter-item">
                <label>Loại khách hàng</label>
                <select
                  value={customerTypeFilter}
                  onChange={(event) =>
                    setCustomerTypeFilter(event.target.value)
                  }
                >
                  {customerTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type === "Tất cả" ? "Tất cả loại KH" : type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-customers-filter-item">
                <label>Năm đăng ký</label>
                <select
                  value={createdYearFilter}
                  onChange={(event) => setCreatedYearFilter(event.target.value)}
                >
                  {createdYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year === "Tất cả" ? "Tất cả năm" : `Năm ${year}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staff-customers-filter-item">
                <label>Tháng đăng ký</label>
                <select
                  value={createdMonthFilter}
                  onChange={(event) =>
                    setCreatedMonthFilter(event.target.value)
                  }
                >
                  {createdMonthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="staff-customers-reset-filter-btn"
                onClick={handleResetFilter}
              >
                <RotateCcw size={16} />
                <span>Đặt lại</span>
              </button>
            </div>
          )}

          <div className="staff-customers-result-bar">
            <p>
              Hiển thị <strong>{filteredCustomers.length}</strong> khách hàng
            </p>
          </div>

          {isLoadingCustomers ? (
            <div className="staff-customers-empty">
              <UserRound size={34} />
              <h3>Đang tải khách hàng</h3>
              <p>Vui lòng chờ trong giây lát.</p>
            </div>
          ) : customerError ? (
            <div className="staff-customers-empty">
              <UserRound size={34} />
              <h3>Không thể tải dữ liệu</h3>
              <p>{customerError}</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="staff-customers-empty">
              <UserRound size={34} />
              <h3>Hiện chưa có khách hàng nào</h3>
              <p>Danh sách khách hàng sẽ hiển thị sau khi có dữ liệu.</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="staff-customers-empty">
              <Search size={34} />
              <h3>Không tìm thấy khách hàng phù hợp</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
            </div>
          ) : (
            <div className="staff-customers-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã KH</th>
                    <th>Họ tên</th>
                    <th>Số điện thoại</th>
                    <th>Email</th>
                    <th>Giới tính</th>
                    <th>Loại KH</th>
                    <th>Ngày sinh</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="staff-customers-row"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="staff-customers-id">{customer.id}</td>

                      <td>
                        <div className="staff-customers-name-cell">
                          <div className="staff-customers-name-avatar">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.fullName}
                                className="staff-customers-avatar-img"
                              />
                            ) : (
                              customer.avatarText
                            )}
                          </div>

                          <div>
                            <strong>{customer.fullName}</strong>
                            <span
                              className={`staff-customers-status ${getCustomerStatusClass(
                                customer.status
                              )}`}
                            >
                              {customer.status}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{customer.phone || "Chưa cập nhật"}</td>
                      <td>{customer.email || "Chưa cập nhật"}</td>
                      <td>{customer.gender || "Chưa cập nhật"}</td>

                      <td>
                        <span
                          className={`staff-customers-type-badge ${getCustomerTypeClass(
                            customer.loaiKH
                          )}`}
                        >
                          {customer.loaiKH}
                        </span>
                      </td>

                      <td>{customer.birthday || "Chưa cập nhật"}</td>
                      <td>{customer.createdAt || "Chưa cập nhật"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {selectedCustomer && (
        <div
          className="staff-customers-modal-overlay"
          onClick={handleCloseDetailModal}
        >
          <div
            className="staff-customers-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-customers-modal-header">
              <div className="staff-customers-detail-heading">
                <div className="staff-customers-detail-avatar">
                  {selectedCustomer.avatar ? (
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.fullName}
                      className="staff-customers-avatar-img"
                    />
                  ) : (
                    selectedCustomer.avatarText
                  )}
                </div>

                <div>
                  <h2>{selectedCustomer.fullName}</h2>
                  <p>{selectedCustomer.id}</p>
                </div>
              </div>

              <button
                type="button"
                className="staff-customers-close-btn"
                onClick={handleCloseDetailModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="staff-customers-modal-body">
              <div className="staff-customers-detail-summary">
                <div className="staff-customers-summary-item">
                  <div className="staff-customers-summary-icon">
                    <ClipboardList size={18} />
                  </div>

                  <div>
                    <p>Tổng lịch hẹn</p>
                    <strong>{selectedCustomer.totalAppointments}</strong>
                  </div>
                </div>

                <div className="staff-customers-summary-item">
                  <div className="staff-customers-summary-icon gold">
                    <Wallet size={18} />
                  </div>

                  <div>
                    <p>Tổng chi tiêu</p>
                    <strong>{formatMoney(selectedCustomer.totalSpent)}</strong>
                  </div>
                </div>

                <div className="staff-customers-summary-item">
                  <div className="staff-customers-summary-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p>Lần gần nhất</p>
                    <strong>{selectedCustomer.lastVisit}</strong>
                  </div>
                </div>
              </div>

              <div className="staff-customers-info-grid">
                <div className="staff-customers-info-item">
                  <Phone size={17} />
                  <div>
                    <p>Số điện thoại</p>
                    <strong>
                      {selectedCustomer.phone || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="staff-customers-info-item">
                  <Mail size={17} />
                  <div>
                    <p>Email</p>
                    <strong>
                      {selectedCustomer.email || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="staff-customers-info-item">
                  <User size={17} />
                  <div>
                    <p>Giới tính</p>
                    <strong>
                      {selectedCustomer.gender || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="staff-customers-info-item">
                  <UserRound size={17} />
                  <div>
                    <p>Loại khách hàng</p>
                    <strong>
                      <span
                        className={`staff-customers-type-badge ${getCustomerTypeClass(
                          selectedCustomer.loaiKH
                        )}`}
                      >
                        {selectedCustomer.loaiKH}
                      </span>
                    </strong>
                  </div>
                </div>

                <div className="staff-customers-info-item">
                  <CalendarDays size={17} />
                  <div>
                    <p>Ngày sinh</p>
                    <strong>
                      {selectedCustomer.birthday || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="staff-customers-info-item">
                  <CalendarDays size={17} />
                  <div>
                    <p>Ngày tạo tài khoản</p>
                    <strong>
                      {selectedCustomer.createdAt || "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="staff-customers-history-grid">
                <div className="staff-customers-history-card">
                  <div className="staff-customers-history-card-header">
                    <h3>Lịch hẹn gần đây</h3>

                    {selectedCustomer.appointments?.length > HISTORY_PREVIEW_LIMIT && (
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryModal({
                            title: "Tất cả lịch hẹn",
                            type: "appointments",
                            data: selectedCustomer.appointments || [],
                          })
                        }
                      >
                        Xem tất cả
                      </button>
                    )}
                  </div>

                  <div className="staff-customers-history-list">
                    {selectedCustomer.appointments?.length > 0 ? (
                      selectedCustomer.appointments
                        .slice(0, HISTORY_PREVIEW_LIMIT)
                        .map((appointment) => (
                          <div className="staff-customers-history-item" key={appointment.id}>
                            <div>
                              <strong>{appointment.id}</strong>
                              <p>{appointment.services || "Dịch vụ"}</p>
                            </div>

                            <div className="staff-customers-history-meta">
                              <span>
                                {appointment.date} · {appointment.time}
                              </span>

                              <em
                                className={`staff-customers-appointment-status ${getAppointmentStatusClass(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </em>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="staff-customers-empty-history">
                        Chưa có lịch hẹn nào.
                      </p>
                    )}
                  </div>
                </div>

                <div className="staff-customers-history-card">
                  <div className="staff-customers-history-card-header">
                    <h3>Lịch sử sử dụng dịch vụ</h3>

                    {selectedCustomer.serviceHistory?.length > HISTORY_PREVIEW_LIMIT && (
                      <button
                        type="button"
                        onClick={() =>
                          setHistoryModal({
                            title: "Tất cả dịch vụ đã sử dụng",
                            type: "services",
                            data: selectedCustomer.serviceHistory || [],
                          })
                        }
                      >
                        Xem tất cả
                      </button>
                    )}
                  </div>

                  <div className="staff-customers-history-list">
                    {selectedCustomer.serviceHistory?.length > 0 ? (
                      selectedCustomer.serviceHistory
                        .slice(0, HISTORY_PREVIEW_LIMIT)
                        .map((service) => (
                          <div className="staff-customers-history-item" key={service.id}>
                            <div>
                              <strong>{service.serviceName}</strong>
                              <p>{service.date}</p>
                            </div>

                            <div className="staff-customers-history-meta right">
                              <span>{formatMoney(service.amount)}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="staff-customers-empty-history">
                        Chưa có lịch sử sử dụng dịch vụ.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="staff-customers-modal-footer">
              <button
                type="button"
                className="staff-customers-secondary-btn"
                onClick={handleCloseDetailModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && historyModal && (
        <div
          className="staff-customers-history-modal-overlay"
          onClick={() => setHistoryModal(null)}
        >
          <div
            className="staff-customers-history-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-customers-history-modal-header">
              <div>
                <h2>{historyModal.title}</h2>
                <p>{selectedCustomer.fullName}</p>
              </div>

              <button
                type="button"
                className="staff-customers-close-btn"
                onClick={() => setHistoryModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="staff-customers-history-modal-list">
              {historyModal.data.length > 0 ? (
                historyModal.data.map((item) => (
                  <div className="staff-customers-history-modal-item" key={item.id}>
                    {historyModal.type === "appointments" ? (
                      <>
                        <div>
                          <strong>{item.id}</strong>
                          <p>{item.services || "Dịch vụ"}</p>
                        </div>

                        <div className="staff-customers-history-meta">
                          <span>
                            {item.date} · {item.time}
                          </span>

                          <em
                            className={`staff-customers-appointment-status ${getAppointmentStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </em>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <strong>{item.serviceName}</strong>
                          <p>{item.date}</p>
                        </div>

                        <div className="staff-customers-history-meta right">
                          <span>{formatMoney(item.amount)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="staff-customers-history-modal-item">
                  <div>
                    <strong>Chưa có dữ liệu</strong>
                    <p>Không có dữ liệu để hiển thị.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffCustomers;
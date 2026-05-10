import React, { useMemo, useState } from "react"
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  Briefcase,
  CalendarDays,
  UserRound,
  VenusAndMars,
  Image as ImageIcon,
  Upload,
} from "lucide-react"
import "./AdminEmployeeList.css"

const SPA_OPENING_YEAR = 2020

const roleOptions = ["Lễ tân", "Kỹ thuật viên", "Quản lý", "Khác"]
const genderOptions = ["Nam", "Nữ", "Khác"]
const statusOptions = ["Đang làm việc", "Ngừng làm việc"]

const monthOptions = [
  { value: "Tất cả", label: "Tất cả" },
  { value: "01", label: "Tháng 1" },
  { value: "02", label: "Tháng 2" },
  { value: "03", label: "Tháng 3" },
  { value: "04", label: "Tháng 4" },
  { value: "05", label: "Tháng 5" },
  { value: "06", label: "Tháng 6" },
  { value: "07", label: "Tháng 7" },
  { value: "08", label: "Tháng 8" },
  { value: "09", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
]

const getCurrentYear = () => {
  return new Date().getFullYear()
}

const yearOptions = Array.from(
  { length: getCurrentYear() - SPA_OPENING_YEAR + 1 },
  (_, index) => String(getCurrentYear() - index)
)

const getDateParts = (dateValue) => {
  if (!dateValue) {
    return {
      month: "",
      year: "",
    }
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return {
      month: "",
      year: "",
    }
  }

  return {
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  }
}

const initialEmployees = [
  {
    idNhanVien: 1,
    idTaiKhoan: 101,
    maNV: "NV001",
    hoTen: "Trần Thị Bích",
    email: "bich.tran@spa.com",
    sdt: "0911223344",
    chucVu: "Lễ tân",
    gioiTinh: "Nữ",
    ngaySinh: "1998-04-12",
    anhDaiDien: "",
    ngayVaoLam: "2022-06-01",
    trangThaiLamViec: "Đang làm việc",
    ngayTao: "2022-06-01T08:30:00",
  },
  {
    idNhanVien: 2,
    idTaiKhoan: 102,
    maNV: "NV002",
    hoTen: "Lê Văn Cường",
    email: "cuong.le@spa.com",
    sdt: "0922334455",
    chucVu: "Kỹ thuật viên",
    gioiTinh: "Nam",
    ngaySinh: "1996-09-20",
    anhDaiDien: "",
    ngayVaoLam: "2022-08-15",
    trangThaiLamViec: "Đang làm việc",
    ngayTao: "2022-08-15T09:00:00",
  },
  {
    idNhanVien: 3,
    idTaiKhoan: 103,
    maNV: "NV003",
    hoTen: "Nguyễn Thu Hà",
    email: "ha.nguyen@spa.com",
    sdt: "0933445566",
    chucVu: "Kỹ thuật viên",
    gioiTinh: "Nữ",
    ngaySinh: "1999-01-18",
    anhDaiDien: "",
    ngayVaoLam: "2023-01-10",
    trangThaiLamViec: "Đang làm việc",
    ngayTao: "2023-01-10T10:15:00",
  },
  {
    idNhanVien: 4,
    idTaiKhoan: 104,
    maNV: "NV004",
    hoTen: "Phạm Minh Đạt",
    email: "dat.pham@spa.com",
    sdt: "0944556677",
    chucVu: "Quản lý",
    gioiTinh: "Nam",
    ngaySinh: "1992-05-08",
    anhDaiDien: "",
    ngayVaoLam: "2021-01-01",
    trangThaiLamViec: "Đang làm việc",
    ngayTao: "2021-01-01T08:00:00",
  },
  {
    idNhanVien: 5,
    idTaiKhoan: 105,
    maNV: "NV005",
    hoTen: "Hoàng Thị Yến",
    email: "yen.hoang@spa.com",
    sdt: "0955667788",
    chucVu: "Kỹ thuật viên",
    gioiTinh: "Nữ",
    ngaySinh: "1997-11-25",
    anhDaiDien: "",
    ngayVaoLam: "2023-03-20",
    trangThaiLamViec: "Ngừng làm việc",
    ngayTao: "2023-03-20T08:45:00",
  },
]

const emptyForm = {
  hoTen: "",
  email: "",
  sdt: "",
  chucVu: "Lễ tân",
  gioiTinh: "Nữ",
  ngaySinh: "",
  anhDaiDien: "",
  ngayVaoLam: "",
  trangThaiLamViec: "Đang làm việc",
}

const formatDate = (dateValue) => {
  if (!dateValue) return "Chưa cập nhật"

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return dateValue

  return date.toLocaleDateString("vi-VN")
}

const getInitial = (name) => {
  if (!name) return "?"

  const words = name.trim().split(" ")
  return words[words.length - 1]?.charAt(0)?.toUpperCase() || "?"
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const createNextEmployeeId = (employees) => {
  return (
    employees.reduce((max, employee) => {
      return Math.max(max, employee.idNhanVien)
    }, 0) + 1
  )
}

const createNextAccountId = (employees) => {
  return (
    employees.reduce((max, employee) => {
      return Math.max(max, employee.idTaiKhoan)
    }, 100) + 1
  )
}

const createNextEmployeeCode = (employees) => {
  const maxNumber = employees.reduce((max, employee) => {
    const number = Number(employee.maNV.replace("NV", ""))
    return Number.isNaN(number) ? max : Math.max(max, number)
  }, 0)

  return `NV${String(maxNumber + 1).padStart(3, "0")}`
}

const getNowDateTime = () => {
  return new Date().toISOString()
}

function AdminEmployees() {
  const [employees, setEmployees] = useState(initialEmployees)

  const [searchText, setSearchText] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [genderFilter, setGenderFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [monthFilter, setMonthFilter] = useState("Tất cả")
  const [yearFilter, setYearFilter] = useState("Tất cả")

  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const filteredEmployees = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return employees.filter((employee) => {
      const matchKeyword =
        employee.maNV.toLowerCase().includes(keyword) ||
        employee.hoTen.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword) ||
        employee.sdt.toLowerCase().includes(keyword)

      const matchRole =
        roleFilter === "Tất cả" || employee.chucVu === roleFilter

      const matchGender =
        genderFilter === "Tất cả" || employee.gioiTinh === genderFilter

      const matchStatus =
        statusFilter === "Tất cả" ||
        employee.trangThaiLamViec === statusFilter

      const { month, year } = getDateParts(employee.ngayVaoLam)

      const matchMonth = monthFilter === "Tất cả" || month === monthFilter

      const matchYear = yearFilter === "Tất cả" || year === yearFilter

      return (
        matchKeyword &&
        matchRole &&
        matchGender &&
        matchStatus &&
        matchMonth &&
        matchYear
      )
    })
  }, [
    employees,
    searchText,
    roleFilter,
    genderFilter,
    statusFilter,
    monthFilter,
    yearFilter,
  ])

  const showSuccess = (message) => {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage("")
    }, 2200)
  }

  const handleChangeForm = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formError) setFormError("")
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setFormError("Vui lòng chọn đúng file hình ảnh.")
      event.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setFormError("Ảnh đại diện không được vượt quá 5MB.")
      event.target.value = ""
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setFormData((prev) => ({
      ...prev,
      anhDaiDien: imageUrl,
    }))

    setFormError("")
    event.target.value = ""
  }

  const handleResetFilter = () => {
    setSearchText("")
    setRoleFilter("Tất cả")
    setGenderFilter("Tất cả")
    setStatusFilter("Tất cả")
    setMonthFilter("Tất cả")
    setYearFilter("Tất cả")
  }

  const handleOpenCreateForm = () => {
    setEditingEmployee(null)
    setFormData({ ...emptyForm })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      hoTen: employee.hoTen,
      email: employee.email,
      sdt: employee.sdt,
      chucVu: employee.chucVu,
      gioiTinh: employee.gioiTinh,
      ngaySinh: employee.ngaySinh,
      anhDaiDien: employee.anhDaiDien || "",
      ngayVaoLam: employee.ngayVaoLam,
      trangThaiLamViec: employee.trangThaiLamViec,
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingEmployee(null)
    setFormError("")
  }

  const handleSaveEmployee = () => {
    const trimmedName = formData.hoTen.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.sdt.trim()
    const trimmedAvatar = formData.anhDaiDien.trim()

    if (!trimmedName) {
      setFormError("Vui lòng nhập họ tên nhân viên.")
      return
    }

    if (!trimmedPhone) {
      setFormError("Vui lòng nhập số điện thoại nhân viên.")
      return
    }

    if (!/^[0-9]{9,11}$/.test(trimmedPhone)) {
      setFormError("Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 số.")
      return
    }

    if (!trimmedEmail) {
      setFormError("Vui lòng nhập email tài khoản của nhân viên.")
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError("Email không đúng định dạng.")
      return
    }

    if (!formData.ngaySinh) {
      setFormError("Vui lòng chọn ngày sinh.")
      return
    }

    if (!formData.ngayVaoLam) {
      setFormError("Vui lòng chọn ngày vào làm.")
      return
    }

    const isDuplicateEmail = employees.some((employee) => {
      const sameEmail =
        employee.email.trim().toLowerCase() === trimmedEmail.toLowerCase()

      return editingEmployee
        ? sameEmail && employee.idNhanVien !== editingEmployee.idNhanVien
        : sameEmail
    })

    if (isDuplicateEmail) {
      setFormError("Email đã tồn tại trong hệ thống. Vui lòng nhập email khác.")
      return
    }

    const isDuplicatePhone = employees.some((employee) => {
      const samePhone = employee.sdt.trim() === trimmedPhone

      return editingEmployee
        ? samePhone && employee.idNhanVien !== editingEmployee.idNhanVien
        : samePhone
    })

    if (isDuplicatePhone) {
      setFormError("Số điện thoại đã tồn tại trong hệ thống.")
      return
    }

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.idNhanVien === editingEmployee.idNhanVien
            ? {
                ...employee,
                hoTen: trimmedName,
                email: trimmedEmail,
                sdt: trimmedPhone,
                chucVu: formData.chucVu,
                gioiTinh: formData.gioiTinh,
                ngaySinh: formData.ngaySinh,
                anhDaiDien: trimmedAvatar,
                ngayVaoLam: formData.ngayVaoLam,
                trangThaiLamViec: formData.trangThaiLamViec,
              }
            : employee
        )
      )

      showSuccess("Cập nhật nhân viên thành công.")
    } else {
      const newEmployee = {
        idNhanVien: createNextEmployeeId(employees),
        idTaiKhoan: createNextAccountId(employees),
        maNV: createNextEmployeeCode(employees),
        hoTen: trimmedName,
        email: trimmedEmail,
        sdt: trimmedPhone,
        chucVu: formData.chucVu,
        gioiTinh: formData.gioiTinh,
        ngaySinh: formData.ngaySinh,
        anhDaiDien: trimmedAvatar,
        ngayVaoLam: formData.ngayVaoLam,
        trangThaiLamViec: formData.trangThaiLamViec,
        ngayTao: getNowDateTime(),
      }

      setEmployees((prev) => [newEmployee, ...prev])
      showSuccess("Thêm nhân viên thành công.")
    }

    handleCloseForm()
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    setEmployees((prev) =>
      prev.filter((employee) => employee.idNhanVien !== deleteTarget.idNhanVien)
    )

    setDeleteTarget(null)
    showSuccess("Xoá nhân viên thành công.")
  }

  return (
    <div className="admin-employees-page">
      {successMessage && (
        <div className="admin-employee-success-toast">{successMessage}</div>
      )}

      <section className="admin-employees-toolbar">
        <div className="admin-employees-toolbar-left">
          <div className="admin-employees-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên, SĐT, email..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <button
            type="button"
            className={
              isFilterOpen
                ? "admin-employees-filter-btn active"
                : "admin-employees-filter-btn"
            }
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            <Filter size={18} strokeWidth={2.3} />
            Lọc
          </button>
        </div>

        <button
          type="button"
          className="admin-employee-primary-btn"
          onClick={handleOpenCreateForm}
        >
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </section>

      {isFilterOpen && (
        <section className="admin-employees-filter-panel">
          <div className="admin-employee-filter-group">
            <label>Chức vụ</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {roleOptions.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="admin-employee-filter-group">
            <label>Giới tính</label>
            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {genderOptions.map((gender) => (
                <option key={gender}>{gender}</option>
              ))}
            </select>
          </div>

          <div className="admin-employee-filter-group">
            <label>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="admin-employee-filter-group">
            <label>Tháng vào làm</label>
            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-employee-filter-group">
            <label>Năm vào làm</label>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option>Tất cả</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="admin-employee-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </section>
      )}

      <section className="admin-employees-card">
        <div className="admin-employees-result-bar">
          <div>
            <h3>Danh sách nhân viên</h3>
            <p>
              Hiển thị <strong>{filteredEmployees.length}</strong> nhân viên
            </p>
          </div>
        </div>

        <div className="admin-employees-table-wrapper">
          <table className="admin-employees-table">
            <colgroup>
              <col className="employee-col-code" />
              <col className="employee-col-info" />
              <col className="employee-col-phone" />
              <col className="employee-col-role" />
              <col className="employee-col-date" />
              <col className="employee-col-status" />
              <col className="employee-col-action" />
            </colgroup>

            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Nhân viên</th>
                <th>Số điện thoại</th>
                <th>Chức vụ</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.idNhanVien}>
                    <td className="admin-employee-code">{employee.maNV}</td>

                    <td>
                      <div className="admin-employee-info">
                        {employee.anhDaiDien ? (
                          <img
                            src={employee.anhDaiDien}
                            alt={employee.hoTen}
                            className="admin-employee-avatar-img"
                          />
                        ) : (
                          <div className="admin-employee-avatar">
                            {getInitial(employee.hoTen)}
                          </div>
                        )}

                        <div className="admin-employee-text">
                          <h4>{employee.hoTen}</h4>
                          <p>{employee.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>{employee.sdt}</td>
                    <td>{employee.chucVu}</td>
                    <td>{formatDate(employee.ngayVaoLam)}</td>

                    <td>
                      <span
                        className={
                          employee.trangThaiLamViec === "Đang làm việc"
                            ? "admin-employee-status active"
                            : "admin-employee-status inactive"
                        }
                      >
                        {employee.trangThaiLamViec}
                      </span>
                    </td>

                    <td>
                      <div className="admin-employee-actions">
                        <button
                          type="button"
                          className="admin-employee-action-btn view"
                          onClick={() => setSelectedEmployee(employee)}
                          title="Xem chi tiết"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-employee-action-btn edit"
                          onClick={() => handleOpenEditForm(employee)}
                          title="Chỉnh sửa"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-employee-action-btn delete"
                          onClick={() => setDeleteTarget(employee)}
                          title="Xoá"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="admin-employee-empty">
                      Chưa có nhân viên nào phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedEmployee && (
        <div
          className="admin-employee-modal-overlay"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="admin-employee-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-employee-modal-header">
              <div>
                <h2>Chi tiết nhân viên</h2>
                <p>{selectedEmployee.maNV}</p>
              </div>

              <button
                type="button"
                className="admin-employee-close-btn"
                onClick={() => setSelectedEmployee(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-employee-detail-body">
              <div className="admin-employee-profile-box">
                {selectedEmployee.anhDaiDien ? (
                  <img
                    src={selectedEmployee.anhDaiDien}
                    alt={selectedEmployee.hoTen}
                    className="admin-employee-profile-avatar-img"
                  />
                ) : (
                  <div className="admin-employee-profile-avatar">
                    {getInitial(selectedEmployee.hoTen)}
                  </div>
                )}

                <div>
                  <h3>{selectedEmployee.hoTen}</h3>
                  <p>{selectedEmployee.chucVu}</p>
                </div>

                <span
                  className={
                    selectedEmployee.trangThaiLamViec === "Đang làm việc"
                      ? "admin-employee-status active"
                      : "admin-employee-status inactive"
                  }
                >
                  {selectedEmployee.trangThaiLamViec}
                </span>
              </div>

              <div className="admin-employee-detail-grid">
                <div className="admin-employee-detail-item">
                  <UserRound size={18} />
                  <div>
                    <span>Mã nhân viên</span>
                    <strong>{selectedEmployee.maNV}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <UserRound size={18} />
                  <div>
                    <span>ID tài khoản</span>
                    <strong>{selectedEmployee.idTaiKhoan}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <Phone size={18} />
                  <div>
                    <span>Số điện thoại</span>
                    <strong>{selectedEmployee.sdt}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <Mail size={18} />
                  <div>
                    <span>Email tài khoản</span>
                    <strong>{selectedEmployee.email}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <Briefcase size={18} />
                  <div>
                    <span>Chức vụ</span>
                    <strong>{selectedEmployee.chucVu}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <VenusAndMars size={18} />
                  <div>
                    <span>Giới tính</span>
                    <strong>{selectedEmployee.gioiTinh}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <CalendarDays size={18} />
                  <div>
                    <span>Ngày sinh</span>
                    <strong>{formatDate(selectedEmployee.ngaySinh)}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <CalendarDays size={18} />
                  <div>
                    <span>Ngày vào làm</span>
                    <strong>{formatDate(selectedEmployee.ngayVaoLam)}</strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <ImageIcon size={18} />
                  <div>
                    <span>Ảnh đại diện</span>
                    <strong>
                      {selectedEmployee.anhDaiDien
                        ? "Đã cập nhật"
                        : "Chưa cập nhật"}
                    </strong>
                  </div>
                </div>

                <div className="admin-employee-detail-item">
                  <CalendarDays size={18} />
                  <div>
                    <span>Ngày tạo</span>
                    <strong>{formatDate(selectedEmployee.ngayTao)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-employee-modal-actions">
              <button
                type="button"
                className="admin-employee-cancel-btn"
                onClick={() => setSelectedEmployee(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="admin-employee-primary-btn"
                onClick={() => {
                  handleOpenEditForm(selectedEmployee)
                  setSelectedEmployee(null)
                }}
              >
                <Pencil size={17} />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="admin-employee-modal-overlay" onClick={handleCloseForm}>
          <div
            className="admin-employee-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-employee-modal-header">
              <div>
                <h2>
                  {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}
                </h2>
                <p>
                  {editingEmployee
                    ? "Cập nhật thông tin nhân viên"
                    : "Nhập thông tin nhân viên mới"}
                </p>
              </div>

              <button
                type="button"
                className="admin-employee-close-btn"
                onClick={handleCloseForm}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-employee-form-body">
              {formError && (
                <div className="admin-employee-form-error">
                  <AlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-employee-form-grid">
                <div className="admin-employee-form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên nhân viên"
                    value={formData.hoTen}
                    onChange={(event) =>
                      handleChangeForm("hoTen", event.target.value)
                    }
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={formData.sdt}
                    onChange={(event) =>
                      handleChangeForm("sdt", event.target.value)
                    }
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Email tài khoản</label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(event) =>
                      handleChangeForm("email", event.target.value)
                    }
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Chức vụ</label>
                  <select
                    value={formData.chucVu}
                    onChange={(event) =>
                      handleChangeForm("chucVu", event.target.value)
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-employee-form-group">
                  <label>Giới tính</label>
                  <select
                    value={formData.gioiTinh}
                    onChange={(event) =>
                      handleChangeForm("gioiTinh", event.target.value)
                    }
                  >
                    {genderOptions.map((gender) => (
                      <option key={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-employee-form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.ngaySinh}
                    onChange={(event) =>
                      handleChangeForm("ngaySinh", event.target.value)
                    }
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Ngày vào làm</label>
                  <input
                    type="date"
                    value={formData.ngayVaoLam}
                    onChange={(event) =>
                      handleChangeForm("ngayVaoLam", event.target.value)
                    }
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Trạng thái làm việc</label>
                  <select
                    value={formData.trangThaiLamViec}
                    onChange={(event) =>
                      handleChangeForm(
                        "trangThaiLamViec",
                        event.target.value
                      )
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-employee-form-group">
                <label>Ảnh đại diện</label>

                <div className="admin-employee-avatar-upload-row">
                  <input
                    type="text"
                    placeholder="Nhập link ảnh hoặc tải ảnh lên"
                    value={formData.anhDaiDien}
                    onChange={(event) =>
                      handleChangeForm("anhDaiDien", event.target.value)
                    }
                  />

                  <label className="admin-employee-upload-avatar-btn">
                    <Upload size={16} />
                    Tải ảnh
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                {formData.anhDaiDien && (
                  <div className="admin-employee-avatar-preview">
                    <img src={formData.anhDaiDien} alt="Ảnh đại diện" />
                    <span>Xem trước ảnh đại diện</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-employee-modal-actions">
              <button
                type="button"
                className="admin-employee-cancel-btn"
                onClick={handleCloseForm}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-employee-primary-btn"
                onClick={handleSaveEmployee}
              >
                <Save size={17} />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-employee-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="admin-employee-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-employee-delete-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Xác nhận xoá nhân viên</h2>

            <p>
              Bạn có chắc chắn muốn xoá nhân viên{" "}
              <strong>{deleteTarget.hoTen}</strong> không? Thao tác này không
              thể hoàn tác.
            </p>

            <div className="admin-employee-delete-actions">
              <button
                type="button"
                className="admin-employee-cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-employee-danger-btn"
                onClick={handleConfirmDelete}
              >
                Xoá nhân viên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEmployees
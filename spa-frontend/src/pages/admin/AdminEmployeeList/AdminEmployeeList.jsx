import React, { useEffect, useMemo, useRef, useState } from "react"
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
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
} from "lucide-react"

import {
  createAdminEmployeeApi,
  deleteAdminEmployeeApi,
  getAdminEmployeesApi,
  updateAdminEmployeeApi,
  uploadAdminEmployeeAvatarApi,
} from "../../../services/adminEmployeeApi"

import "./AdminEmployeeList.css"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

const getFullAvatarUrl = (avatar) => {
  if (!avatar) return ""

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("blob:") ||
    avatar.startsWith("data:")
  ) {
    return avatar
  }

  if (avatar.startsWith("/uploads")) {
    return `${API_ORIGIN}${avatar}`
  }

  return avatar
}

const SPA_OPENING_YEAR = 2020

const roleOptions = ["Lễ tân", "Kỹ thuật viên", "Quản lý", "Khác"]
const genderOptions = ["Nam", "Nữ", "Khác"]
const statusOptions = ["Đang làm", "Tạm nghỉ", "Đã nghỉ"]

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

const emptyForm = {
  hoTen: "",
  email: "",
  sdt: "",
  chucVu: "Lễ tân",
  gioiTinh: "Nữ",
  ngaySinh: "",
  anhDaiDien: "",
  ngayVaoLam: "",
  trangThaiLamViec: "Đang làm",
}

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

const getStatusClass = (status) => {
  if (status === "Đang làm") {
    return "admin-employee-status active"
  }

  if (status === "Tạm nghỉ") {
    return "admin-employee-status inactive"
  }

  if (status === "Đã nghỉ") {
    return "admin-employee-status inactive"
  }

  return "admin-employee-status inactive"
}

function AdminEmployees() {
  const [employees, setEmployees] = useState([])

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

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const toastTimeoutRef = useRef(null)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      setFormError("")

      const data = await getAdminEmployeesApi()

      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      setFormError(error.message || "Không thể tải danh sách nhân viên.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees()
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const filteredEmployees = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return employees.filter((employee) => {
      const maNV = employee.maNV || ""
      const hoTen = employee.hoTen || ""
      const email = employee.email || ""
      const sdt = employee.sdt || ""
      const chucVu = employee.chucVu || ""
      const gioiTinh = employee.gioiTinh || ""
      const trangThaiLamViec = employee.trangThaiLamViec || ""

      const matchKeyword =
        maNV.toLowerCase().includes(keyword) ||
        hoTen.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        sdt.toLowerCase().includes(keyword)

      const matchRole = roleFilter === "Tất cả" || chucVu === roleFilter

      const matchGender =
        genderFilter === "Tất cả" || gioiTinh === genderFilter

      const matchStatus =
        statusFilter === "Tất cả" || trangThaiLamViec === statusFilter

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

  const showToast = ({
    type = "success",
    title = "Thành công",
    message = "",
  }) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setToast({
      show: true,
      type,
      title,
      message,
    })

    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }))
    }, 3000)
  }

  const closeToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    setToast((prev) => ({
      ...prev,
      show: false,
    }))
  }

  const renderToastIcon = () => {
    if (toast.type === "success") {
      return <CheckCircle2 size={22} />
    }

    if (toast.type === "error") {
      return <XCircle size={22} />
    }

    if (toast.type === "warning") {
      return <AlertCircle size={22} />
    }

    return <Info size={22} />
  }

  const handleChangeForm = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formError) setFormError("")
  }

  const handleAvatarUpload = async (event) => {
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

    try {
      setIsSaving(true)
      setFormError("")

      const result = await uploadAdminEmployeeAvatarApi(file)

      setFormData((prev) => ({
        ...prev,
        anhDaiDien: result.url,
      }))

      showToast({
        type: "success",
        title: "Tải ảnh thành công",
        message: "Ảnh đại diện đã được tải lên hệ thống.",
      })
    } catch (error) {
      const message = error.message || "Không thể tải ảnh đại diện."

      setFormError(message)

      showToast({
        type: "error",
        title: "Tải ảnh thất bại",
        message,
      })
    } finally {
      setIsSaving(false)
      event.target.value = ""
    }
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
      hoTen: employee.hoTen || "",
      email: employee.email || "",
      sdt: employee.sdt || "",
      chucVu: employee.chucVu || "Lễ tân",
      gioiTinh: employee.gioiTinh || "Nữ",
      ngaySinh: employee.ngaySinh || "",
      anhDaiDien: employee.anhDaiDien || "",
      ngayVaoLam: employee.ngayVaoLam || "",
      trangThaiLamViec: employee.trangThaiLamViec || "Đang làm",
    })

    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    if (isSaving) return

    setIsFormOpen(false)
    setEditingEmployee(null)
    setFormError("")
    setFormData({ ...emptyForm })
  }

  const validateForm = () => {
    const trimmedName = formData.hoTen.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.sdt.trim()

    if (!trimmedName) {
      setFormError("Vui lòng nhập họ tên nhân viên.")
      return false
    }

    if (trimmedName.length < 2) {
      setFormError("Họ tên nhân viên phải có ít nhất 2 ký tự.")
      return false
    }

    if (!trimmedPhone) {
      setFormError("Vui lòng nhập số điện thoại nhân viên.")
      return false
    }

    if (!/^[0-9]{9,11}$/.test(trimmedPhone)) {
      setFormError("Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 số.")
      return false
    }

    if (!trimmedEmail) {
      setFormError("Vui lòng nhập email tài khoản của nhân viên.")
      return false
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError("Email không đúng định dạng.")
      return false
    }

    if (!formData.ngaySinh) {
      setFormError("Vui lòng chọn ngày sinh.")
      return false
    }

    if (!formData.ngayVaoLam) {
      setFormError("Vui lòng chọn ngày vào làm.")
      return false
    }

    const selectedBirthDate = new Date(formData.ngaySinh)
    const selectedStartDate = new Date(formData.ngayVaoLam)
    const today = new Date()

    if (
      !Number.isNaN(selectedBirthDate.getTime()) &&
      selectedBirthDate > today
    ) {
      setFormError("Ngày sinh không được lớn hơn ngày hiện tại.")
      return false
    }

    if (!Number.isNaN(selectedStartDate.getTime()) && selectedStartDate > today) {
      setFormError("Ngày vào làm không được lớn hơn ngày hiện tại.")
      return false
    }

    return true
  }

  const handleSaveEmployee = async () => {
    if (!validateForm()) return

    const trimmedName = formData.hoTen.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.sdt.trim()
    const trimmedAvatar = formData.anhDaiDien.trim()

    const payload = {
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

    try {
      setIsSaving(true)
      setFormError("")

      if (editingEmployee) {
        const result = await updateAdminEmployeeApi(
          editingEmployee.idNhanVien,
          payload
        )

        setEmployees((prev) =>
          prev.map((employee) =>
            employee.idNhanVien === editingEmployee.idNhanVien
              ? result.employee
              : employee
          )
        )

        if (
          selectedEmployee &&
          selectedEmployee.idNhanVien === editingEmployee.idNhanVien
        ) {
          setSelectedEmployee(result.employee)
        }

        showToast({
          type: "success",
          title: "Cập nhật thành công",
          message: result.message || "Thông tin nhân viên đã được cập nhật.",
        })
      } else {
        const result = await createAdminEmployeeApi(payload)

        setEmployees((prev) => [result.employee, ...prev])

        showToast({
          type: "success",
          title: "Thêm thành công",
          message: result.message || "Nhân viên mới đã được thêm vào hệ thống.",
        })
      }

      handleCloseForm()
    } catch (error) {
      const message = error.message || "Không thể lưu nhân viên."

      setFormError(message)

      showToast({
        type: "error",
        title: "Lưu thất bại",
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

    const handleConfirmDelete = async () => {
      if (!deleteTarget) return

      try {
        setIsDeleting(true)

        const result = await deleteAdminEmployeeApi(deleteTarget.idNhanVien)

        setEmployees((prev) =>
          prev.filter(
            (employee) => employee.idNhanVien !== deleteTarget.idNhanVien
          )
        )

        if (
          selectedEmployee &&
          selectedEmployee.idNhanVien === deleteTarget.idNhanVien
        ) {
          setSelectedEmployee(null)
        }

        setDeleteTarget(null)

        showToast({
          type: "success",
          title: "Xoá thành công",
          message: result.message || "Nhân viên đã được xoá khỏi danh sách.",
        })
      } catch (error) {
        const message = error.message || "Không thể xoá nhân viên."

        setFormError(message)
        setDeleteTarget(null)

        showToast({
          type: "error",
          title: "Xoá thất bại",
          message,
        })
      } finally {
        setIsDeleting(false)
      }
    }

  return (
    <div className="admin-employees-page">
      {toast.show && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <div className="admin-toast__icon">{renderToastIcon()}</div>

          <div className="admin-toast__content">
            <div className="admin-toast__title">{toast.title}</div>
            <div className="admin-toast__message">{toast.message}</div>
          </div>

          <button
            type="button"
            className="admin-toast__close"
            onClick={closeToast}
            aria-label="Đóng thông báo"
          >
            ×
          </button>

          <span className="admin-toast__progress" />
        </div>
      )}

      {formError && !isFormOpen && (
        <div className="admin-employee-form-error">
          <AlertTriangle size={17} />
          <span>{formError}</span>
        </div>
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
              {isLoading ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-employee-empty">
                      Đang tải danh sách nhân viên...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.idNhanVien}>
                    <td className="admin-employee-code">{employee.maNV}</td>

                    <td>
                      <div className="admin-employee-info">
                        {employee.anhDaiDien ? (
                          <img
                            src={getFullAvatarUrl(employee.anhDaiDien)}
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
                      <span className={getStatusClass(employee.trangThaiLamViec)}>
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
                    src={getFullAvatarUrl(selectedEmployee.anhDaiDien)}
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

                <span className={getStatusClass(selectedEmployee.trangThaiLamViec)}>
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
                disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
                  />
                </div>

                <div className="admin-employee-form-group">
                  <label>Chức vụ</label>
                  <select
                    value={formData.chucVu}
                    onChange={(event) =>
                      handleChangeForm("chucVu", event.target.value)
                    }
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
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
                    disabled={isSaving}
                  />

                  <label className="admin-employee-upload-avatar-btn">
                    <Upload size={16} />
                    Tải ảnh
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isSaving}
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
                disabled={isSaving}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-employee-primary-btn"
                onClick={handleSaveEmployee}
                disabled={isSaving}
              >
                <Save size={17} />
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-employee-modal-overlay"
          onClick={() => {
            if (!isDeleting) setDeleteTarget(null)
          }}
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
                disabled={isDeleting}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-employee-danger-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xoá..." : "Xoá nhân viên"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEmployees
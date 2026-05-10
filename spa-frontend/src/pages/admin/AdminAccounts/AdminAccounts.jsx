import React, { useMemo, useState } from "react"
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Lock,
  Unlock,
  X,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import "./AdminAccounts.css"

const CURRENT_ADMIN_ID = "ACC01"

const initialAccounts = [
  {
    id: "ACC01",
    fullName: "Admin Tổng",
    email: "admin@lumierespa.com",
    phone: "0901 111 111",
    role: "Admin",
    status: "Hoạt động",
    createdAt: "01/01/2020",
    relatedUser: "Nhân viên quản trị",
    note: "Tài khoản quản trị hệ thống",
  },
  {
    id: "ACC02",
    fullName: "Trần Thị Bích",
    email: "bich.tran@spa.com",
    phone: "0902 222 222",
    role: "Lễ tân",
    status: "Hoạt động",
    createdAt: "01/06/2022",
    relatedUser: "Nhân viên lễ tân",
    note: "Phụ trách tiếp nhận lịch hẹn",
  },
  {
    id: "ACC03",
    fullName: "Phạm Minh Đạt",
    email: "dat.pham@spa.com",
    phone: "0903 333 333",
    role: "Quản lý",
    status: "Hoạt động",
    createdAt: "01/01/2021",
    relatedUser: "Quản lý chi nhánh",
    note: "Theo dõi vận hành spa",
  },
  {
    id: "ACC04",
    fullName: "Nguyễn Văn Test",
    email: "test@spa.com",
    phone: "0904 444 444",
    role: "Lễ tân",
    status: "Khóa",
    createdAt: "15/10/2023",
    relatedUser: "Nhân viên lễ tân",
    note: "Tài khoản đang bị khóa",
  },
  {
    id: "ACC05",
    fullName: "Lê Hoài An",
    email: "an.le@gmail.com",
    phone: "0905 555 555",
    role: "Khách hàng",
    status: "Hoạt động",
    createdAt: "20/02/2024",
    relatedUser: "Khách hàng",
    note: "Tài khoản khách hàng đặt lịch",
  },
]

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "Lễ tân",
  status: "Hoạt động",
  relatedUser: "",
  note: "",
}

function AdminAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [searchValue, setSearchValue] = useState("")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [modalType, setModalType] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState("")

  const filteredAccounts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()

    return accounts.filter((account) => {
      const matchSearch =
        account.fullName.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword) ||
        account.role.toLowerCase().includes(keyword) ||
        account.id.toLowerCase().includes(keyword)

      const matchRole =
        roleFilter === "Tất cả" || account.role === roleFilter

      const matchStatus =
        statusFilter === "Tất cả" || account.status === statusFilter

      return matchSearch && matchRole && matchStatus
    })
  }, [accounts, searchValue, roleFilter, statusFilter])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(""), 2600)
  }

  const getInitial = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .pop()
      ?.charAt(0)
      .toUpperCase()
  }

  const createAccountId = () => {
    const maxNumber = accounts.reduce((max, account) => {
      const number = Number(account.id.replace("ACC", ""))
      return number > max ? number : max
    }, 0)

    return `ACC${String(maxNumber + 1).padStart(2, "0")}`
  }

  const getToday = () => {
    return new Date().toLocaleDateString("vi-VN")
  }

  const openCreateModal = () => {
    setModalType("create")
    setSelectedAccount(null)
    setFormData(emptyForm)
    setErrorMessage("")
  }

  const openViewModal = (account) => {
    setModalType("view")
    setSelectedAccount(account)
    setErrorMessage("")
  }

  const openEditModal = (account) => {
    setModalType("edit")
    setSelectedAccount(account)
    setFormData({
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      role: account.role,
      status: account.status,
      relatedUser: account.relatedUser,
      note: account.note,
    })
    setErrorMessage("")
  }

  const openStatusModal = (account) => {
    if (account.id === CURRENT_ADMIN_ID && account.status === "Hoạt động") {
      showToast("Không thể khóa chính tài khoản Admin đang đăng nhập.")
      return
    }

    setSelectedAccount(account)
    setModalType(account.status === "Hoạt động" ? "lock" : "unlock")
    setErrorMessage("")
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedAccount(null)
    setFormData(emptyForm)
    setErrorMessage("")
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      return "Vui lòng nhập họ tên người dùng."
    }

    if (!formData.email.trim()) {
      return "Vui lòng nhập email."
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email)) {
      return "Email không hợp lệ."
    }

    const isDuplicateEmail = accounts.some((account) => {
      const sameEmail =
        account.email.toLowerCase() === formData.email.trim().toLowerCase()

      if (modalType === "edit") {
        return sameEmail && account.id !== selectedAccount.id
      }

      return sameEmail
    })

    if (isDuplicateEmail) {
      return "Email đã tồn tại trong hệ thống."
    }

    if (!formData.phone.trim()) {
      return "Vui lòng nhập số điện thoại."
    }

    return ""
  }

  const handleSubmitForm = (event) => {
    event.preventDefault()

    const message = validateForm()

    if (message) {
      setErrorMessage(message)
      return
    }

    if (modalType === "create") {
      const newAccount = {
        id: createAccountId(),
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        relatedUser: formData.relatedUser.trim() || "Chưa liên kết",
        note: formData.note.trim() || "Chưa có ghi chú",
        createdAt: getToday(),
      }

      setAccounts((prev) => [newAccount, ...prev])
      showToast("Cấp tài khoản mới thành công.")
      closeModal()
      return
    }

    if (modalType === "edit") {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === selectedAccount.id
            ? {
                ...account,
                ...formData,
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                relatedUser: formData.relatedUser.trim() || "Chưa liên kết",
                note: formData.note.trim() || "Chưa có ghi chú",
              }
            : account
        )
      )

      showToast("Cập nhật thông tin tài khoản thành công.")
      closeModal()
    }
  }

  const handleConfirmStatus = () => {
    if (!selectedAccount) return

    if (selectedAccount.id === CURRENT_ADMIN_ID) {
      showToast("Không thể khóa chính tài khoản Admin đang đăng nhập.")
      closeModal()
      return
    }

    const nextStatus =
      selectedAccount.status === "Hoạt động" ? "Khóa" : "Hoạt động"

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === selectedAccount.id
          ? {
              ...account,
              status: nextStatus,
            }
          : account
      )
    )

    showToast(
      nextStatus === "Khóa"
        ? "Khóa tài khoản thành công."
        : "Mở khóa tài khoản thành công."
    )

    closeModal()
  }

  return (
    <section className="account-page">
      {toast && (
        <div className="account-toast">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      <div className="account-summary">
        <div className="account-summary-card">
          <div className="account-summary-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p>Tổng tài khoản</p>
            <h3>{accounts.length}</h3>
          </div>
        </div>

        <div className="account-summary-card">
          <div className="account-summary-icon active">
            <Unlock size={22} />
          </div>
          <div>
            <p>Đang hoạt động</p>
            <h3>{accounts.filter((item) => item.status === "Hoạt động").length}</h3>
          </div>
        </div>

        <div className="account-summary-card">
          <div className="account-summary-icon locked">
            <Lock size={22} />
          </div>
          <div>
            <p>Đang bị khóa</p>
            <h3>{accounts.filter((item) => item.status === "Khóa").length}</h3>
          </div>
        </div>
      </div>

      <div className="account-toolbar">
        <div className="account-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </div>

        <div className="account-toolbar-right">
          <div className="account-filter-wrapper">
            <button
              type="button"
              className="account-filter-btn"
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <Filter size={18} />
              Lọc
            </button>

            {isFilterOpen && (
              <div className="account-filter-panel">
                <div className="account-filter-group">
                  <label>Vai trò</label>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                  >
                    <option>Tất cả</option>
                    <option>Admin</option>
                    <option>Quản lý</option>
                    <option>Lễ tân</option>
                    <option>Kỹ thuật viên</option>
                    <option>Khách hàng</option>
                  </select>
                </div>

                <div className="account-filter-group">
                  <label>Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option>Tất cả</option>
                    <option>Hoạt động</option>
                    <option>Khóa</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="account-clear-filter"
                  onClick={() => {
                    setRoleFilter("Tất cả")
                    setStatusFilter("Tất cả")
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="account-create-btn"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Cấp tài khoản mới
          </button>
        </div>
      </div>

      <div className="account-table-card">
        <div className="account-table-scroll">
          <table className="account-table">
            <thead>
              <tr>
                <th>Mã TK</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th className="account-action-col">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="account-code">{account.id}</td>

                    <td>
                      <div className="account-user-cell">
                        <div
                          className={`account-avatar ${
                            account.status === "Khóa" ? "is-muted" : ""
                          }`}
                        >
                          {getInitial(account.fullName)}
                        </div>

                        <div>
                          <h4>{account.fullName}</h4>
                          <p>{account.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`account-role-badge role-${account.role
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {account.role === "Admin" && (
                          <ShieldCheck size={15} />
                        )}
                        {account.role}
                      </span>
                    </td>

                    <td>{account.createdAt}</td>

                    <td>
                      <span
                        className={
                          account.status === "Hoạt động"
                            ? "account-status active"
                            : "account-status locked"
                        }
                      >
                        {account.status}
                      </span>
                    </td>

                    <td>
                      <div className="account-actions">
                        <button
                          type="button"
                          className="account-icon-btn"
                          title="Xem chi tiết"
                          onClick={() => openViewModal(account)}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          className="account-icon-btn"
                          title="Cập nhật"
                          onClick={() => openEditModal(account)}
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          className={
                            account.status === "Hoạt động"
                              ? "account-icon-btn danger"
                              : "account-icon-btn success"
                          }
                          title={
                            account.status === "Hoạt động"
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                          onClick={() => openStatusModal(account)}
                        >
                          {account.status === "Hoạt động" ? (
                            <Lock size={18} />
                          ) : (
                            <Unlock size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="account-empty">
                      <AlertCircle size={24} />
                      <p>Chưa có tài khoản nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalType === "create" || modalType === "edit") && (
        <div className="account-modal-overlay">
          <div className="account-modal">
            <button
              type="button"
              className="account-modal-close"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            <div className="account-modal-header">
              <h2>
                {modalType === "create"
                  ? "Cấp tài khoản mới"
                  : "Cập nhật tài khoản"}
              </h2>
              <p>
                {modalType === "create"
                  ? "Tạo tài khoản và phân quyền cho người dùng trong hệ thống."
                  : "Chỉnh sửa thông tin, vai trò hoặc trạng thái tài khoản."}
              </p>
            </div>

            {errorMessage && (
              <div className="account-form-error">
                <AlertCircle size={17} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="account-form" onSubmit={handleSubmitForm}>
              <div className="account-form-grid">
                <div className="account-form-group">
                  <label>Họ tên người dùng</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ tên"
                  />
                </div>

                <div className="account-form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="account-form-group">
                  <label>Số điện thoại</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="account-form-group">
                  <label>Vai trò</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option>Admin</option>
                    <option>Quản lý</option>
                    <option>Lễ tân</option>
                    <option>Kỹ thuật viên</option>
                    <option>Khách hàng</option>
                  </select>
                </div>

                <div className="account-form-group">
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option>Hoạt động</option>
                    <option>Khóa</option>
                  </select>
                </div>

                <div className="account-form-group">
                  <label>Liên kết người dùng</label>
                  <input
                    name="relatedUser"
                    value={formData.relatedUser}
                    onChange={handleChange}
                    placeholder="VD: Nhân viên lễ tân"
                  />
                </div>
              </div>

              <div className="account-form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú nếu có"
                  rows="3"
                />
              </div>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="account-secondary-btn"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button type="submit" className="account-primary-btn">
                  {modalType === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "view" && selectedAccount && (
        <div className="account-modal-overlay">
          <div className="account-modal detail">
            <button
              type="button"
              className="account-modal-close"
              onClick={closeModal}
            >
              <X size={20} />
            </button>

            <div className="account-detail-head">
              <div className="account-detail-avatar">
                {getInitial(selectedAccount.fullName)}
              </div>

              <div>
                <h2>{selectedAccount.fullName}</h2>
                <p>{selectedAccount.id}</p>
              </div>
            </div>

            <div className="account-detail-grid">
              <div className="account-detail-item">
                <Mail size={18} />
                <div>
                  <span>Email</span>
                  <strong>{selectedAccount.email}</strong>
                </div>
              </div>

              <div className="account-detail-item">
                <Phone size={18} />
                <div>
                  <span>Số điện thoại</span>
                  <strong>{selectedAccount.phone}</strong>
                </div>
              </div>

              <div className="account-detail-item">
                <UserRound size={18} />
                <div>
                  <span>Vai trò</span>
                  <strong>{selectedAccount.role}</strong>
                </div>
              </div>

              <div className="account-detail-item">
                <CalendarDays size={18} />
                <div>
                  <span>Ngày tạo</span>
                  <strong>{selectedAccount.createdAt}</strong>
                </div>
              </div>

              <div className="account-detail-item">
                <ShieldCheck size={18} />
                <div>
                  <span>Trạng thái</span>
                  <strong>{selectedAccount.status}</strong>
                </div>
              </div>

              <div className="account-detail-item">
                <UserRound size={18} />
                <div>
                  <span>Người dùng liên kết</span>
                  <strong>{selectedAccount.relatedUser}</strong>
                </div>
              </div>
            </div>

            <div className="account-note-box">
              <span>Ghi chú</span>
              <p>{selectedAccount.note}</p>
            </div>

            <div className="account-modal-actions">
              <button
                type="button"
                className="account-secondary-btn"
                onClick={closeModal}
              >
                Đóng
              </button>

              <button
                type="button"
                className="account-primary-btn"
                onClick={() => openEditModal(selectedAccount)}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {(modalType === "lock" || modalType === "unlock") && selectedAccount && (
        <div className="account-modal-overlay">
          <div className="account-confirm-modal">
            <div
              className={
                modalType === "lock"
                  ? "account-confirm-icon danger"
                  : "account-confirm-icon success"
              }
            >
              {modalType === "lock" ? <Lock size={28} /> : <Unlock size={28} />}
            </div>

            <h2>
              {modalType === "lock"
                ? "Khóa tài khoản?"
                : "Mở khóa tài khoản?"}
            </h2>

            <p>
              {modalType === "lock"
                ? `Tài khoản ${selectedAccount.fullName} sẽ không thể đăng nhập vào hệ thống sau khi bị khóa.`
                : `Tài khoản ${selectedAccount.fullName} sẽ được phép đăng nhập lại vào hệ thống.`}
            </p>

            <div className="account-modal-actions center">
              <button
                type="button"
                className="account-secondary-btn"
                onClick={closeModal}
              >
                Hủy
              </button>

              <button
                type="button"
                className={
                  modalType === "lock"
                    ? "account-danger-btn"
                    : "account-primary-btn"
                }
                onClick={handleConfirmStatus}
              >
                {modalType === "lock" ? "Xác nhận khóa" : "Xác nhận mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminAccounts
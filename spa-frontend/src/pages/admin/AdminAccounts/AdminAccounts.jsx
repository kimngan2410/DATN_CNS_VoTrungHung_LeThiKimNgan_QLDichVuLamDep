import React, { useEffect, useMemo, useState } from "react"
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
  ArrowUpDown,
  Loader2,
} from "lucide-react"

import {
  createAdminAccountApi,
  getAdminAccountsApi,
  updateAdminAccountApi,
  updateAdminAccountStatusApi,
} from "../../../services/adminAccountApi"

import "./AdminAccounts.css"

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "Lễ tân",
  status: "Hoạt động",
  password: "TK@123456",
  relatedUser: "",
  note: "",
}

const getAccountCodeNumber = (account) => {
  const code = account?.id || ""

  return Number(code.replace(/\D/g, "") || account?.idTaiKhoan || 0)
}

const getDateTimestamp = (dateValue) => {
  if (!dateValue) return 0

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return 0

  return date.getTime()
}

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const getInitial = (name) => {
  if (!name) return "?"

  return (
    name
      .split(" ")
      .filter(Boolean)
      .pop()
      ?.charAt(0)
      .toUpperCase() || "?"
  )
}

function AdminAccounts() {
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [searchValue, setSearchValue] = useState("")
  const [roleFilter, setRoleFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("default")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [modalType, setModalType] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState("")

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      setLoadError("")

      const data = await getAdminAccountsApi()

      setAccounts(Array.isArray(data) ? data : [])
    } catch (error) {
      setLoadError(error.message || "Không thể tải danh sách tài khoản.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccounts()
  }, [])

  const filteredAccounts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()

    const filtered = accounts.filter((account) => {
      const fullName = account.fullName || ""
      const email = account.email || ""
      const role = account.role || ""
      const id = account.id || ""
      const phone = account.phone || ""

      const matchSearch =
        fullName.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        role.toLowerCase().includes(keyword) ||
        id.toLowerCase().includes(keyword) ||
        phone.toLowerCase().includes(keyword)

      const matchRole = roleFilter === "Tất cả" || account.role === roleFilter

      const matchStatus =
        statusFilter === "Tất cả" || account.status === statusFilter

      return matchSearch && matchRole && matchStatus
    })

    if (sortOption === "default") {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const codeA = getAccountCodeNumber(a)
      const codeB = getAccountCodeNumber(b)

      const nameA = (a.fullName || "").toLowerCase()
      const nameB = (b.fullName || "").toLowerCase()

      const roleA = (a.role || "").toLowerCase()
      const roleB = (b.role || "").toLowerCase()

      const createdA = getDateTimestamp(a.createdAt)
      const createdB = getDateTimestamp(b.createdAt)

      if (sortOption === "code-desc") return codeB - codeA
      if (sortOption === "code-asc") return codeA - codeB

      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB, "vi")
      }

      if (sortOption === "name-desc") {
        return nameB.localeCompare(nameA, "vi")
      }

      if (sortOption === "role-asc") {
        return roleA.localeCompare(roleB, "vi")
      }

      if (sortOption === "created-desc") return createdB - createdA
      if (sortOption === "created-asc") return createdA - createdB

      return 0
    })
  }, [accounts, searchValue, roleFilter, statusFilter, sortOption])

  const showToast = (message) => {
    setToast(message)

    setTimeout(() => {
      setToast("")
    }, 2600)
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
      fullName: account.fullName || "",
      email: account.email || "",
      phone: account.phone || "",
      role: account.role || "Khách hàng",
      status: account.status || "Hoạt động",
      password: "",
      relatedUser: account.relatedUser || "",
      note: account.note || "",
    })
    setErrorMessage("")
  }

  const openStatusModal = (account) => {
    setSelectedAccount(account)
    setModalType(account.status === "Hoạt động" ? "lock" : "unlock")
    setErrorMessage("")
  }

  const closeModal = () => {
    if (isSaving) return

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

    if (errorMessage) {
      setErrorMessage("")
    }
  }

  const validateForm = () => {
    const fullName = formData.fullName.trim()
    const email = formData.email.trim().toLowerCase()
    const phone = formData.phone.trim()

    if (!fullName) {
      return "Vui lòng nhập họ tên người dùng."
    }

    if (!email) {
      return "Vui lòng nhập email."
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email)) {
      return "Email không hợp lệ."
    }

    const isDuplicateEmail = accounts.some((account) => {
      const sameEmail = (account.email || "").toLowerCase() === email

      if (modalType === "edit") {
        return sameEmail && account.idTaiKhoan !== selectedAccount?.idTaiKhoan
      }

      return sameEmail
    })

    if (isDuplicateEmail) {
      return "Email đã tồn tại trong hệ thống."
    }

    if (!phone) {
      return "Vui lòng nhập số điện thoại."
    }

    if (!formData.role) {
      return "Vui lòng chọn vai trò."
    }

    if (!formData.status) {
      return "Vui lòng chọn trạng thái."
    }

    return ""
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault()

    const message = validateForm()

    if (message) {
      setErrorMessage(message)
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage("")

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        password: formData.password || "TK@123456",
        relatedUser: formData.relatedUser.trim(),
        note: formData.note.trim(),
      }

      if (modalType === "create") {
        const createdAccount = await createAdminAccountApi(payload)

        setAccounts((prev) => [createdAccount, ...prev])
        showToast("Cấp tài khoản mới thành công.")
        closeModal()
        return
      }

      if (modalType === "edit" && selectedAccount) {
        const updatedAccount = await updateAdminAccountApi(
          selectedAccount.idTaiKhoan,
          payload
        )

        setAccounts((prev) =>
          prev.map((account) =>
            account.idTaiKhoan === updatedAccount.idTaiKhoan
              ? updatedAccount
              : account
          )
        )

        showToast("Cập nhật thông tin tài khoản thành công.")
        closeModal()
      }
    } catch (error) {
      setErrorMessage(error.message || "Không thể lưu tài khoản.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStatus = async () => {
    if (!selectedAccount) return

    const nextStatus =
      selectedAccount.status === "Hoạt động" ? "Khóa" : "Hoạt động"

    try {
      setIsSaving(true)

      const updatedAccount = await updateAdminAccountStatusApi(
        selectedAccount.idTaiKhoan,
        nextStatus
      )

      setAccounts((prev) =>
        prev.map((account) =>
          account.idTaiKhoan === updatedAccount.idTaiKhoan
            ? updatedAccount
            : account
        )
      )

      showToast(
        nextStatus === "Khóa"
          ? "Khóa tài khoản thành công."
          : "Mở khóa tài khoản thành công."
      )

      closeModal()
    } catch (error) {
      showToast(error.message || "Không thể cập nhật trạng thái tài khoản.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearFilter = () => {
    setRoleFilter("Tất cả")
    setStatusFilter("Tất cả")
    setSortOption("default")
  }

  if (isLoading) {
    return (
      <section className="account-page">
        <div className="account-table-card">
          <div className="account-empty">
            <Loader2 size={24} />
            <p>Đang tải danh sách tài khoản...</p>
          </div>
        </div>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="account-page">
        <div className="account-table-card">
          <div className="account-empty">
            <AlertCircle size={24} />
            <p>{loadError}</p>

            <button
              type="button"
              className="account-clear-filter"
              onClick={fetchAccounts}
            >
              Tải lại
            </button>
          </div>
        </div>
      </section>
    )
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
            <h3>
              {accounts.filter((item) => item.status === "Hoạt động").length}
            </h3>
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
                  onClick={handleClearFilter}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>

          <div className="account-sort">
            <label>
              <ArrowUpDown size={15} />
              Sắp xếp
            </label>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="code-desc">Mã TK giảm dần</option>
              <option value="code-asc">Mã TK tăng dần</option>
              <option value="name-asc">Tên A - Z</option>
              <option value="name-desc">Tên Z - A</option>
              <option value="role-asc">Vai trò A - Z</option>
              <option value="created-desc">Ngày tạo mới nhất</option>
              <option value="created-asc">Ngày tạo cũ nhất</option>
            </select>
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
                  <tr key={account.idTaiKhoan || account.id}>
                    <td className="account-code">{account.id}</td>

                    <td>
                      <div className="account-user-cell">
                        {account.avatar ? (
                          <img
                            src={account.avatar}
                            alt={account.fullName}
                            className={`account-avatar-img ${
                              account.status === "Khóa" ? "is-muted" : ""
                            }`}
                            onError={(event) => {
                              event.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div
                            className={`account-avatar ${
                              account.status === "Khóa" ? "is-muted" : ""
                            }`}
                          >
                            {getInitial(account.fullName)}
                          </div>
                        )}

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

                    <td>{formatDateTime(account.createdAt)}</td>

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
              disabled={isSaving}
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
                  : "Chỉnh sửa thông tin hoặc trạng thái tài khoản."}
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
                    disabled={isSaving}
                  />
                </div>

                <div className="account-form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                    disabled={isSaving}
                  />
                </div>

                <div className="account-form-group">
                  <label>Số điện thoại</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    disabled={isSaving}
                  />
                </div>

                <div className="account-form-group">
                  <label>Vai trò</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    <option>Admin</option>
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
                    disabled={isSaving}
                  >
                    <option>Hoạt động</option>
                    <option>Khóa</option>
                  </select>
                </div>

                {modalType === "create" && (
                  <div className="account-form-group">
                    <label>Mật khẩu mặc định</label>
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="VD: TK@123456"
                      disabled={isSaving}
                    />
                  </div>
                )}

                <div className="account-form-group">
                  <label>Liên kết người dùng</label>
                  <input
                    name="relatedUser"
                    value={formData.relatedUser}
                    onChange={handleChange}
                    placeholder="VD: NV001 hoặc KH0001"
                    disabled
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
                  disabled={isSaving}
                />
              </div>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="account-secondary-btn"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="account-primary-btn"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Đang lưu..."
                    : modalType === "create"
                      ? "Tạo tài khoản"
                      : "Lưu thay đổi"}
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
              {selectedAccount.avatar ? (
                <img
                  src={selectedAccount.avatar}
                  alt={selectedAccount.fullName}
                  className="account-avatar-img"
                  onError={(event) => {
                    event.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="account-detail-avatar">
                  {getInitial(selectedAccount.fullName)}
                </div>
              )}

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
                  <strong>{selectedAccount.phone || "Chưa cập nhật"}</strong>
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
                  <strong>{formatDateTime(selectedAccount.createdAt)}</strong>
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
                  <strong>
                    {selectedAccount.relatedUser || "Chưa liên kết"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="account-note-box">
              <span>Ghi chú</span>
              <p>{selectedAccount.note || "Chưa có ghi chú"}</p>
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
                disabled={isSaving}
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
                disabled={isSaving}
              >
                {isSaving
                  ? "Đang xử lý..."
                  : modalType === "lock"
                    ? "Xác nhận khóa"
                    : "Xác nhận mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminAccounts
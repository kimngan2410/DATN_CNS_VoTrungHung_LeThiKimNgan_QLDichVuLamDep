import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
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
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"

import {
  createAdminServiceCategoryApi,
  deleteAdminServiceCategoryApi,
  getAdminServiceCategoriesApi,
  getAdminServiceCategoryDetailApi,
  updateAdminServiceCategoryApi,
} from "../../../services/adminServiceCategoryApi"

import "./AdminServiceCategories.css"

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const getCategoryCode = (category) => {
  return category?.id || `DM${String(category?.idDanhMuc || "").padStart(3, "0")}`
}

const getCategoryServices = (category) => {
  return Array.isArray(category?.services) ? category.services : []
}

const getCategoryCreatedAtTimestamp = (category) => {
  const createdAt = category?.createdAt

  if (!createdAt || createdAt === "Chưa cập nhật") return 0

  if (createdAt.includes("/")) {
    const [day, month, year] = createdAt.split("/")
    return new Date(`${year}-${month}-${day}`).getTime()
  }

  if (createdAt.includes("-")) {
    return new Date(createdAt).getTime()
  }

  return 0
}

function AdminServiceCategories() {
  const [categories, setCategories] = useState([])
  const [searchText, setSearchText] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [fromDateFilter, setFromDateFilter] = useState("")
  const [toDateFilter, setToDateFilter] = useState("")
  const [sortOption, setSortOption] = useState("default")

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const [formError, setFormError] = useState("")

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const toastTimeoutRef = useRef(null)

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

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const data = await getAdminServiceCategoriesApi({
        fromDate: fromDateFilter,
        toDate: toDateFilter,
      })

      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage(
        error.message || "Không thể tải danh sách danh mục dịch vụ."
      )
    } finally {
      setIsLoading(false)
    }
  }, [fromDateFilter, toDateFilter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const filteredCategories = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    const filtered = categories.filter((category) => {
      const code = getCategoryCode(category).toLowerCase()
      const name = (category.name || "").toLowerCase()
      const description = (category.description || "").toLowerCase()

      if (!keyword) return true

      return (
        code.includes(keyword) ||
        name.includes(keyword) ||
        description.includes(keyword)
      )
    })

    if (sortOption === "default") {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const codeA = Number(a.idDanhMuc || 0)
      const codeB = Number(b.idDanhMuc || 0)

      const nameA = (a.name || "").toLowerCase()
      const nameB = (b.name || "").toLowerCase()

      const createdAtA = getCategoryCreatedAtTimestamp(a)
      const createdAtB = getCategoryCreatedAtTimestamp(b)

      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB, "vi")
      }

      if (sortOption === "name-desc") {
        return nameB.localeCompare(nameA, "vi")
      }

      if (sortOption === "code-asc") {
        return codeA - codeB
      }

      if (sortOption === "code-desc") {
        return codeB - codeA
      }

      if (sortOption === "created-desc") {
        return createdAtB - createdAtA
      }

      if (sortOption === "created-asc") {
        return createdAtA - createdAtB
      }

      return 0
    })
  }, [categories, searchText, sortOption])

  const handleResetFilter = () => {
    setSearchText("")
    setFromDateFilter("")
    setToDateFilter("")
    setSortOption("default")
  }

  const handleOpenCreateForm = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || "",
      description: category.description || "",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    if (isSaving) return

    setIsFormOpen(false)
    setEditingCategory(null)
    setFormError("")
  }

  const handleChangeForm = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formError) {
      setFormError("")
    }
  }

  const handleSaveCategory = async () => {
    const trimmedName = formData.name.trim()
    const trimmedDescription = formData.description.trim()

    if (!trimmedName) {
      setFormError("Vui lòng nhập tên danh mục.")
      return
    }

    const payload = {
      name: trimmedName,
      description: trimmedDescription || "Chưa có mô tả.",
    }

    try {
      setIsSaving(true)
      setFormError("")

      if (editingCategory) {
        const updatedCategory = await updateAdminServiceCategoryApi(
          editingCategory.idDanhMuc,
          payload
        )

        setCategories((prev) =>
          prev.map((category) =>
            category.idDanhMuc === updatedCategory.idDanhMuc
              ? updatedCategory
              : category
          )
        )

        showToast({
          type: "success",
          title: "Cập nhật thành công",
          message: "Thông tin danh mục dịch vụ đã được cập nhật.",
        })
      } else {
        const createdCategory = await createAdminServiceCategoryApi(payload)

        setCategories((prev) => [createdCategory, ...prev])

        showToast({
          type: "success",
          title: "Thêm thành công",
          message: "Danh mục dịch vụ mới đã được thêm vào hệ thống.",
        })
      }

      setIsFormOpen(false)
      setEditingCategory(null)
      setFormError("")
    } catch (error) {
      const message = error.message || "Không thể lưu danh mục dịch vụ."

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

  const handleOpenDetail = async (category) => {
    try {
      setIsDetailLoading(true)

      const detail = await getAdminServiceCategoryDetailApi(category.idDanhMuc)
      setSelectedCategory(detail)
    } catch (error) {
      setSelectedCategory(category)

      showToast({
        type: "warning",
        title: "Không tải được chi tiết",
        message:
          error.message ||
          "Hệ thống đang hiển thị dữ liệu danh mục hiện có trong bảng.",
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleRequestDelete = (category) => {
    const serviceCount = Number(
      category.serviceCount ?? getCategoryServices(category).length
    )

    if (serviceCount > 0) {
      showToast({
        type: "warning",
        title: "Không thể xoá danh mục",
        message:
          "Danh mục này đang có dịch vụ trong hệ thống nên không thể xoá.",
      })
      return
    }

    setDeleteTarget(category)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsSaving(true)

      await deleteAdminServiceCategoryApi(deleteTarget.idDanhMuc)

      setCategories((prev) =>
        prev.filter((category) => category.idDanhMuc !== deleteTarget.idDanhMuc)
      )

      setDeleteTarget(null)

      showToast({
        type: "success",
        title: "Xoá thành công",
        message: "Danh mục dịch vụ đã được xoá khỏi danh sách.",
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "Xoá thất bại",
        message: error.message || "Không thể xoá danh mục dịch vụ.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-categories-page">
        <section className="admin-categories-card">
          <div className="admin-category-empty-state">
            <Loader2 size={20} className="admin-category-loading-icon" />
            Đang tải danh sách danh mục dịch vụ...
          </div>
        </section>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="admin-categories-page">
        <section className="admin-categories-card">
          <div className="admin-category-empty-state">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="admin-category-reset-btn"
              onClick={fetchCategories}
            >
              <RotateCcw size={16} />
              Tải lại
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-categories-page">
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

      <section className="admin-categories-toolbar">
        <div className="admin-categories-toolbar-left">
          <div className="admin-categories-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <button
            type="button"
            className={
              isFilterOpen
                ? "admin-categories-filter-btn active"
                : "admin-categories-filter-btn"
            }
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            <Filter size={18} strokeWidth={2.3} />
            Lọc
          </button>

          <div className="admin-categories-sort">
            <label>
              <ArrowUpDown size={15} />
              Sắp xếp
            </label>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="code-desc">Mã DM giảm dần</option>
              <option value="code-asc">Mã DM tăng dần</option>
              <option value="name-asc">Tên A - Z</option>
              <option value="name-desc">Tên Z - A</option>
              <option value="created-desc">Ngày tạo mới nhất</option>
              <option value="created-asc">Ngày tạo cũ nhất</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="admin-category-primary-btn"
          onClick={handleOpenCreateForm}
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </section>

      {isFilterOpen && (
        <section className="admin-categories-filter-panel">
          <div className="admin-category-filter-group">
            <label>Từ ngày</label>

            <input
              type="date"
              value={fromDateFilter}
              onChange={(event) => setFromDateFilter(event.target.value)}
            />
          </div>

          <div className="admin-category-filter-group">
            <label>Đến ngày</label>

            <input
              type="date"
              value={toDateFilter}
              onChange={(event) => setToDateFilter(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="admin-category-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </section>
      )}

      <section className="admin-categories-card">
        <div className="admin-categories-result-bar">
          <div>
            <h3>Danh sách danh mục dịch vụ</h3>

            <p>
              Hiển thị <strong>{filteredCategories.length}</strong> danh mục
            </p>
          </div>
        </div>

        <div className="admin-categories-table-wrapper">
          <table className="admin-categories-table">
            <thead>
              <tr>
                <th>Mã DM</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Ngày tạo</th>
                <th>Số dịch vụ</th>
                <th className="admin-category-actions-th">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const services = getCategoryServices(category)
                  const serviceCount = Number(
                    category.serviceCount ?? services.length
                  )

                  return (
                    <tr key={category.idDanhMuc || category.id}>
                      <td className="admin-category-code">
                        {getCategoryCode(category)}
                      </td>

                      <td>
                        <div className="admin-category-name-cell">
                          <h4>{category.name}</h4>
                        </div>
                      </td>

                      <td className="admin-category-description">
                        {category.description || "Chưa có mô tả."}
                      </td>

                      <td>{category.createdAt || "Chưa cập nhật"}</td>

                      <td>
                        <span className="admin-category-count-badge">
                          {serviceCount} dịch vụ
                        </span>
                      </td>

                      <td className="admin-category-actions-td">
                        <div className="admin-category-actions">
                          <button
                            type="button"
                            className="admin-category-action-btn view"
                            onClick={() => handleOpenDetail(category)}
                            title="Xem chi tiết"
                            disabled={isDetailLoading}
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="admin-category-action-btn edit"
                            onClick={() => handleOpenEditForm(category)}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="admin-category-action-btn delete"
                            onClick={() => handleRequestDelete(category)}
                            title="Xoá"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="admin-category-empty-state">
                      Chưa có danh mục nào phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCategory && (
        <div
          className="admin-category-modal-overlay"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="admin-category-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-category-modal-header">
              <div>
                <h2>Chi tiết danh mục</h2>
                <p>{getCategoryCode(selectedCategory)}</p>
              </div>

              <button
                type="button"
                className="admin-category-close-btn"
                onClick={() => setSelectedCategory(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-category-detail-body">
              <div className="admin-category-detail-hero">
                <div>
                  <h3>{selectedCategory.name}</h3>
                  <p>{selectedCategory.description || "Chưa có mô tả."}</p>
                </div>
              </div>

              <div className="admin-category-detail-grid">
                <div className="admin-category-detail-box">
                  <span>Mã danh mục</span>
                  <strong>{getCategoryCode(selectedCategory)}</strong>
                </div>

                <div className="admin-category-detail-box">
                  <span>Ngày tạo</span>
                  <strong>
                    {selectedCategory.createdAt || "Chưa cập nhật"}
                  </strong>
                </div>

                <div className="admin-category-detail-box">
                  <span>Số dịch vụ</span>
                  <strong>
                    {Number(
                      selectedCategory.serviceCount ??
                        getCategoryServices(selectedCategory).length
                    )}
                  </strong>
                </div>
              </div>

              <div className="admin-category-services-box">
                <div className="admin-category-services-header">
                  <h3>Dịch vụ thuộc danh mục</h3>

                  <span>
                    {Number(
                      selectedCategory.serviceCount ??
                        getCategoryServices(selectedCategory).length
                    )}{" "}
                    dịch vụ
                  </span>
                </div>

                {getCategoryServices(selectedCategory).length > 0 ? (
                  <div className="admin-category-service-list">
                    {getCategoryServices(selectedCategory).map((service) => (
                      <div
                        className="admin-category-service-item"
                        key={service.idDichVu || service.id}
                      >
                        <div className="admin-category-service-info">
                          <h4>{service.name}</h4>

                          <p>
                            {service.maDV || service.id} •{" "}
                            {service.duration || 0} phút •{" "}
                            {service.status || "Hoạt động"}
                          </p>
                        </div>

                        <div className="admin-category-service-price">
                          {formatMoney(service.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-category-no-service">
                    Danh mục này chưa có dịch vụ nào.
                  </div>
                )}
              </div>
            </div>

            <div className="admin-category-modal-actions">
              <button
                type="button"
                className="admin-category-cancel-btn"
                onClick={() => setSelectedCategory(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="admin-category-primary-btn"
                onClick={() => {
                  handleOpenEditForm(selectedCategory)
                  setSelectedCategory(null)
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
        <div className="admin-category-modal-overlay" onClick={handleCloseForm}>
          <div
            className="admin-category-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-category-modal-header">
              <div>
                <h2>
                  {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                </h2>

                <p>
                  {editingCategory
                    ? "Cập nhật thông tin danh mục dịch vụ"
                    : "Nhập thông tin để tạo danh mục mới"}
                </p>
              </div>

              <button
                type="button"
                className="admin-category-close-btn"
                onClick={handleCloseForm}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-category-form-body">
              {formError && (
                <div className="admin-category-form-error">
                  <AlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-category-form-group">
                <label>Tên danh mục</label>

                <input
                  type="text"
                  placeholder="Nhập tên danh mục"
                  value={formData.name}
                  onChange={(event) =>
                    handleChangeForm("name", event.target.value)
                  }
                />
              </div>

              <div className="admin-category-form-group">
                <label>Mô tả</label>

                <textarea
                  rows="4"
                  placeholder="Nhập mô tả danh mục"
                  value={formData.description}
                  onChange={(event) =>
                    handleChangeForm("description", event.target.value)
                  }
                ></textarea>
              </div>
            </div>

            <div className="admin-category-modal-actions">
              <button
                type="button"
                className="admin-category-cancel-btn"
                onClick={handleCloseForm}
                disabled={isSaving}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-category-primary-btn"
                onClick={handleSaveCategory}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={17} /> : <Save size={17} />}
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-category-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="admin-category-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-category-delete-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Xác nhận xoá danh mục</h2>

            <p>
              Bạn có chắc chắn muốn xoá danh mục{" "}
              <strong>{deleteTarget.name}</strong> không? Thao tác này không thể
              hoàn tác.
            </p>

            <div className="admin-category-delete-actions">
              <button
                type="button"
                className="admin-category-cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={isSaving}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-category-danger-btn"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Đang xoá..." : "Xoá danh mục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServiceCategories
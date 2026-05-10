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
} from "lucide-react"
import "./AdminServiceCategories.css"

const initialCategories = [
  {
    id: "DM001",
    name: "Chăm sóc da mặt",
    description:
      "Các liệu trình làm sạch, dưỡng da và điều trị chuyên sâu. Các liệu trình làm sạch, dưỡng da và điều trị chuyên sâu.",
    createdAt: "01/01/2023",
    status: "Hoạt động",
    services: [
      {
        id: "DV001",
        name: "Chăm sóc da mặt chuyên sâu",
        price: 400000,
        duration: 60,
        status: "Hoạt động",
      },
      {
        id: "DV002",
        name: "Đắp mặt nạ collagen",
        price: 100000,
        duration: 30,
        status: "Hoạt động",
      },
      {
        id: "DV003",
        name: "Làm sạch da cơ bản",
        price: 250000,
        duration: 45,
        status: "Hoạt động",
      },
    ],
  },
  {
    id: "DM002",
    name: "Massage Body",
    description: "Thư giãn toàn thân, giảm căng thẳng mệt mỏi.",
    createdAt: "05/01/2023",
    status: "Hoạt động",
    services: [
      {
        id: "DV004",
        name: "Massage body thư giãn",
        price: 500000,
        duration: 60,
        status: "Hoạt động",
      },
      {
        id: "DV005",
        name: "Massage cổ vai gáy",
        price: 200000,
        duration: 30,
        status: "Hoạt động",
      },
    ],
  },
  {
    id: "DM003",
    name: "Tắm trắng",
    description: "Liệu trình làm sáng da toàn thân an toàn.",
    createdAt: "10/01/2023",
    status: "Hoạt động",
    services: [
      {
        id: "DV006",
        name: "Tắm trắng body",
        price: 700000,
        duration: 90,
        status: "Hoạt động",
      },
    ],
  },
  {
    id: "DM004",
    name: "Triệt lông",
    description: "Triệt lông vĩnh viễn bằng công nghệ cao.",
    createdAt: "15/01/2023",
    status: "Ngừng hoạt động",
    services: [],
  },
]

const createNextCategoryId = (categories) => {
  const maxNumber = categories.reduce((max, category) => {
    const number = Number(category.id.replace("DM", ""))
    return Number.isNaN(number) ? max : Math.max(max, number)
  }, 0)

  return `DM${String(maxNumber + 1).padStart(3, "0")}`
}

const getTodayText = () => {
  return new Date().toLocaleDateString("vi-VN")
}

const formatMoney = (value) => {
  return `${value.toLocaleString("vi-VN")} đ`
}

function AdminServiceCategories() {
  const [categories, setCategories] = useState(initialCategories)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Hoạt động",
  })

  const [formError, setFormError] = useState("")
  const [toastMessage, setToastMessage] = useState("")

  const filteredCategories = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return categories.filter((category) => {
      const matchKeyword =
        category.id.toLowerCase().includes(keyword) ||
        category.name.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword)

      const matchStatus =
        statusFilter === "Tất cả" || category.status === statusFilter

      return matchKeyword && matchStatus
    })
  }, [categories, searchText, statusFilter])

  const showToast = (message) => {
    setToastMessage(message)

    setTimeout(() => {
      setToastMessage("")
    }, 2400)
  }

  const handleOpenCreateForm = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      status: "Hoạt động",
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
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

  const handleSaveCategory = () => {
    const trimmedName = formData.name.trim()
    const trimmedDescription = formData.description.trim()

    if (!trimmedName) {
      setFormError("Vui lòng nhập tên danh mục.")
      return
    }

    const isDuplicateName = categories.some((category) => {
      const sameName =
        category.name.trim().toLowerCase() === trimmedName.toLowerCase()

      if (editingCategory) {
        return sameName && category.id !== editingCategory.id
      }

      return sameName
    })

    if (isDuplicateName) {
      setFormError("Tên danh mục đã tồn tại. Vui lòng nhập tên khác.")
      return
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: trimmedName,
                description: trimmedDescription || "Chưa có mô tả.",
                status: formData.status,
              }
            : category
        )
      )

      showToast("Cập nhật danh mục thành công.")
    } else {
      const newCategory = {
        id: createNextCategoryId(categories),
        name: trimmedName,
        description: trimmedDescription || "Chưa có mô tả.",
        createdAt: getTodayText(),
        status: formData.status,
        services: [],
      }

      setCategories((prev) => [newCategory, ...prev])
      showToast("Thêm danh mục thành công.")
    }

    handleCloseForm()
  }

  const handleRequestDelete = (category) => {
    if (category.services.length > 0) {
      showToast(
        "Không thể xoá danh mục đang được sử dụng bởi dịch vụ trong hệ thống."
      )
      return
    }

    setDeleteTarget(category)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    setCategories((prev) =>
      prev.filter((category) => category.id !== deleteTarget.id)
    )

    setDeleteTarget(null)
    showToast("Xoá danh mục thành công.")
  }

  const handleResetFilter = () => {
    setSearchText("")
    setStatusFilter("Tất cả")
  }

  return (
    <div className="admin-categories-page">
      {toastMessage && (
        <div className="admin-category-toast">
          <span>{toastMessage}</span>
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
            <label>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Ngừng hoạt động</option>
            </select>
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
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="admin-category-code">{category.id}</td>

                    <td>
                      <div className="admin-category-name-cell">
                        <h4>{category.name}</h4>
                      </div>
                    </td>

                    <td className="admin-category-description">
                      {category.description}
                    </td>

                    <td>{category.createdAt}</td>

                    <td>
                      <span className="admin-category-count-badge">
                        {category.services.length} dịch vụ
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          category.status === "Hoạt động"
                            ? "admin-category-status active"
                            : "admin-category-status inactive"
                        }
                      >
                        {category.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-category-actions">
                        <button
                          type="button"
                          className="admin-category-action-btn view"
                          onClick={() => setSelectedCategory(category)}
                          title="Xem chi tiết"
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
                ))
              ) : (
                <tr>
                  <td colSpan="7">
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
                <p>{selectedCategory.id}</p>
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
                  <p>{selectedCategory.description}</p>
                </div>

                <span
                  className={
                    selectedCategory.status === "Hoạt động"
                      ? "admin-category-status active"
                      : "admin-category-status inactive"
                  }
                >
                  {selectedCategory.status}
                </span>
              </div>

              <div className="admin-category-detail-grid">
                <div className="admin-category-detail-box">
                  <span>Mã danh mục</span>
                  <strong>{selectedCategory.id}</strong>
                </div>

                <div className="admin-category-detail-box">
                  <span>Ngày tạo</span>
                  <strong>{selectedCategory.createdAt}</strong>
                </div>

                <div className="admin-category-detail-box">
                  <span>Số dịch vụ</span>
                  <strong>{selectedCategory.services.length}</strong>
                </div>

                <div className="admin-category-detail-box">
                  <span>Trạng thái</span>
                  <strong>{selectedCategory.status}</strong>
                </div>
              </div>

              <div className="admin-category-services-box">
                <div className="admin-category-services-header">
                  <h3>Dịch vụ thuộc danh mục</h3>
                  <span>{selectedCategory.services.length} dịch vụ</span>
                </div>

                {selectedCategory.services.length > 0 ? (
                  <div className="admin-category-service-list">
                    {selectedCategory.services.map((service) => (
                      <div
                        className="admin-category-service-item"
                        key={service.id}
                      >
                        <div className="admin-category-service-info">
                          <h4>{service.name}</h4>
                          <p>
                            {service.id} • {service.duration} phút •{" "}
                            {service.status}
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
        <div
          className="admin-category-modal-overlay"
          onClick={handleCloseForm}
        >
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

              <div className="admin-category-form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    handleChangeForm("status", event.target.value)
                  }
                >
                  <option>Hoạt động</option>
                  <option>Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="admin-category-modal-actions">
              <button
                type="button"
                className="admin-category-cancel-btn"
                onClick={handleCloseForm}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-category-primary-btn"
                onClick={handleSaveCategory}
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
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-category-danger-btn"
                onClick={handleConfirmDelete}
              >
                Xoá danh mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServiceCategories
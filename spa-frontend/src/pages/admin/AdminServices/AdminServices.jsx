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
  Clock3,
  Image as ImageIcon,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Eraser,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"

import { getServiceCategoriesApi } from "../../../services/serviceApi"

import {
  createAdminServiceApi,
  deleteAdminServiceApi,
  getAdminServiceDetailApi,
  getAdminServicesApi,
  toAbsoluteFileUrl,
  updateAdminServiceApi,
  uploadAdminServiceImagesApi,
} from "../../../services/adminServiceApi"

import "./AdminServices.css"

const emptyForm = {
  name: "",
  categoryId: "",
  price: "",
  duration: "",
  status: "Hoạt động",
  shortDescription: "",
  detailDescription: "",
  images: [],
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const getPlainTextFromHtml = (html = "") => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
}

const getServiceImages = (service) => {
  return Array.isArray(service?.images) ? service.images : []
}

const getServiceRawImages = (service) => {
  return Array.isArray(service?.rawImages) ? service.rawImages : getServiceImages(service)
}

const getServiceCode = (service) => {
  return service?.maDV || service?.id || `DV${service?.idDichVu || ""}`
}

const isActiveStatus = (status) => {
  return status === "Hoạt động"
}

const getServiceSortNumber = (service) => {
  const code = getServiceCode(service)
  const numberText = String(code).replace(/\D/g, "")

  return Number(numberText || service?.idDichVu || 0)
}

const getServiceCreatedAtTimestamp = (service) => {
  const createdAt = service?.createdAt

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

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)
  const [isEmpty, setIsEmpty] = useState(!getPlainTextFromHtml(value || ""))

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
      setIsEmpty(!getPlainTextFromHtml(value || ""))
    }
  }, [value])

  const updateValue = () => {
    const html = editorRef.current?.innerHTML || ""
    setIsEmpty(!getPlainTextFromHtml(html))
    onChange(html)
  }

  const runCommand = (command) => {
    editorRef.current?.focus()
    document.execCommand(command, false, null)
    updateValue()
  }

  return (
    <div className="admin-rich-editor-wrapper">
      <div className="admin-rich-toolbar">
        <button
          type="button"
          title="In đậm"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("bold")
          }}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          title="In nghiêng"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("italic")
          }}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          title="Gạch chân"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("underline")
          }}
        >
          <Underline size={16} />
        </button>

        <span className="admin-rich-divider"></span>

        <button
          type="button"
          title="Danh sách chấm"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("insertUnorderedList")
          }}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          title="Danh sách số"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("insertOrderedList")
          }}
        >
          <ListOrdered size={16} />
        </button>

        <span className="admin-rich-divider"></span>

        <button
          type="button"
          title="Xoá định dạng"
          onMouseDown={(event) => {
            event.preventDefault()
            runCommand("removeFormat")
          }}
        >
          <Eraser size={16} />
        </button>
      </div>

      <div
        ref={editorRef}
        className={isEmpty ? "admin-rich-editor is-empty" : "admin-rich-editor"}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Nhập mô tả chi tiết dịch vụ..."
        onInput={updateValue}
        onBlur={updateValue}
      ></div>
    </div>
  )
}

function AdminServices() {
  const [services, setServices] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [priceFilter, setPriceFilter] = useState("Tất cả")
  const [durationFilter, setDurationFilter] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("default")

  const [selectedService, setSelectedService] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [formError, setFormError] = useState("")

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const toastTimeoutRef = useRef(null)

  const [warningDialog, setWarningDialog] = useState({
    open: false,
    title: "",
    message: "",
  })

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

  const fetchAdminServices = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const [serviceData, categoryData] = await Promise.all([
        getAdminServicesApi(),
        getServiceCategoriesApi(),
      ])

      setServices(Array.isArray(serviceData) ? serviceData : [])

      setCategoryOptions(
        Array.isArray(categoryData)
          ? categoryData.map((category) => ({
              id: String(category.id),
              idDanhMuc: Number(category.id),
              name: category.tenDM,
            }))
          : []
      )
    } catch (error) {
      setErrorMessage(error.message || "Không thể tải danh sách dịch vụ.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminServices()
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const filteredServices = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    const filtered = services.filter((service) => {
      const serviceCode = getServiceCode(service).toLowerCase()
      const serviceName = (service.name || "").toLowerCase()
      const categoryName = (service.categoryName || "").toLowerCase()

      const matchKeyword =
        !keyword ||
        serviceCode.includes(keyword) ||
        serviceName.includes(keyword) ||
        categoryName.includes(keyword)

      const matchCategory =
        categoryFilter === "Tất cả" ||
        String(service.categoryId) === String(categoryFilter)

      const matchStatus =
        statusFilter === "Tất cả" || service.status === statusFilter

      const matchPrice =
        priceFilter === "Tất cả" ||
        (priceFilter === "Dưới 500k" && Number(service.price) < 500000) ||
        (priceFilter === "500k - 1 triệu" &&
          Number(service.price) >= 500000 &&
          Number(service.price) <= 1000000) ||
        (priceFilter === "Trên 1 triệu" && Number(service.price) > 1000000)

      const matchDuration =
        durationFilter === "Tất cả" ||
        (durationFilter === "Dưới 60 phút" && Number(service.duration) < 60) ||
        (durationFilter === "60 - 90 phút" &&
          Number(service.duration) >= 60 &&
          Number(service.duration) <= 90) ||
        (durationFilter === "Trên 90 phút" && Number(service.duration) > 90)

      return (
        matchKeyword &&
        matchCategory &&
        matchStatus &&
        matchPrice &&
        matchDuration
      )
    })

    if (sortOption === "default") {
      return filtered
    }

    return [...filtered].sort((a, b) => {
      const codeA = getServiceSortNumber(a)
      const codeB = getServiceSortNumber(b)

      const nameA = (a.name || "").toLowerCase()
      const nameB = (b.name || "").toLowerCase()

      const createdAtA = getServiceCreatedAtTimestamp(a)
      const createdAtB = getServiceCreatedAtTimestamp(b)

      if (sortOption === "code-desc") {
        return codeB - codeA
      }

      if (sortOption === "code-asc") {
        return codeA - codeB
      }

      if (sortOption === "name-asc") {
        return nameA.localeCompare(nameB, "vi")
      }

      if (sortOption === "name-desc") {
        return nameB.localeCompare(nameA, "vi")
      }

      if (sortOption === "created-desc") {
        return createdAtB - createdAtA
      }

      if (sortOption === "created-asc") {
        return createdAtA - createdAtB
      }

      return 0
    })
  }, [
    services,
    searchText,
    categoryFilter,
    statusFilter,
    priceFilter,
    durationFilter,
    sortOption,
  ])

  const openWarningDialog = (title, message) => {
    setWarningDialog({
      open: true,
      title,
      message,
    })
  }

  const closeWarningDialog = () => {
    setWarningDialog({
      open: false,
      title: "",
      message: "",
    })
  }

  const handleChangeForm = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (formError) setFormError("")
  }

  const handleResetFilter = () => {
    setSearchText("")
    setCategoryFilter("Tất cả")
    setStatusFilter("Tất cả")
    setPriceFilter("Tất cả")
    setDurationFilter("Tất cả")
    setSortOption("default")
  }

  const handleOpenCreateForm = () => {
    setEditingService(null)
    setFormData({ ...emptyForm })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (service) => {
    setEditingService(service)

    setFormData({
      name: service.name || "",
      categoryId: String(service.categoryId || ""),
      price: service.price || "",
      duration: service.duration || "",
      status: service.status || "Hoạt động",
      shortDescription: service.shortDescription || "",
      detailDescription: service.detailDescription || "",
      images: [...getServiceRawImages(service)],
    })

    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    if (isSaving || isUploading) return

    setIsFormOpen(false)
    setEditingService(null)
    setFormError("")
  }

  const handleAddImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    const maxSize = 5 * 1024 * 1024

    if (selectedFiles.length === 0) return

    if (selectedFiles.some((file) => !file.type.startsWith("image/"))) {
      setFormError("Ảnh không hợp lệ. Vui lòng chọn file hình ảnh.")
      event.target.value = ""
      return
    }

    if (selectedFiles.some((file) => file.size > maxSize)) {
      setFormError("Mỗi ảnh không được vượt quá 5MB.")
      event.target.value = ""
      return
    }

    if (formData.images.length + selectedFiles.length > 5) {
      setFormError("Mỗi dịch vụ chỉ được tải tối đa 5 ảnh.")
      event.target.value = ""
      return
    }

    try {
      setIsUploading(true)
      setFormError("")

      const uploadedImages = await uploadAdminServiceImagesApi(selectedFiles)

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }))
    } catch (error) {
      setFormError(error.message || "Không thể tải ảnh dịch vụ.")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  const handleRemoveImage = (removeIndex) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== removeIndex),
    }))
  }

  const handleSaveService = async () => {
    const trimmedName = formData.name.trim()
    const trimmedShortDescription = formData.shortDescription.trim()
    const trimmedDetailDescription = getPlainTextFromHtml(
      formData.detailDescription
    )

    const priceValue = Number(formData.price)
    const durationValue = Number(formData.duration)

    if (!trimmedName) {
      setFormError("Vui lòng nhập tên dịch vụ.")
      return
    }

    if (!formData.categoryId) {
      setFormError("Vui lòng chọn danh mục dịch vụ.")
      return
    }

    if (!priceValue || priceValue <= 0) {
      setFormError("Giá dịch vụ phải lớn hơn 0.")
      return
    }

    if (!durationValue || durationValue <= 0) {
      setFormError("Thời gian thực hiện phải lớn hơn 0.")
      return
    }

    if (!trimmedShortDescription) {
      setFormError("Vui lòng nhập mô tả ngắn của dịch vụ.")
      return
    }

    if (!trimmedDetailDescription) {
      setFormError("Vui lòng nhập mô tả chi tiết của dịch vụ.")
      return
    }

    if (formData.images.length < 3 || formData.images.length > 5) {
      setFormError("Vui lòng tải từ 3 đến 5 ảnh cho dịch vụ.")
      return
    }

    const selectedCategory = categoryOptions.find(
      (category) => String(category.id) === String(formData.categoryId)
    )

    if (!selectedCategory) {
      setFormError("Danh mục không tồn tại. Vui lòng chọn lại danh mục.")
      return
    }

    const payload = {
      idDanhMuc: Number(formData.categoryId),
      tenDV: trimmedName,
      moTaNgan: trimmedShortDescription,
      moTaChiTiet: formData.detailDescription,
      gia: priceValue,
      thoiLuongPhut: durationValue,
      trangThai: formData.status,
      images: formData.images,
    }

    try {
      setIsSaving(true)
      setFormError("")

    if (editingService) {
      const updatedService = await updateAdminServiceApi(
        editingService.idDichVu,
        payload
      )

      setServices((prev) =>
        prev.map((service) =>
          service.idDichVu === updatedService.idDichVu
            ? updatedService
            : service
        )
      )

      showToast({
        type: "success",
        title: "Cập nhật thành công",
        message: "Thông tin dịch vụ đã được cập nhật.",
      })
    } else {
      const createdService = await createAdminServiceApi(payload)

      setServices((prev) => [createdService, ...prev])

      showToast({
        type: "success",
        title: "Thêm thành công",
        message: "Dịch vụ mới đã được thêm vào hệ thống.",
      })
    }

    setIsFormOpen(false)
    setEditingService(null)
    setFormError("")
    } catch (error) {
      const message = error.message || "Không thể lưu dịch vụ."

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

  const handleOpenDetailService = async (service) => {
    try {
      const detail = await getAdminServiceDetailApi(service.idDichVu)
      setSelectedService(detail)
    } catch {
      setSelectedService(service)
    }
  }

  const handleRequestDelete = (service) => {
    if (service.isUsedInAppointments) {
      openWarningDialog(
        "Không thể xoá dịch vụ",
        `Dịch vụ "${service.name}" đã phát sinh lịch hẹn hoặc hoá đơn. Bạn không nên xoá dịch vụ này, hãy giữ trạng thái "Ngừng cung cấp" để bảo toàn lịch sử.`
      )
      return
    }

    if (service.status === "Hoạt động") {
      openWarningDialog(
        "Dịch vụ đang hoạt động",
        `Dịch vụ "${service.name}" hiện đang ở trạng thái hoạt động. Bạn nên chuyển trạng thái sang "Ngừng hoạt động" trước khi xoá để đảm bảo dữ liệu được quản lý an toàn.`
      )
      return
    }

    setDeleteTarget(service)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setIsSaving(true)

      await deleteAdminServiceApi(deleteTarget.idDichVu)

      setServices((prev) =>
        prev.filter((service) => service.idDichVu !== deleteTarget.idDichVu)
      )

      setDeleteTarget(null)

      showToast({
        type: "success",
        title: "Xoá thành công",
        message: "Dịch vụ đã được xoá khỏi danh sách.",
      })
    } catch (error) {
      const message = error.message || "Dịch vụ này chưa thể xoá khỏi hệ thống."

      showToast({
        type: "error",
        title: "Xoá thất bại",
        message,
      })

      openWarningDialog("Không thể xoá dịch vụ", message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-services-page">
        <section className="admin-services-card">
          <div className="admin-service-empty-state">
            <Loader2 size={20} />
            Đang tải danh sách dịch vụ...
          </div>
        </section>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="admin-services-page">
        <section className="admin-services-card">
          <div className="admin-service-empty-state">
            <p>{errorMessage}</p>

            <button
              type="button"
              className="admin-service-reset-btn"
              onClick={fetchAdminServices}
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
    <div className="admin-services-page">
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

      <section className="admin-services-toolbar">
        <div className="admin-services-toolbar-left">
          <div className="admin-services-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm kiếm mã, tên dịch vụ..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <button
            type="button"
            className={
              isFilterOpen
                ? "admin-services-filter-btn active"
                : "admin-services-filter-btn"
            }
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            <Filter size={18} strokeWidth={2.3} />
            Lọc
          </button>

          <div className="admin-services-sort">
            <label>
              <ArrowUpDown size={15} />
              Sắp xếp
            </label>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="default">Mặc định</option>
              <option value="code-desc">Mã DV giảm dần</option>
              <option value="code-asc">Mã DV tăng dần</option>
              <option value="name-asc">Tên A - Z</option>
              <option value="name-desc">Tên Z - A</option>
              <option value="created-desc">Ngày tạo mới nhất</option>
              <option value="created-asc">Ngày tạo cũ nhất</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="admin-service-primary-btn"
          onClick={handleOpenCreateForm}
        >
          <Plus size={18} />
          Thêm dịch vụ
        </button>
      </section>

      {isFilterOpen && (
        <section className="admin-services-filter-panel">
          <div className="admin-service-filter-group">
            <label>Danh mục</label>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>Tất cả</option>

              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-service-filter-group">
            <label>Trạng thái</label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Tạm ẩn</option>
              <option>Ngừng cung cấp</option>
            </select>
          </div>

          <div className="admin-service-filter-group">
            <label>Khoảng giá</label>

            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Dưới 500k</option>
              <option>500k - 1 triệu</option>
              <option>Trên 1 triệu</option>
            </select>
          </div>

          <div className="admin-service-filter-group">
            <label>Thời gian</label>

            <select
              value={durationFilter}
              onChange={(event) => setDurationFilter(event.target.value)}
            >
              <option>Tất cả</option>
              <option>Dưới 60 phút</option>
              <option>60 - 90 phút</option>
              <option>Trên 90 phút</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-service-reset-btn"
            onClick={handleResetFilter}
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
        </section>
      )}

      <section className="admin-services-card">
        <div className="admin-services-result-bar">
          <div>
            <h3>Danh sách dịch vụ</h3>

            <p>
              Hiển thị <strong>{filteredServices.length}</strong> dịch vụ
            </p>
          </div>
        </div>

        <div className="admin-services-table-wrapper">
          <table className="admin-services-table">
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Danh mục</th>
                <th>Giá dịch vụ</th>
                <th>Thời gian</th>
                <th>Ảnh</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => {
                  const images = getServiceImages(service)
                  const mainImage = images[0] || getServiceRawImages(service)[0]

                  return (
                    <tr key={service.idDichVu || service.id}>
                      <td>
                        <div className="admin-service-name-cell">
                          {mainImage ? (
                            <img
                              src={toAbsoluteFileUrl(mainImage)}
                              alt={service.name}
                            />
                          ) : (
                            <div className="admin-service-no-image">
                              <ImageIcon size={18} />
                            </div>
                          )}

                          <div>
                            <h4>{service.name}</h4>
                            <p>{getServiceCode(service)}</p>
                          </div>
                        </div>
                      </td>

                      <td>{service.categoryName}</td>

                      <td className="admin-service-price">
                        {formatMoney(service.price)}
                      </td>

                      <td>
                        <div className="admin-service-duration">
                          <Clock3 size={15} />
                          {service.duration} phút
                        </div>
                      </td>

                      <td>
                        <span className="admin-service-image-count">
                          {images.length} ảnh
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isActiveStatus(service.status)
                              ? "admin-service-status active"
                              : "admin-service-status inactive"
                          }
                        >
                          {service.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-service-actions">
                          <button
                            type="button"
                            className="admin-service-action-btn view"
                            onClick={() => handleOpenDetailService(service)}
                            title="Xem chi tiết"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="admin-service-action-btn edit"
                            onClick={() => handleOpenEditForm(service)}
                            title="Chỉnh sửa"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="admin-service-action-btn delete"
                            onClick={() => handleRequestDelete(service)}
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
                  <td colSpan="7">
                    <div className="admin-service-empty-state">
                      Chưa có dịch vụ nào phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedService && (
        <div
          className="admin-service-modal-overlay"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="admin-service-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-service-modal-header">
              <div>
                <h2>Chi tiết dịch vụ</h2>
                <p>{getServiceCode(selectedService)}</p>
              </div>

              <button
                type="button"
                className="admin-service-close-btn"
                onClick={() => setSelectedService(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-service-detail-body">
              <div className="admin-service-detail-hero">
                <div>
                  <h3>{selectedService.name}</h3>
                  <p>{selectedService.shortDescription}</p>
                </div>

                <span
                  className={
                    isActiveStatus(selectedService.status)
                      ? "admin-service-status active"
                      : "admin-service-status inactive"
                  }
                >
                  {selectedService.status}
                </span>
              </div>

              <div className="admin-service-gallery">
                {getServiceImages(selectedService).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={toAbsoluteFileUrl(image)}
                    alt={`${selectedService.name} ${index + 1}`}
                  />
                ))}
              </div>

              <div className="admin-service-detail-grid">
                <div className="admin-service-detail-box">
                  <span>Mã dịch vụ</span>
                  <strong>{getServiceCode(selectedService)}</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Danh mục</span>
                  <strong>{selectedService.categoryName}</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Giá dịch vụ</span>
                  <strong>{formatMoney(selectedService.price)}</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Thời gian</span>
                  <strong>{selectedService.duration} phút</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Số ảnh</span>
                  <strong>{getServiceImages(selectedService).length} ảnh</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Ngày tạo</span>
                  <strong>{selectedService.createdAt || "Chưa cập nhật"}</strong>
                </div>
              </div>

              <div className="admin-service-description-box">
                <h3>Mô tả chi tiết</h3>

                <div
                  className="admin-service-description-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedService.detailDescription,
                  }}
                ></div>
              </div>
            </div>

            <div className="admin-service-modal-actions">
              <button
                type="button"
                className="admin-service-cancel-btn"
                onClick={() => setSelectedService(null)}
              >
                Đóng
              </button>

              <button
                type="button"
                className="admin-service-primary-btn"
                onClick={() => {
                  handleOpenEditForm(selectedService)
                  setSelectedService(null)
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
        <div className="admin-service-modal-overlay" onClick={handleCloseForm}>
          <div
            className="admin-service-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-service-modal-header">
              <div>
                <h2>{editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}</h2>

                <p>
                  {editingService
                    ? "Cập nhật thông tin dịch vụ làm đẹp"
                    : "Nhập thông tin để tạo dịch vụ mới"}
                </p>
              </div>

              <button
                type="button"
                className="admin-service-close-btn"
                onClick={handleCloseForm}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-service-form-body">
              {formError && (
                <div className="admin-service-form-error">
                  <AlertTriangle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-service-form-grid">
                <div className="admin-service-form-group">
                  <label>Tên dịch vụ</label>

                  <input
                    type="text"
                    placeholder="Nhập tên dịch vụ"
                    value={formData.name}
                    onChange={(event) =>
                      handleChangeForm("name", event.target.value)
                    }
                  />
                </div>

                <div className="admin-service-form-group">
                  <label>Danh mục</label>

                  <select
                    value={formData.categoryId}
                    onChange={(event) =>
                      handleChangeForm("categoryId", event.target.value)
                    }
                  >
                    <option value="">Chọn danh mục</option>

                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-service-form-group">
                  <label>Giá dịch vụ</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="Nhập giá dịch vụ"
                    value={formData.price}
                    onChange={(event) =>
                      handleChangeForm("price", event.target.value)
                    }
                  />
                </div>

                <div className="admin-service-form-group">
                  <label>Thời gian thực hiện</label>

                  <input
                    type="number"
                    min="0"
                    placeholder="Số phút"
                    value={formData.duration}
                    onChange={(event) =>
                      handleChangeForm("duration", event.target.value)
                    }
                  />
                </div>

                <div className="admin-service-form-group">
                  <label>Trạng thái</label>

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      handleChangeForm("status", event.target.value)
                    }
                  >
                    <option>Hoạt động</option>
                    <option>Tạm ẩn</option>
                    <option>Ngừng cung cấp</option>
                  </select>
                </div>
              </div>

              <div className="admin-service-form-group">
                <label>Mô tả ngắn</label>

                <input
                  type="text"
                  placeholder="Ví dụ: Làm sạch sâu, tẩy tế bào chết và cấp ẩm phục hồi da"
                  value={formData.shortDescription}
                  onChange={(event) =>
                    handleChangeForm("shortDescription", event.target.value)
                  }
                />
              </div>

              <div className="admin-service-form-group">
                <label>Mô tả chi tiết</label>

                <RichTextEditor
                  value={formData.detailDescription}
                  onChange={(value) =>
                    handleChangeForm("detailDescription", value)
                  }
                />
              </div>

              <div className="admin-service-form-group">
                <label>Hình ảnh dịch vụ</label>

                <label className="admin-service-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    disabled={isUploading}
                  />

                  {isUploading ? <Loader2 size={20} /> : <Upload size={20} />}

                  <div>
                    <strong>
                      {isUploading ? "Đang tải ảnh lên..." : "Tải ảnh dịch vụ"}
                    </strong>

                    <p>Chọn từ 3 đến 5 ảnh, mỗi ảnh tối đa 5MB</p>
                  </div>
                </label>

                <div className="admin-service-image-preview-grid">
                  {formData.images.map((image, index) => (
                    <div
                      className="admin-service-preview-item"
                      key={`${image}-${index}`}
                    >
                      <img
                        src={toAbsoluteFileUrl(image)}
                        alt={`Ảnh ${index + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isUploading || isSaving}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  {formData.images.length === 0 && (
                    <div className="admin-service-no-image">
                      <ImageIcon size={22} />
                      Chưa có ảnh nào
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-service-modal-actions">
              <button
                type="button"
                className="admin-service-cancel-btn"
                onClick={handleCloseForm}
                disabled={isSaving || isUploading}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-service-primary-btn"
                onClick={handleSaveService}
                disabled={isSaving || isUploading}
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
          className="admin-service-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="admin-service-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-service-delete-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Xác nhận xoá dịch vụ</h2>

            <p>
              Bạn có chắc chắn muốn xoá dịch vụ{" "}
              <strong>{deleteTarget.name}</strong> không? Thao tác này không thể
              hoàn tác.
            </p>

            <div className="admin-service-delete-actions">
              <button
                type="button"
                className="admin-service-cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={isSaving}
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-service-danger-btn"
                onClick={handleConfirmDelete}
                disabled={isSaving}
              >
                {isSaving ? "Đang xoá..." : "Xoá dịch vụ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {warningDialog.open && (
        <div className="admin-service-modal-overlay" onClick={closeWarningDialog}>
          <div
            className="admin-service-warning-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-service-modal-header">
              <div>
                <h2>{warningDialog.title}</h2>
                <p>Thông báo từ hệ thống</p>
              </div>

              <button
                type="button"
                className="admin-service-warning-close"
                onClick={closeWarningDialog}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-service-warning-body">
              <div className="admin-service-warning-icon">
                <AlertTriangle size={26} />
              </div>

              <p>{warningDialog.message}</p>
            </div>

            <div className="admin-service-warning-actions">
              <button
                type="button"
                className="admin-service-primary-btn"
                onClick={closeWarningDialog}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices
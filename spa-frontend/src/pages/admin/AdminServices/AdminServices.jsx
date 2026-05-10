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
} from "lucide-react"
import "./AdminServices.css"

const categoryOptions = [
  { id: "DM001", name: "Chăm sóc da mặt" },
  { id: "DM002", name: "Massage Body" },
  { id: "DM003", name: "Tắm trắng" },
  { id: "DM004", name: "Triệt lông" },
]

const initialServices = [
  {
    id: "DV001",
    name: "Chăm sóc da mặt cơ bản",
    categoryId: "DM001",
    categoryName: "Chăm sóc da mặt",
    price: 350000,
    duration: 60,
    status: "Hoạt động",
    createdAt: "01/01/2023",
    shortDescription: "Làm sạch da, cấp ẩm và chăm sóc da mặt cơ bản.",
    detailDescription: `
      <p>Dịch vụ chăm sóc da mặt cơ bản là liệu trình hỗ trợ <strong>làm sạch da</strong>, <em>cấp ẩm</em> và chăm sóc phục hồi da.</p>
      <p><strong>Công dụng dịch vụ:</strong></p>
      <ul>
        <li>Hỗ trợ <strong>làm sạch bề mặt da</strong>.</li>
        <li>Hỗ trợ <em>cấp ẩm</em> và làm mềm da.</li>
        <li>Phù hợp với nhu cầu chăm sóc da định kỳ.</li>
      </ul>
      <p><strong>Đối tượng phù hợp:</strong></p>
      <ul>
        <li>Khách hàng muốn chăm sóc da cơ bản.</li>
        <li>Khách hàng có làn da khô hoặc thiếu ẩm.</li>
      </ul>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Nên trao đổi tình trạng da trước khi thực hiện.</li>
        <li>Cần tuân thủ hướng dẫn chăm sóc sau liệu trình nếu có.</li>
      </ul>
    `,
    isUsedInAppointments: true,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "DV002",
    name: "Điều trị mụn chuyên sâu",
    categoryId: "DM001",
    categoryName: "Chăm sóc da mặt",
    price: 850000,
    duration: 90,
    status: "Hoạt động",
    createdAt: "05/01/2023",
    shortDescription: "Làm sạch sâu, hỗ trợ cải thiện mụn và phục hồi da.",
    detailDescription: `
      <p>Dịch vụ điều trị mụn chuyên sâu là liệu trình hỗ trợ <strong>làm sạch sâu</strong>, xử lý bã nhờn, làm dịu da và hỗ trợ cải thiện tình trạng mụn.</p>
      <p><strong>Công dụng dịch vụ:</strong></p>
      <ul>
        <li>Hỗ trợ <strong>làm sạch sâu lỗ chân lông</strong>.</li>
        <li>Hỗ trợ giảm dầu thừa và bã nhờn trên da.</li>
        <li>Góp phần cải thiện tình trạng da mụn.</li>
        <li>Hỗ trợ phục hồi và làm dịu da sau liệu trình.</li>
      </ul>
      <p><strong>Đối tượng phù hợp:</strong></p>
      <ul>
        <li>Khách hàng có da dầu, da mụn hoặc dễ bít tắc lỗ chân lông.</li>
        <li>Khách hàng cần chăm sóc da chuyên sâu theo định kỳ.</li>
      </ul>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Nên trao đổi tình trạng da trước khi thực hiện.</li>
        <li>Không tự ý nặn mụn sau liệu trình.</li>
      </ul>
    `,
    isUsedInAppointments: true,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "DV003",
    name: "Massage Body Thái",
    categoryId: "DM002",
    categoryName: "Massage Body",
    price: 500000,
    duration: 90,
    status: "Hoạt động",
    createdAt: "10/01/2023",
    shortDescription: "Thư giãn toàn thân, giảm căng cơ và mệt mỏi.",
    detailDescription: `
      <p>Massage Body Thái là liệu trình massage toàn thân giúp <em>thư giãn cơ thể</em>, hỗ trợ giảm căng cơ và tạo cảm giác thoải mái sau ngày dài.</p>
      <p><strong>Công dụng dịch vụ:</strong></p>
      <ul>
        <li>Hỗ trợ thư giãn toàn thân.</li>
        <li>Hỗ trợ <strong>giảm căng cơ</strong> vùng vai, lưng và chân.</li>
        <li>Góp phần cải thiện cảm giác mệt mỏi.</li>
      </ul>
      <p><strong>Đối tượng phù hợp:</strong></p>
      <ul>
        <li>Khách hàng thường xuyên căng thẳng, mệt mỏi.</li>
        <li>Khách hàng muốn thư giãn và chăm sóc cơ thể định kỳ.</li>
      </ul>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Nên thông báo cho nhân viên nếu có vùng cơ thể đau hoặc nhạy cảm.</li>
        <li>Không nên sử dụng dịch vụ ngay sau khi ăn quá no.</li>
      </ul>
    `,
    isUsedInAppointments: false,
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop",
    ],
  },
  {
    id: "DV004",
    name: "Tắm trắng phi thuyền",
    categoryId: "DM003",
    categoryName: "Tắm trắng",
    price: 1200000,
    duration: 120,
    status: "Ngừng hoạt động",
    createdAt: "15/01/2023",
    shortDescription: "Hỗ trợ làm sáng da toàn thân bằng công nghệ phi thuyền.",
    detailDescription: `
      <p>Tắm trắng phi thuyền là liệu trình chăm sóc body hỗ trợ <strong>làm sáng</strong> và cải thiện sắc da toàn thân theo quy trình an toàn.</p>
      <p><strong>Công dụng dịch vụ:</strong></p>
      <ul>
        <li>Hỗ trợ làm sáng da toàn thân.</li>
        <li>Hỗ trợ cấp ẩm và làm mềm da.</li>
        <li>Góp phần cải thiện vùng da xỉn màu.</li>
      </ul>
      <p><strong>Đối tượng phù hợp:</strong></p>
      <ul>
        <li>Khách hàng có nhu cầu chăm sóc và làm sáng da body.</li>
        <li>Khách hàng có làn da khô, thiếu ẩm hoặc không đều màu.</li>
      </ul>
      <p><strong>Lưu ý:</strong></p>
      <ul>
        <li>Nên trao đổi tình trạng da trước khi thực hiện.</li>
        <li>Cần chống nắng và dưỡng ẩm sau liệu trình.</li>
        <li>Không sử dụng dịch vụ khi da đang bị kích ứng nặng.</li>
      </ul>
    `,
    isUsedInAppointments: false,
    images: [
      "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop",
    ],
  },
]

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

const formatMoney = (value) => `${Number(value).toLocaleString("vi-VN")} đ`

const getTodayText = () => new Date().toLocaleDateString("vi-VN")

const createNextServiceId = (services) => {
  const maxNumber = services.reduce((max, service) => {
    const number = Number(service.id.replace("DV", ""))
    return Number.isNaN(number) ? max : Math.max(max, number)
  }, 0)

  return `DV${String(maxNumber + 1).padStart(3, "0")}`
}

const getPlainTextFromHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
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
  const [services, setServices] = useState(initialServices)
  const [searchText, setSearchText] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState("Tất cả")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [priceFilter, setPriceFilter] = useState("Tất cả")
  const [durationFilter, setDurationFilter] = useState("Tất cả")

  const [selectedService, setSelectedService] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ ...emptyForm })
  const [formError, setFormError] = useState("")

  const [warningDialog, setWarningDialog] = useState({
    open: false,
    title: "",
    message: "",
  })

  const filteredServices = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return services.filter((service) => {
      const matchKeyword =
        service.id.toLowerCase().includes(keyword) ||
        service.name.toLowerCase().includes(keyword)

      const matchCategory =
        categoryFilter === "Tất cả" || service.categoryId === categoryFilter

      const matchStatus =
        statusFilter === "Tất cả" || service.status === statusFilter

      const matchPrice =
        priceFilter === "Tất cả" ||
        (priceFilter === "Dưới 500k" && service.price < 500000) ||
        (priceFilter === "500k - 1 triệu" &&
          service.price >= 500000 &&
          service.price <= 1000000) ||
        (priceFilter === "Trên 1 triệu" && service.price > 1000000)

      const matchDuration =
        durationFilter === "Tất cả" ||
        (durationFilter === "Dưới 60 phút" && service.duration < 60) ||
        (durationFilter === "60 - 90 phút" &&
          service.duration >= 60 &&
          service.duration <= 90) ||
        (durationFilter === "Trên 90 phút" && service.duration > 90)

      return (
        matchKeyword &&
        matchCategory &&
        matchStatus &&
        matchPrice &&
        matchDuration
      )
    })
  }, [
    services,
    searchText,
    categoryFilter,
    statusFilter,
    priceFilter,
    durationFilter,
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
      name: service.name,
      categoryId: service.categoryId,
      price: service.price,
      duration: service.duration,
      status: service.status,
      shortDescription: service.shortDescription,
      detailDescription: service.detailDescription,
      images: [...service.images],
    })
    setFormError("")
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingService(null)
    setFormError("")
  }

  const handleAddImages = (event) => {
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

    const newImages = selectedFiles.map((file) => URL.createObjectURL(file))
    const nextImages = [...formData.images, ...newImages]

    if (nextImages.length > 5) {
      setFormError("Mỗi dịch vụ chỉ được tải tối đa 5 ảnh.")
      event.target.value = ""
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: nextImages,
    }))

    setFormError("")
    event.target.value = ""
  }

  const handleRemoveImage = (removeIndex) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== removeIndex),
    }))
  }

  const handleSaveService = () => {
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

    const isDuplicateName = services.some((service) => {
      const sameName =
        service.name.trim().toLowerCase() === trimmedName.toLowerCase()

      return editingService
        ? sameName && service.id !== editingService.id
        : sameName
    })

    if (isDuplicateName) {
      setFormError("Tên dịch vụ đã tồn tại. Vui lòng nhập tên khác.")
      return
    }

    const selectedCategory = categoryOptions.find(
      (category) => category.id === formData.categoryId
    )

    if (!selectedCategory) {
      setFormError("Danh mục không tồn tại. Vui lòng chọn lại danh mục.")
      return
    }

    if (editingService) {
      setServices((prev) =>
        prev.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                name: trimmedName,
                categoryId: selectedCategory.id,
                categoryName: selectedCategory.name,
                price: priceValue,
                duration: durationValue,
                status: formData.status,
                shortDescription: trimmedShortDescription,
                detailDescription: formData.detailDescription,
                images: formData.images,
              }
            : service
        )
      )
    } else {
      const newService = {
        id: createNextServiceId(services),
        name: trimmedName,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        price: priceValue,
        duration: durationValue,
        status: formData.status,
        shortDescription: trimmedShortDescription,
        detailDescription: formData.detailDescription,
        createdAt: getTodayText(),
        isUsedInAppointments: false,
        images: formData.images,
      }

      setServices((prev) => [newService, ...prev])
    }

    handleCloseForm()
  }

  const handleRequestDelete = (service) => {
    if (service.isUsedInAppointments) {
      openWarningDialog(
        "Không thể xoá dịch vụ",
        `Dịch vụ "${service.name}" hiện đang được sử dụng trong lịch hẹn. Bạn cần xử lý hoặc hoàn tất các lịch hẹn liên quan trước khi xoá dịch vụ này.`
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

  const handleConfirmDelete = () => {
    if (!deleteTarget) return

    setServices((prev) =>
      prev.filter((service) => service.id !== deleteTarget.id)
    )

    setDeleteTarget(null)
  }

  return (
    <div className="admin-services-page">
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
              <option>Ngừng hoạt động</option>
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
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="admin-service-name-cell">
                        <img src={service.images[0]} alt={service.name} />
                        <div>
                          <h4>{service.name}</h4>
                          <p>{service.id}</p>
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
                        {service.images.length} ảnh
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          service.status === "Hoạt động"
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
                          onClick={() => setSelectedService(service)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-service-action-btn edit"
                          onClick={() => handleOpenEditForm(service)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="admin-service-action-btn delete"
                          onClick={() => handleRequestDelete(service)}
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
                <p>{selectedService.id}</p>
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
                    selectedService.status === "Hoạt động"
                      ? "admin-service-status active"
                      : "admin-service-status inactive"
                  }
                >
                  {selectedService.status}
                </span>
              </div>

              <div className="admin-service-gallery">
                {selectedService.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${selectedService.name} ${index + 1}`}
                  />
                ))}
              </div>

              <div className="admin-service-detail-grid">
                <div className="admin-service-detail-box">
                  <span>Mã dịch vụ</span>
                  <strong>{selectedService.id}</strong>
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
                  <strong>{selectedService.images.length} ảnh</strong>
                </div>

                <div className="admin-service-detail-box">
                  <span>Ngày tạo</span>
                  <strong>{selectedService.createdAt}</strong>
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
                    <option>Ngừng hoạt động</option>
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
                  />
                  <Upload size={20} />
                  <div>
                    <strong>Tải ảnh dịch vụ</strong>
                    <p>Chọn từ 3 đến 5 ảnh, mỗi ảnh tối đa 5MB</p>
                  </div>
                </label>

                <div className="admin-service-image-preview-grid">
                  {formData.images.map((image, index) => (
                    <div
                      className="admin-service-preview-item"
                      key={`${image}-${index}`}
                    >
                      <img src={image} alt={`Ảnh ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-service-primary-btn"
                onClick={handleSaveService}
              >
                <Save size={17} />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {warningDialog.open && (
        <div
          className="admin-service-modal-overlay"
          onClick={closeWarningDialog}
        >
          <div
            className="admin-service-warning-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-service-warning-close"
              onClick={closeWarningDialog}
            >
              <X size={18} />
            </button>

            <div className="admin-service-warning-icon">
              <AlertTriangle size={28} />
            </div>

            <span className="admin-service-warning-badge">Cảnh báo</span>

            <h2>{warningDialog.title}</h2>
            <p>{warningDialog.message}</p>

            <div className="admin-service-warning-actions">
              <button
                type="button"
                className="admin-service-cancel-btn"
                onClick={closeWarningDialog}
              >
                Đóng
              </button>

              <button
                type="button"
                className="admin-service-primary-btn"
                onClick={closeWarningDialog}
              >
                Tôi đã hiểu
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
              >
                Huỷ
              </button>

              <button
                type="button"
                className="admin-service-danger-btn"
                onClick={handleConfirmDelete}
              >
                Xoá dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices
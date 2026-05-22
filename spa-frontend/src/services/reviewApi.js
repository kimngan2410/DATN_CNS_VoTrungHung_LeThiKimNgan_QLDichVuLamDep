const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export const createReviewApi = async ({
  idTaiKhoan,
  idChiTietLH,
  soSao,
  noiDung,
  images = [],
}) => {
  const formData = new FormData()

  formData.append("idTaiKhoan", String(idTaiKhoan))
  formData.append("idChiTietLH", String(idChiTietLH))
  formData.append("soSao", String(soSao))
  formData.append("noiDung", noiDung || "")

  images.forEach((image) => {
    if (image?.file) {
      formData.append("images", image.file)
    }
  })

  const response = await fetch(`${API_BASE_URL}/danh-gia/`, {
    method: "POST",
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.detail || "Không thể gửi đánh giá dịch vụ.")
  }

  return data
}

export const updateReviewApi = async ({
  idDanhGia,
  idTaiKhoan,
  soSao,
  noiDung,
  images = [],
}) => {
  const formData = new FormData()

  formData.append("idTaiKhoan", String(idTaiKhoan))
  formData.append("soSao", String(soSao))
  formData.append("noiDung", noiDung || "")

  images.forEach((image) => {
    if (image?.file) {
      formData.append("images", image.file)
      return
    }

    const imageUrl = typeof image === "string" ? image : image?.url

    if (imageUrl) {
      formData.append("keptImages", imageUrl)
    }
  })

  const response = await fetch(`${API_BASE_URL}/danh-gia/${idDanhGia}`, {
    method: "PATCH",
    body: formData,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.detail || "Không thể cập nhật đánh giá dịch vụ.")
  }

  return data
}
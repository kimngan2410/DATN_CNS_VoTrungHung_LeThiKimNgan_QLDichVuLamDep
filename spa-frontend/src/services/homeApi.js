const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

function getFullImageUrl(image) {
  if (!image) return ""

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image
  }

  if (image.startsWith("/uploads")) {
    return `${API_ORIGIN}${image}`
  }

  return image
}

async function handleResponse(response, defaultMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.detail || defaultMessage)
  }

  return data
}

function normalizeHomeService(service) {
  return {
    ...service,
    id: service.id,
    title: service.title || service.tenDV || "Dịch vụ",
    name: service.title || service.tenDV || "Dịch vụ",
    category: service.category || "Dịch vụ",
    description: service.description || "",
    price: Number(service.price || 0),
    duration: Number(service.duration || 0),
    image: getFullImageUrl(service.image || ""),
    isActive: service.isActive !== false,
    isFeatured: true,
  }
}

function normalizeTestimonial(item) {
  return {
    ...item,
    id: item.id,
    name: item.customerName || "Khách hàng",
    customerName: item.customerName || "Khách hàng",
    avatar: getFullImageUrl(item.avatar || ""),
    rating: Number(item.rating || 5),
    content: item.content || "",
    createdAt: item.createdAt || "",
  }
}

export async function getHomeDataApi() {
  const response = await fetch(`${API_BASE_URL}/home`)

  const data = await handleResponse(response, "Không thể tải dữ liệu trang chủ")

  return {
    newServices: (data.newServices || []).map(normalizeHomeService),
    categories: data.categories || [],
    testimonials: (data.testimonials || []).map(normalizeTestimonial),
  }
}
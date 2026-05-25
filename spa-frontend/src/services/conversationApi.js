import {
  getCustomerAuthToken,
  getStaffAuthToken,
} from "./authApi"

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

function normalizeMessage(message) {
  return {
    ...message,
    id: message.idTinNhan || message.id,
    content: message.content || message.noiDung || "",
    sender: message.sender,
    time: message.time || "",
    createdAt: message.createdAt || "",
    idNguoiGuiTaiKhoan: message.idNguoiGuiTaiKhoan,
    daChinhSua: Boolean(message.daChinhSua),
    thoiGianChinhSua: message.thoiGianChinhSua || "",
    daThuHoi: Boolean(message.daThuHoi),
    thoiGianThuHoi: message.thoiGianThuHoi || "",
  }
}

function normalizeConversation(item) {
  return {
    ...item,
    id: item.idHoiThoai || item.id,
    avatar: getFullImageUrl(item.avatar || ""),
    messages: (item.messages || []).map(normalizeMessage),
  }
}

export async function getCustomerConversationApi(idTaiKhoan) {
  const token = getCustomerAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/hoi-thoai/customer/${idTaiKhoan}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  const data = await handleResponse(
    response,
    "Không thể tải hội thoại của khách hàng."
  )

  return normalizeConversation(data)
}

export async function sendCustomerMessageApi({ idTaiKhoan, noiDung }) {
  const token = getCustomerAuthToken()

  const response = await fetch(`${API_BASE_URL}/hoi-thoai/customer/tin-nhan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      idTaiKhoan,
      noiDung,
    }),
  })

  const data = await handleResponse(response, "Không thể gửi tin nhắn.")

  return {
    ...data,
    conversation: normalizeConversation(data.conversation),
    message: normalizeMessage(data.message),
  }
}

export async function getStaffConversationsApi() {
  const token = getStaffAuthToken()

  const response = await fetch(`${API_BASE_URL}/hoi-thoai/staff/danh-sach`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await handleResponse(
    response,
    "Không thể tải danh sách hội thoại."
  )

  return data.map(normalizeConversation)
}

export async function getStaffConversationDetailApi(idHoiThoai) {
  const token = getStaffAuthToken()

  const response = await fetch(`${API_BASE_URL}/hoi-thoai/staff/${idHoiThoai}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await handleResponse(
    response,
    "Không thể tải chi tiết hội thoại."
  )

  return normalizeConversation(data)
}

export async function sendStaffMessageApi({
  idHoiThoai,
  idTaiKhoan,
  noiDung,
}) {
  const token = getStaffAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/hoi-thoai/staff/${idHoiThoai}/tin-nhan`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        idTaiKhoan,
        noiDung,
      }),
    }
  )

  const data = await handleResponse(response, "Không thể gửi phản hồi.")

  return {
    ...data,
    conversation: normalizeConversation(data.conversation),
    message: normalizeMessage(data.message),
  }
}

export async function getCustomerUnreadCountApi(idTaiKhoan) {
  const token = getCustomerAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/hoi-thoai/customer/${idTaiKhoan}/unread-count`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )

  return handleResponse(response, "Không thể tải số tin nhắn chưa đọc.")
}

export async function getStaffUnreadCountApi() {
  const token = getStaffAuthToken()

  const response = await fetch(`${API_BASE_URL}/hoi-thoai/staff/unread-count`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return handleResponse(response, "Không thể tải số hội thoại chưa đọc.")
}

export async function updateConversationMessageApi({
  idTinNhan,
  idTaiKhoan,
  noiDung,
  actor = "customer",
}) {
  const token =
    actor === "staff" ? getStaffAuthToken() : getCustomerAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/hoi-thoai/tin-nhan/${idTinNhan}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        idTaiKhoan,
        noiDung,
      }),
    }
  )

  const data = await handleResponse(response, "Không thể sửa tin nhắn.")

  return {
    ...data,
    conversation: data.conversation
      ? normalizeConversation(data.conversation)
      : null,
    message: data.message ? normalizeMessage(data.message) : null,
  }
}

export async function recallConversationMessageApi({
  idTinNhan,
  idTaiKhoan,
  actor = "customer",
}) {
  const token =
    actor === "staff" ? getStaffAuthToken() : getCustomerAuthToken()

  const response = await fetch(
    `${API_BASE_URL}/hoi-thoai/tin-nhan/${idTinNhan}/thu-hoi`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        idTaiKhoan,
      }),
    }
  )

  const data = await handleResponse(response, "Không thể thu hồi tin nhắn.")

  return {
    ...data,
    conversation: data.conversation
      ? normalizeConversation(data.conversation)
      : null,
    message: data.message ? normalizeMessage(data.message) : null,
  }
}
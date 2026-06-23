import { getStaffAuthToken } from "./authApi";
import { getStaffConversationsApi } from "./conversationApi";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const getAuthToken = () => {
  return getStaffAuthToken();
};

async function handleResponse(response, defaultMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || defaultMessage);
  }

  return data;
}

// Lịch hẹn mới = chỉ đếm lịch đang Chờ xác nhận
export async function getPendingAppointmentCountApi() {
  const token = getAuthToken();

  const params = new URLSearchParams();
  params.set("trang_thai", "Chờ xác nhận");

  const response = await fetch(
    `${API_BASE_URL}/lich-hen/staff/danh-sach?${params.toString()}`,
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  const data = await handleResponse(
    response,
    "Không thể tải số lịch hẹn mới"
  );

  return Array.isArray(data) ? data.length : 0;
}

// Hội thoại mới = chỉ đếm hội thoại chưa trả lời
// Không cần backend unreplied-count riêng nữa
export async function getUnrepliedConversationCountApi() {
  const conversations = await getStaffConversationsApi();

  if (!Array.isArray(conversations)) return 0;

  return conversations.filter((conversation) => {
    const status = String(conversation.status || "").trim();
    const lastSender = String(conversation.lastSender || "").trim();

    return status === "unanswered" || lastSender === "customer";
  }).length;
}

export async function getStaffNotificationCountsApi() {
  const [appointmentResult, conversationResult] = await Promise.allSettled([
    getPendingAppointmentCountApi(),
    getUnrepliedConversationCountApi(),
  ]);

  return {
    appointments:
      appointmentResult.status === "fulfilled" ? appointmentResult.value : 0,

    conversations:
      conversationResult.status === "fulfilled" ? conversationResult.value : 0,
  };
}
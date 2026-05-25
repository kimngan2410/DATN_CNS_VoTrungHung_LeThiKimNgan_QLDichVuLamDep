const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws")

function parseSocketMessage(event, onEvent) {
  try {
    const data = JSON.parse(event.data)

    if (onEvent) {
      onEvent(data)
    }
  } catch {
    // Bỏ qua message không phải JSON
  }
}

export function createCustomerChatSocket({ idTaiKhoan, onEvent, onOpen, onClose }) {
  if (!idTaiKhoan) return null

  const socket = new WebSocket(
    `${WS_BASE_URL}/hoi-thoai/ws/customer/${idTaiKhoan}`
  )

  socket.onopen = () => {
    if (onOpen) onOpen(socket)
  }

  socket.onmessage = (event) => {
    parseSocketMessage(event, onEvent)
  }

  socket.onclose = () => {
    if (onClose) onClose()
  }

  return socket
}

export function createStaffConversationSocket({
  idHoiThoai,
  onEvent,
  onOpen,
  onClose,
}) {
  if (!idHoiThoai) return null

  const socket = new WebSocket(
    `${WS_BASE_URL}/hoi-thoai/ws/conversation/${idHoiThoai}`
  )

  socket.onopen = () => {
    if (onOpen) onOpen(socket)
  }

  socket.onmessage = (event) => {
    parseSocketMessage(event, onEvent)
  }

  socket.onclose = () => {
    if (onClose) onClose()
  }

  return socket
}

export function createStaffConversationListSocket({ onEvent, onOpen, onClose }) {
  const socket = new WebSocket(`${WS_BASE_URL}/hoi-thoai/ws/staff/danh-sach`)

  socket.onopen = () => {
    if (onOpen) onOpen(socket)
  }

  socket.onmessage = (event) => {
    parseSocketMessage(event, onEvent)
  }

  socket.onclose = () => {
    if (onClose) onClose()
  }

  return socket
}

export function isSocketOpen(socket) {
  return socket && socket.readyState === WebSocket.OPEN
}

export function sendSocketJson(socket, payload) {
  if (!isSocketOpen(socket)) {
    return false
  }

  socket.send(JSON.stringify(payload))
  return true
}

export function createCustomerPresenceSocket({
  idTaiKhoan,
  onEvent,
  onOpen,
  onClose,
}) {
  if (!idTaiKhoan) return null

  const socket = new WebSocket(
    `${WS_BASE_URL}/hoi-thoai/ws/presence/customer/${idTaiKhoan}`
  )

  socket.onopen = () => {
    if (onOpen) onOpen(socket)

    // Gửi ping định kỳ để giữ kết nối ổn định
    socket.__presencePing = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping")
      }
    }, 25000)
  }

  socket.onmessage = (event) => {
    parseSocketMessage(event, onEvent)
  }

  socket.onclose = () => {
    if (socket.__presencePing) {
      clearInterval(socket.__presencePing)
    }

    if (onClose) onClose()
  }

  return socket
}
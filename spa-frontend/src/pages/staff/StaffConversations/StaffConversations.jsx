import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Search,
  UserRound,
  Phone,
  Send,
  MessageCircle,
  MoreVertical,
  Headset,
  X,
  Loader2,
} from "lucide-react"
import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader"
import { getCurrentStaffUser } from "../../../services/authApi"
import {
  getStaffConversationDetailApi,
  getStaffConversationsApi,
  recallConversationMessageApi,
  sendStaffMessageApi,
  updateConversationMessageApi,
} from "../../../services/conversationApi"
import {
  createStaffConversationListSocket,
  createStaffConversationSocket,
  isSocketOpen,
  sendSocketJson,
} from "../../../services/conversationSocket"
import {
  getStaffConsultationTemplateApi,
  searchStaffConsultationServicesApi,
} from "../../../services/staffServiceConsultationApi"
import "./StaffConversations.css"

const filterOptions = [
  {
    label: "Tất cả",
    value: "all",
  },
  {
    label: "Chưa trả lời",
    value: "unanswered",
  },
  {
    label: "Đã trả lời",
    value: "answered",
  },
]

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const API_ORIGIN = API_BASE_URL.replace("/api/v1", "")

const getConversationPreview = (conversation) => {
  if (!conversation?.lastMessage) return ""

  if (conversation.lastSender === "staff") {
    return `Bạn: ${conversation.lastMessage}`
  }

  return conversation.lastMessage
}

const getDateFromCreatedAt = (createdAt) => {
  if (!createdAt) return ""

  return String(createdAt).split(" ")[0] || ""
}

const getMessageDateLabel = (createdAt) => {
  const dateText = getDateFromCreatedAt(createdAt)

  if (!dateText) return ""

  const [day, month, year] = dateText.split("/").map(Number)

  if (!day || !month || !year) return dateText

  const messageDate = new Date(year, month - 1, day)
  const today = new Date()
  const yesterday = new Date()

  today.setHours(0, 0, 0, 0)
  yesterday.setDate(today.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  messageDate.setHours(0, 0, 0, 0)

  if (messageDate.getTime() === today.getTime()) {
    return "Hôm nay"
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return "Hôm qua"
  }

  return dateText
}

const shouldShowMessageTime = (messages, index) => {
  const currentMessage = messages[index]
  const nextMessage = messages[index + 1]

  if (!currentMessage?.time) return false

  if (!nextMessage) return true

  const currentDate = getDateFromCreatedAt(currentMessage.createdAt)
  const nextDate = getDateFromCreatedAt(nextMessage.createdAt)

  return currentMessage.time !== nextMessage.time || currentDate !== nextDate
}

const isSameMessageGroupWithNext = (messages, index) => {
  const currentMessage = messages[index]
  const nextMessage = messages[index + 1]

  if (!currentMessage || !nextMessage) return false

  const currentDate = getDateFromCreatedAt(currentMessage.createdAt)
  const nextDate = getDateFromCreatedAt(nextMessage.createdAt)

  return (
    currentMessage.sender === nextMessage.sender &&
    currentMessage.time === nextMessage.time &&
    currentDate === nextDate
  )
}

const upsertMessageToList = (messages = [], newMessage) => {
  if (!newMessage?.id) return messages

  const existed = messages.some(
    (item) => Number(item.id) === Number(newMessage.id)
  )

  if (existed) {
    return messages.map((item) =>
      Number(item.id) === Number(newMessage.id)
        ? {
            ...item,
            ...newMessage,
          }
        : item
    )
  }

  return [...messages, newMessage]
}

const getPreviewFromSocketMessage = (message) => {
  if (!message) return ""

  if (message.daThuHoi) {
    return "Tin nhắn đã được thu hồi"
  }

  return message.content || ""
}

const getConversationStatusFromSocketMessage = (message) => {
  if (!message) return undefined

  if (message.sender === "staff") {
    return "answered"
  }

  return "unanswered"
}

const getFullServiceImageUrl = (image) => {
  if (!image) return ""

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image
  }

  if (image.startsWith("/")) {
    return `${API_ORIGIN}${image}`
  }

  return `${API_ORIGIN}/${image}`
}

const formatMoney = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`
}

const renderMessageContent = (content = "") => {
  const serviceLinkRegex = /(https?:\/\/[^\s]+\/dich-vu\/\d+)/g
  const parts = String(content).split(serviceLinkRegex)

  return parts.map((part, index) => {
    if (serviceLinkRegex.test(part)) {
      serviceLinkRegex.lastIndex = 0

      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="message-service-link"
        >
          Xem chi tiết dịch vụ
        </a>
      )
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>
  })
}

function StaffConversations() {
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedConversation, setSelectedConversation] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [replyText, setReplyText] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null)

  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false)
  const [consultKeyword, setConsultKeyword] = useState("")
  const [consultServices, setConsultServices] = useState([])
  const [isConsultLoading, setIsConsultLoading] = useState(false)
  const [consultError, setConsultError] = useState("")
  const [consultCategory, setConsultCategory] = useState("Tất cả")

  const messageAreaRef = useRef(null)
  const listSocketRef = useRef(null)
  const detailSocketRef = useRef(null)
  const selectedIdRef = useRef(null)

  const currentStaff = getCurrentStaffUser()

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messageAreaRef.current) {
        messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight
      }
    }, 60)
  }, [])

  const fetchConversationList = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setIsLoadingList(true)
        }

        const data = await getStaffConversationsApi()

        setConversations(data)

        setSelectedId((currentSelectedId) => {
          if (currentSelectedId) return currentSelectedId
          return data.length > 0 ? data[0].id : null
        })
      } catch (error) {
        setErrorMessage(error.message || "Không thể tải danh sách hội thoại.")
      } finally {
        if (!silent) {
          setIsLoadingList(false)
        }
      }
    },
    []
  )

  const fetchConversationDetail = useCallback(
    async (idHoiThoai, { silent = false } = {}) => {
      if (!idHoiThoai) return

      try {
        if (!silent) {
          setIsLoadingDetail(true)
        }

        const data = await getStaffConversationDetailApi(idHoiThoai)

        setSelectedConversation(data)
        scrollToBottom()

        setConversations((prev) =>
          prev.map((item) =>
            item.id === data.id
              ? {
                  ...item,
                  unread: 0,
                  status: data.status,
                  lastMessage: data.lastMessage,
                  lastSender: data.lastSender,
                  lastTime: data.lastTime,
                }
              : item
          )
        )
      } catch (error) {
        setErrorMessage(error.message || "Không thể tải chi tiết hội thoại.")
      } finally {
        if (!silent) {
          setIsLoadingDetail(false)
        }
      }
    },
    [scrollToBottom]
  )

  const applySocketMessageToStaffState = useCallback(
    (socketMessage) => {
      if (!socketMessage?.id) return

      const socketConversationId =
        socketMessage.idHoiThoai || socketMessage.idConversation

      const currentSelectedId = selectedIdRef.current

      setSelectedConversation((prev) => {
        if (!prev) return prev

        const currentConversationId = prev.idHoiThoai || prev.id

        if (
          socketConversationId &&
          Number(socketConversationId) !== Number(currentConversationId)
        ) {
          return prev
        }

        return {
          ...prev,
          lastMessage: getPreviewFromSocketMessage(socketMessage),
          lastSender: socketMessage.sender,
          lastTime: socketMessage.time,
          status:
            getConversationStatusFromSocketMessage(socketMessage) ||
            prev.status,
          messages: upsertMessageToList(prev.messages || [], socketMessage),
        }
      })

      setConversations((prev) =>
        prev.map((item) => {
          if (
            socketConversationId &&
            Number(item.id) !== Number(socketConversationId)
          ) {
            return item
          }

          const isCurrentOpenConversation =
            Number(currentSelectedId) === Number(item.id)

          const shouldIncreaseUnread =
            !isCurrentOpenConversation && socketMessage.sender === "customer"

          return {
            ...item,
            lastMessage: getPreviewFromSocketMessage(socketMessage),
            lastSender: socketMessage.sender,
            lastTime: socketMessage.time,
            status:
              getConversationStatusFromSocketMessage(socketMessage) ||
              item.status,
            unread: shouldIncreaseUnread
              ? Number(item.unread || 0) + 1
              : isCurrentOpenConversation
                ? 0
                : item.unread,
          }
        })
      )

      scrollToBottom()
    },
    [scrollToBottom]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversationList()

    if (listSocketRef.current) {
      listSocketRef.current.close()
    }

    listSocketRef.current = createStaffConversationListSocket({
      onEvent: (eventData) => {
        if (
          eventData.type === "ping" ||
          eventData.type === "connected_staff_list"
        ) {
          return
        }

        if (
          eventData.type === "message_created" ||
          eventData.type === "message_updated" ||
          eventData.type === "message_recalled"
        ) {
          if (eventData.message) {
            applySocketMessageToStaffState(eventData.message)
            return
          }
        }

        if (eventData.type === "conversation_updated") {
          fetchConversationList({ silent: true })
          return
        }

        if (eventData.type === "presence_updated") {
          fetchConversationList({ silent: true })

          const currentSelectedId = selectedIdRef.current

          if (currentSelectedId) {
            fetchConversationDetail(currentSelectedId, { silent: true })
          }
        }
      },

      onClose: () => {
        listSocketRef.current = null
      },
    })

    return () => {
      if (listSocketRef.current) {
        listSocketRef.current.close()
        listSocketRef.current = null
      }
    }
  }, [
    fetchConversationList,
    fetchConversationDetail,
    applySocketMessageToStaffState,
  ])

  useEffect(() => {
    if (!selectedId) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversationDetail(selectedId)

    if (detailSocketRef.current) {
      detailSocketRef.current.close()
    }

    detailSocketRef.current = createStaffConversationSocket({
      idHoiThoai: selectedId,

      onEvent: (eventData) => {
        if (eventData.type === "connected") {
          return
        }

        if (eventData.type === "error") {
          setErrorMessage(eventData.message || "Lỗi kết nối hội thoại.")
          return
        }

        if (
          eventData.type === "message_created" ||
          eventData.type === "message_updated" ||
          eventData.type === "message_recalled"
        ) {
          if (eventData.message) {
            applySocketMessageToStaffState(eventData.message)
            fetchConversationList({ silent: true })
            return
          }

          fetchConversationDetail(selectedId, { silent: true })
          fetchConversationList({ silent: true })
        }
      },

      onClose: () => {
        detailSocketRef.current = null
      },
    })

    return () => {
      if (detailSocketRef.current) {
        detailSocketRef.current.close()
        detailSocketRef.current = null
      }
    }
  }, [
    selectedId,
    fetchConversationDetail,
    fetchConversationList,
    applySocketMessageToStaffState,
  ])

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const keyword = searchTerm.trim().toLowerCase()

      const matchesKeyword =
        keyword === "" ||
        String(conversation.customerName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(conversation.phone || "").includes(keyword)

      const matchesFilter =
        activeFilter === "all" || conversation.status === activeFilter

      return matchesKeyword && matchesFilter
    })
  }, [conversations, searchTerm, activeFilter])

  const conversationStats = useMemo(() => {
    const total = conversations.length

    const unanswered = conversations.filter(
      (conversation) => conversation.status === "unanswered"
    ).length

    const answered = conversations.filter(
      (conversation) => conversation.status === "answered"
    ).length

    const unreadMessages = conversations.reduce(
      (sum, conversation) => sum + Number(conversation.unread || 0),
      0
    )

    return {
      total,
      unanswered,
      answered,
      unreadMessages,
    }
  }, [conversations])

  const handleSelectConversation = (conversationId) => {
    setSelectedId(conversationId)
    setErrorMessage("")
    setEditingMessageId(null)
    setEditingText("")
    setOpenMenuMessageId(null)
  }

  const isOwnMessage = (message) => {
    return Number(message.idNguoiGuiTaiKhoan) === Number(currentStaff?.maTK)
  }

  const fetchConsultationServices = useCallback(async (keyword = "") => {
    try {
      setIsConsultLoading(true)
      setConsultError("")

      const data = await searchStaffConsultationServicesApi({
        keyword,
        limit: 8,
      })

      setConsultServices(Array.isArray(data?.services) ? data.services : [])
    } catch (error) {
      setConsultError(error.message || "Không thể tìm dịch vụ tư vấn.")
      setConsultServices([])
    } finally {
      setIsConsultLoading(false)
    }
  }, [])

  const consultCategories = useMemo(() => {
    const categories = consultServices
      .map((service) => service.category)
      .filter(Boolean)

    return ["Tất cả", ...Array.from(new Set(categories))]
  }, [consultServices])

  const filteredConsultServices = useMemo(() => {
    if (consultCategory === "Tất cả") {
      return consultServices
    }

    return consultServices.filter(
      (service) => service.category === consultCategory
    )
  }, [consultServices, consultCategory])

  const handleOpenConsultModal = () => {
    setConsultKeyword("")
    setConsultCategory("Tất cả")
    setConsultError("")
    setIsConsultModalOpen(true)

    fetchConsultationServices("")
  }

  const handleCloseConsultModal = () => {
    setIsConsultModalOpen(false)
    setConsultKeyword("")
    setConsultCategory("Tất cả")
    setConsultServices([])
    setConsultError("")
  }

  const handleSearchConsultServices = () => {
    setConsultCategory("Tất cả")
    fetchConsultationServices(consultKeyword.trim())
  }

  const handleInsertConsultationTemplate = async (service) => {
    try {
      setConsultError("")

      const data = await getStaffConsultationTemplateApi({
        idDichVu: service.idDichVu || service.id,
        customerConcern: "",
      })

      setReplyText(data?.messageTemplate || "")
      setIsConsultModalOpen(false)
      setErrorMessage("")
    } catch (error) {
      setConsultError(error.message || "Không thể chèn mẫu tư vấn.")
    }
  }

  const handleSendMessage = async () => {
    const content = replyText.trim()

    if (!content) {
      setErrorMessage("Vui lòng nhập nội dung phản hồi trước khi gửi.")
      return
    }

    if (!selectedId) {
      setErrorMessage("Vui lòng chọn hội thoại cần phản hồi.")
      return
    }

    if (!currentStaff?.maTK) {
      setErrorMessage("Không tìm thấy thông tin tài khoản nhân viên.")
      return
    }

    try {
      setIsSending(true)
      setErrorMessage("")

      if (isSocketOpen(detailSocketRef.current)) {
        const ok = sendSocketJson(detailSocketRef.current, {
          action: "send_message",
          idTaiKhoan: currentStaff.maTK,
          noiDung: content,
        })

        if (ok) {
          setReplyText("")
          return
        }
      }

      const result = await sendStaffMessageApi({
        idHoiThoai: selectedId,
        idTaiKhoan: currentStaff.maTK,
        noiDung: content,
      })

      setSelectedConversation(result.conversation)
      setReplyText("")
      scrollToBottom()
      fetchConversationList({ silent: true })
    } catch (error) {
      setErrorMessage(error.message || "Không thể gửi phản hồi.")
    } finally {
      setIsSending(false)
    }
  }

  const handleStartEditMessage = (message) => {
    if (message.daThuHoi) return

    setOpenMenuMessageId(null)
    setEditingMessageId(message.id)
    setEditingText(message.content)
    setErrorMessage("")
  }

  const handleCancelEditMessage = () => {
    setEditingMessageId(null)
    setEditingText("")
  }

  const handleSaveEditMessage = async (message) => {
    const content = editingText.trim()

    if (!content) {
      setErrorMessage("Nội dung tin nhắn không được để trống.")
      return
    }

    if (!currentStaff?.maTK) {
      setErrorMessage("Không tìm thấy thông tin tài khoản nhân viên.")
      return
    }

    try {
      setErrorMessage("")

      if (isSocketOpen(detailSocketRef.current)) {
        const ok = sendSocketJson(detailSocketRef.current, {
          action: "update_message",
          idTinNhan: message.id,
          idTaiKhoan: currentStaff.maTK,
          noiDung: content,
        })

        if (ok) {
          setEditingMessageId(null)
          setEditingText("")
          return
        }
      }

      const result = await updateConversationMessageApi({
        idTinNhan: message.id,
        idTaiKhoan: currentStaff.maTK,
        noiDung: content,
        actor: "staff",
      })

      if (result.conversation) {
        setSelectedConversation(result.conversation)
      } else {
        await fetchConversationDetail(selectedId, { silent: true })
      }

      setEditingMessageId(null)
      setEditingText("")
      scrollToBottom()
      fetchConversationList({ silent: true })
    } catch (error) {
      setErrorMessage(error.message || "Không thể sửa tin nhắn.")
    }
  }

  const handleRecallMessage = async (message) => {
    setOpenMenuMessageId(null)

    const confirmed = window.confirm(
      "Bạn có chắc muốn thu hồi tin nhắn này không?"
    )

    if (!confirmed) return

    if (!currentStaff?.maTK) {
      setErrorMessage("Không tìm thấy thông tin tài khoản nhân viên.")
      return
    }

    try {
      setErrorMessage("")

      if (isSocketOpen(detailSocketRef.current)) {
        const ok = sendSocketJson(detailSocketRef.current, {
          action: "recall_message",
          idTinNhan: message.id,
          idTaiKhoan: currentStaff.maTK,
        })

        if (ok) {
          setEditingMessageId(null)
          setEditingText("")
          return
        }
      }

      const result = await recallConversationMessageApi({
        idTinNhan: message.id,
        idTaiKhoan: currentStaff.maTK,
        actor: "staff",
      })

      if (result.conversation) {
        setSelectedConversation(result.conversation)
      } else {
        await fetchConversationDetail(selectedId, { silent: true })
      }

      setEditingMessageId(null)
      setEditingText("")
      fetchConversationList({ silent: true })
      scrollToBottom()
    } catch (error) {
      setErrorMessage(error.message || "Không thể thu hồi tin nhắn.")
    }
  }

  return (
    <div className="staff-conversations-page">
      <StaffPageHeader title="Hội thoại" />

      <section className="staff-conversations-content">
        <div className="staff-conversations-card">
          <aside className="conversation-list-panel">
            <div className="conversation-search-box">
              <Search size={17} />

              <input
                type="text"
                placeholder="Tìm khách hàng..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="conversation-filter-tabs">
              {filterOptions.map((option) => {
                const countMap = {
                  all: conversationStats.total,
                  unanswered: conversationStats.unanswered,
                  answered: conversationStats.answered,
                }

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      activeFilter === option.value
                        ? "conversation-filter-tab active"
                        : "conversation-filter-tab"
                    }
                    onClick={() => setActiveFilter(option.value)}
                  >
                    {option.label}

                    <span className="conversation-filter-count">
                      {countMap[option.value] || 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {conversationStats.unreadMessages > 0 && (
              <div className="conversation-unread-summary">
                Có {conversationStats.unreadMessages} tin nhắn khách hàng chưa
                đọc
              </div>
            )}

            <div className="conversation-list">
              {isLoadingList ? (
                <div className="conversation-empty">
                  <UserRound size={28} />
                  <p>Đang tải hội thoại...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="conversation-empty">
                  <MessageCircle size={28} />
                  <p>Chưa có hội thoại nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isUnread = conversation.unread > 0
                  const previewText = getConversationPreview(conversation)

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      className={[
                        "conversation-item",
                        selectedId === conversation.id ? "active" : "",
                        isUnread ? "unread" : "",
                      ].join(" ")}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="conversation-item-main">
                        <div className="conversation-item-row conversation-item-row-top">
                          <strong className="conversation-item-name">
                            {conversation.customerName}
                          </strong>

                          <span className="conversation-item-time">
                            {conversation.lastTime}
                          </span>
                        </div>

                        <div className="conversation-item-row conversation-item-row-bottom">
                          <p className="conversation-item-preview">
                            {previewText}
                          </p>

                          {isUnread && (
                            <span className="conversation-unread-badge">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </aside>

          <main className="conversation-detail-panel">
            {selectedConversation ? (
              <>
                <div className="conversation-detail-header">
                  <div className="conversation-customer-info">
                    <div className="conversation-customer-avatar">
                      {selectedConversation.avatar ? (
                        <img
                          src={selectedConversation.avatar}
                          alt={selectedConversation.customerName}
                          className="conversation-customer-avatar-img"
                        />
                      ) : (
                        selectedConversation.avatarText
                      )}
                    </div>

                    <div>
                      <h2>{selectedConversation.customerName}</h2>

                      <p>
                        <Phone size={14} />
                        <span>{selectedConversation.phone}</span>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`conversation-activity-status ${selectedConversation.activityStatus}`}
                  >
                    <span className="conversation-activity-dot"></span>
                    <span>{selectedConversation.activityText}</span>
                  </div>
                </div>

                <div className="conversation-message-area" ref={messageAreaRef}>
                  {isLoadingDetail ? (
                    <div className="conversation-empty">
                      <MessageCircle size={28} />
                      <p>Đang tải tin nhắn...</p>
                    </div>
                  ) : (
                    (selectedConversation.messages || []).map(
                      (message, index, messages) => {
                        const currentDateLabel = getMessageDateLabel(
                          message.createdAt
                        )

                        const previousDateLabel =
                          index > 0
                            ? getMessageDateLabel(
                                messages[index - 1].createdAt
                              )
                            : ""

                        const shouldShowDateDivider =
                          currentDateLabel &&
                          currentDateLabel !== previousDateLabel

                        const shouldShowTime = shouldShowMessageTime(
                          messages,
                          index
                        )

                        const isCompactMessage = isSameMessageGroupWithNext(
                          messages,
                          index
                        )

                        return (
                          <Fragment key={message.id}>
                            {shouldShowDateDivider && (
                              <div className="message-date-divider">
                                <span>{currentDateLabel}</span>
                              </div>
                            )}

                            <div
                              className={[
                                "message-row",
                                message.sender === "staff"
                                  ? "staff"
                                  : "customer",
                                isCompactMessage ? "message-row--compact" : "",
                              ].join(" ")}
                            >
                              {editingMessageId === message.id ? (
                                <div className="conversation-edit-box">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(event) =>
                                      setEditingText(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        handleSaveEditMessage(message)
                                      }

                                      if (event.key === "Escape") {
                                        handleCancelEditMessage()
                                      }
                                    }}
                                    autoFocus
                                  />

                                  <div className="conversation-edit-actions">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveEditMessage(message)
                                      }
                                    >
                                      Lưu
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleCancelEditMessage}
                                    >
                                      Huỷ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="message-content-wrap">
                                  <div
                                    className={
                                      message.daThuHoi
                                        ? "message-bubble message-bubble--recalled"
                                        : "message-bubble"
                                    }
                                  >
                                    {message.daThuHoi
                                      ? "Tin nhắn đã được thu hồi"
                                      : renderMessageContent(message.content)}
                                  </div>

                                  {(shouldShowTime ||
                                    (message.daChinhSua &&
                                      !message.daThuHoi)) && (
                                    <div className="message-meta">
                                      {shouldShowTime && (
                                        <span className="message-time">
                                          {message.time}
                                        </span>
                                      )}

                                      {message.daChinhSua &&
                                        !message.daThuHoi && (
                                          <span className="message-edited">
                                            Đã chỉnh sửa
                                          </span>
                                        )}
                                    </div>
                                  )}

                                  {isOwnMessage(message) &&
                                    !message.daThuHoi && (
                                      <div
                                        className={
                                          openMenuMessageId === message.id
                                            ? "message-menu-wrap open"
                                            : "message-menu-wrap"
                                        }
                                      >
                                        <button
                                          type="button"
                                          className="message-more-btn"
                                          onClick={(event) => {
                                            event.stopPropagation()
                                            setOpenMenuMessageId((currentId) =>
                                              currentId === message.id
                                                ? null
                                                : message.id
                                            )
                                          }}
                                          title="Tuỳ chọn tin nhắn"
                                        >
                                          <MoreVertical size={18} />
                                        </button>

                                        {openMenuMessageId === message.id && (
                                          <div className="message-action-menu">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleStartEditMessage(message)
                                              }
                                            >
                                              Chỉnh sửa
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRecallMessage(message)
                                              }
                                            >
                                              Thu hồi
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          </Fragment>
                        )
                      }
                    )
                  )}
                </div>

                <div className="conversation-reply-box">
                  {errorMessage && (
                    <div className="conversation-error">{errorMessage}</div>
                  )}

                  <div className="conversation-consult-actions">
                    <button
                      type="button"
                      className="conversation-consult-btn"
                      onClick={handleOpenConsultModal}
                      disabled={isSending || !selectedConversation}
                    >
                      <Headset size={16} />
                      Tư vấn dịch vụ
                    </button>
                  </div>

                  <div className="conversation-input-row">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn phản hồi..."
                      value={replyText}
                      disabled={isSending}
                      onChange={(event) => {
                        setReplyText(event.target.value)
                        setErrorMessage("")
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isSending}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="conversation-no-selected">
                <MessageCircle size={36} />
                <h3>Chọn một hội thoại để xem chi tiết</h3>
                <p>Danh sách hội thoại của khách hàng sẽ hiển thị bên trái.</p>
              </div>
            )}
          </main>
        </div>
      </section>

      {isConsultModalOpen && (
        <div
          className="conversation-consult-modal-overlay"
          onClick={handleCloseConsultModal}
        >
          <div
            className="conversation-consult-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="conversation-consult-modal-header">
              <div>
                <h3>Tư vấn dịch vụ</h3>
                <p>Chọn dịch vụ phù hợp để chèn mẫu tư vấn vào tin nhắn.</p>
              </div>

              <button type="button" onClick={handleCloseConsultModal}>
                <X size={20} />
              </button>
            </div>

            <div className="conversation-consult-body">
              <div className="conversation-consult-search-row">
                <div className="conversation-consult-search">
                  <Search size={17} />

                  <input
                    type="text"
                    value={consultKeyword}
                    placeholder="Tìm dịch vụ theo tên, danh mục, mô tả..."
                    onChange={(event) => setConsultKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearchConsultServices()
                      }
                    }}
                  />
                </div>

                <button type="button" onClick={handleSearchConsultServices}>
                  Tìm
                </button>
              </div>

              <div className="conversation-consult-category-tabs">
                {consultCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      consultCategory === category
                        ? "conversation-consult-category-tab active"
                        : "conversation-consult-category-tab"
                    }
                    onClick={() => setConsultCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {consultError && (
                <div className="conversation-consult-error">
                  {consultError}
                </div>
              )}

              <div className="conversation-consult-service-list">
                {isConsultLoading ? (
                  <div className="conversation-consult-state">
                    <Loader2
                      size={24}
                      className="conversation-consult-loading"
                    />
                    <span>Đang tìm dịch vụ...</span>
                  </div>
                ) : filteredConsultServices.length > 0 ? (
                  filteredConsultServices.map((service) => (
                    <div
                      key={service.idDichVu || service.id}
                      className="conversation-consult-service-card"
                    >
                      <div className="conversation-consult-service-image">
                        {service.image ? (
                          <img
                            src={getFullServiceImageUrl(service.image)}
                            alt={service.serviceName}
                            onError={(event) => {
                              event.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <Headset size={22} />
                        )}
                      </div>

                      <div className="conversation-consult-service-info">
                        <h4>{service.serviceName}</h4>

                        <p>
                          {service.category} · {formatMoney(service.price)} ·{" "}
                          {service.duration} phút
                        </p>

                        {service.description && (
                          <span>{service.description}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="conversation-consult-insert-btn"
                        onClick={() =>
                          handleInsertConsultationTemplate(service)
                        }
                      >
                        Chèn tư vấn
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="conversation-consult-state">
                    Chưa có dịch vụ phù hợp với danh mục đã chọn.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffConversations
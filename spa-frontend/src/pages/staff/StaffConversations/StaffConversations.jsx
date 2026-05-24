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

  const messageAreaRef = useRef(null)
  const currentStaff = getCurrentStaffUser()

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversationList()

    const timer = setInterval(() => {
      fetchConversationList({ silent: true })
    }, 5000)

    return () => clearInterval(timer)
  }, [fetchConversationList])

  useEffect(() => {
    if (!selectedId) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversationDetail(selectedId)

    const timer = setInterval(() => {
      fetchConversationDetail(selectedId, { silent: true })
    }, 4000)

    return () => clearInterval(timer)
  }, [selectedId, fetchConversationDetail])

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
                        <div className="conversation-name-row">
                          <strong>{conversation.customerName}</strong>
                          <span>{conversation.lastTime}</span>
                        </div>

                        <p>{previewText}</p>
                      </div>

                      {isUnread && (
                        <span className="conversation-unread-badge">
                          {conversation.unread}
                        </span>
                      )}
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

                <div
                  className="conversation-message-area"
                  ref={messageAreaRef}
                >
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

                        return (
                          <Fragment key={message.id}>
                            {shouldShowDateDivider && (
                              <div className="message-date-divider">
                                <span>{currentDateLabel}</span>
                              </div>
                            )}

                            <div
                              className={
                                message.sender === "staff"
                                  ? "message-row staff"
                                  : "message-row customer"
                              }
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
                                    {message.daThuHoi ? "Tin nhắn đã được thu hồi" : message.content}
                                  </div>

                                  <div className="message-meta">
                                    <span className="message-time">{message.time}</span>

                                    {message.daChinhSua && !message.daThuHoi && (
                                      <span className="message-edited">Đã chỉnh sửa</span>
                                    )}
                                  </div>

                                  {isOwnMessage(message) && !message.daThuHoi && (
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
                                            currentId === message.id ? null : message.id
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
                                            onClick={() => handleStartEditMessage(message)}
                                          >
                                            Chỉnh sửa
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleRecallMessage(message)}
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
    </div>
  )
}

export default StaffConversations
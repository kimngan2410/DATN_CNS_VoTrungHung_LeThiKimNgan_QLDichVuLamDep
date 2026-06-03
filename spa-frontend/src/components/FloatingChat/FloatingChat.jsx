import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  X,
  Send,
  BriefcaseBusiness,
  MessageCircle,
  MoreVertical,
} from "lucide-react"
import { getCurrentCustomerUser } from "../../services/authApi"
import {
  getCustomerConversationApi,
  getCustomerUnreadCountApi,
  recallConversationMessageApi,
  sendCustomerMessageApi,
  updateConversationMessageApi,
} from "../../services/conversationApi"
import {
  createCustomerChatSocket,
  createCustomerPresenceSocket,
  isSocketOpen,
  sendSocketJson,
} from "../../services/conversationSocket"
import "./FloatingChat.css"

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

const applySocketMessageToCustomerConversation = ({
  setConversation,
  socketMessage,
}) => {
  if (!socketMessage?.id) return

  setConversation((prev) => {
    if (!prev) return prev

    return {
      ...prev,
      messages: upsertMessageToList(prev.messages || [], socketMessage),
    }
  })
}

const getServicePathFromUrl = (url = "") => {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname
  } catch {
    const match = String(url).match(/\/dich-vu\/\d+/)
    return match ? match[0] : url
  }
}

const renderMessageContent = (content = "") => {
  const serviceLinkRegex = /(https?:\/\/[^\s]+\/dich-vu\/\d+)/g
  const parts = String(content).split(serviceLinkRegex)

  return parts.map((part, index) => {
    if (serviceLinkRegex.test(part)) {
      serviceLinkRegex.lastIndex = 0

      return (
        <Link
          key={`${part}-${index}`}
          to={getServicePathFromUrl(part)}
          className="chat-service-link"
        >
          Xem chi tiết dịch vụ
        </Link>
      )
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>
  })
}


function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [errorMessage, setErrorMessage] = useState("")
  const [messageActionError, setMessageActionError] = useState("")

  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null)

  const bodyRef = useRef(null)
  const socketRef = useRef(null)
  const presenceSocketRef = useRef(null)

  const currentUser = getCurrentCustomerUser()

  useEffect(() => {
    if (!currentUser?.maTK) return

    if (presenceSocketRef.current) {
      presenceSocketRef.current.close()
    }

    presenceSocketRef.current = createCustomerPresenceSocket({
      idTaiKhoan: currentUser.maTK,
      onEvent: (eventData) => {
        if (eventData.type === "presence_connected") {
          return
        }
      },
      onClose: () => {
        presenceSocketRef.current = null
      },
    })

    return () => {
      if (presenceSocketRef.current) {
        presenceSocketRef.current.close()
        presenceSocketRef.current = null
      }
    }
  }, [currentUser?.maTK])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }
    }, 60)
  }, [])

  const fetchConversation = useCallback(
    async ({ silent = false } = {}) => {
      if (!currentUser?.maTK) return

      try {
        if (!silent) {
          setIsLoading(true)
        }

        setErrorMessage("")
        setMessageActionError("")

        const data = await getCustomerConversationApi(currentUser.maTK)

        setConversation(data)
        setUnreadCount(0)
        scrollToBottom()
      } catch (error) {
        setErrorMessage(error.message || "Không thể tải hội thoại.")
      } finally {
        if (!silent) {
          setIsLoading(false)
        }
      }
    },
    [currentUser?.maTK, scrollToBottom]
  )

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser?.maTK || isOpen) {
      return
    }

    try {
      const data = await getCustomerUnreadCountApi(currentUser.maTK)
      setUnreadCount(data?.unreadCount || 0)
    } catch {
      setUnreadCount(0)
    }
  }, [currentUser?.maTK, isOpen])

  useEffect(() => {
    if (!currentUser?.maTK) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0)
      return
    }

    fetchUnreadCount()

    const timer = setInterval(() => {
      fetchUnreadCount()
    }, 5000)

    return () => clearInterval(timer)
  }, [currentUser?.maTK, fetchUnreadCount])

  useEffect(() => {
    if (!isOpen || !currentUser?.maTK) return

    let isMounted = true

    const openSocket = async () => {
      await fetchConversation()

      if (!isMounted) return

      if (socketRef.current) {
        socketRef.current.close()
      }

      socketRef.current = createCustomerChatSocket({
        idTaiKhoan: currentUser.maTK,

        onEvent: (eventData) => {
          if (eventData.type === "connected") {
            return
          }

          if (eventData.type === "error") {
            setMessageActionError(eventData.message || "Lỗi kết nối chat.")
            return
          }

          if (
            eventData.type === "message_created" ||
            eventData.type === "message_updated" ||
            eventData.type === "message_recalled"
          ) {
            if (eventData.message) {
              applySocketMessageToCustomerConversation({
                setConversation,
                socketMessage: eventData.message,
              })

              setUnreadCount(0)
              scrollToBottom()
              return
            }

            fetchConversation({ silent: true })
          }
        },

        onClose: () => {
          socketRef.current = null
        },
      })
    }

    openSocket()

    return () => {
      isMounted = false

      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [isOpen, currentUser?.maTK, fetchConversation])

  const isOwnMessage = (item) => {
    return Number(item.idNguoiGuiTaiKhoan) === Number(currentUser?.maTK)
  }

  const handleSend = async () => {
    const content = message.trim()

    if (!content || isSending) return

    if (!currentUser?.maTK) {
      setErrorMessage("Vui lòng đăng nhập để nhắn tin với Serenity Spa.")
      return
    }

    try {
      setIsSending(true)
      setErrorMessage("")
      setMessageActionError("")

      if (isSocketOpen(socketRef.current)) {
        const ok = sendSocketJson(socketRef.current, {
          action: "send_message",
          noiDung: content,
        })

        if (ok) {
          setMessage("")
          return
        }
      }

      const result = await sendCustomerMessageApi({
        idTaiKhoan: currentUser.maTK,
        noiDung: content,
      })

      setConversation(result.conversation)
      setMessage("")
      scrollToBottom()
    } catch (error) {
      setErrorMessage(error.message || "Không thể gửi tin nhắn.")
    } finally {
      setIsSending(false)
    }
  }

  const handleStartEditMessage = (item) => {
    if (item.daThuHoi) return

    setOpenMenuMessageId(null)
    setEditingMessageId(item.id)
    setEditingText(item.content)
    setMessageActionError("")
  }

  const handleCancelEditMessage = () => {
    setEditingMessageId(null)
    setEditingText("")
    setMessageActionError("")
  }

  const handleSaveEditMessage = async (item) => {
    const content = editingText.trim()

    if (!content) {
      setMessageActionError("Nội dung tin nhắn không được để trống.")
      return
    }

    if (!currentUser?.maTK) {
      setMessageActionError("Không tìm thấy thông tin tài khoản khách hàng.")
      return
    }

    try {
      setMessageActionError("")

      if (isSocketOpen(socketRef.current)) {
        const ok = sendSocketJson(socketRef.current, {
          action: "update_message",
          idTinNhan: item.id,
          noiDung: content,
        })

        if (ok) {
          setEditingMessageId(null)
          setEditingText("")
          return
        }
      }

      const result = await updateConversationMessageApi({
        idTinNhan: item.id,
        idTaiKhoan: currentUser.maTK,
        noiDung: content,
        actor: "customer",
      })

      if (result.conversation) {
        setConversation(result.conversation)
      } else {
        await fetchConversation({ silent: true })
      }

      setEditingMessageId(null)
      setEditingText("")
      scrollToBottom()
    } catch (error) {
      setMessageActionError(error.message || "Không thể sửa tin nhắn.")
    }
  }

  const handleRecallMessage = async (item) => {
    setOpenMenuMessageId(null)

    const confirmed = window.confirm(
      "Bạn có chắc muốn thu hồi tin nhắn này không?"
    )

    if (!confirmed) return

    if (!currentUser?.maTK) {
      setMessageActionError("Không tìm thấy thông tin tài khoản khách hàng.")
      return
    }

    try {
      setMessageActionError("")

      if (isSocketOpen(socketRef.current)) {
        const ok = sendSocketJson(socketRef.current, {
          action: "recall_message",
          idTinNhan: item.id,
        })

        if (ok) {
          return
        }
      }

      const result = await recallConversationMessageApi({
        idTinNhan: item.id,
        idTaiKhoan: currentUser.maTK,
        actor: "customer",
      })

      if (result.conversation) {
        setConversation(result.conversation)
      } else {
        await fetchConversation({ silent: true })
      }

      scrollToBottom()
    } catch (error) {
      setMessageActionError(error.message || "Không thể thu hồi tin nhắn.")
    }
  }

  const messages = conversation?.messages || []

  return (
    <>
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-popup__header">
            <div className="chat-popup__info">
              <div className="chat-popup__avatar-wrap">
                <div className="chat-popup__avatar">
                  <BriefcaseBusiness size={25} />
                </div>
                <span className="chat-popup__status-dot"></span>
              </div>

              <div>
                <h4 className="chat-popup__title">Tư vấn viên Serenity</h4>
                <p className="chat-popup__status">Đang hoạt động</p>
              </div>
            </div>

            <button
              type="button"
              className="chat-popup__close"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-popup__body" ref={bodyRef}>
            {!currentUser?.maTK ? (
              <div className="chat-message">
                <div className="chat-message__icon">
                  <BriefcaseBusiness size={14} />
                </div>

                <div className="chat-message__bubble">
                  Vui lòng đăng nhập để nhắn tin với Serenity Spa.
                </div>
              </div>
            ) : isLoading ? (
              <div className="chat-message">
                <div className="chat-message__icon">
                  <BriefcaseBusiness size={14} />
                </div>

                <div className="chat-message__bubble">
                  Đang tải hội thoại...
                </div>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="chat-message">
                    <div className="chat-message__icon">
                      <BriefcaseBusiness size={14} />
                    </div>

                    <div className="chat-message__bubble">
                      Xin chào! Serenity Spa có thể giúp gì cho bạn hôm nay?
                    </div>
                  </div>
                )}

                {messages.map((item, index) => {
                  const currentDateLabel = getMessageDateLabel(item.createdAt)

                  const previousDateLabel =
                    index > 0
                      ? getMessageDateLabel(messages[index - 1].createdAt)
                      : ""

                  const shouldShowDateDivider =
                    currentDateLabel && currentDateLabel !== previousDateLabel
                  
                  const shouldShowTime = shouldShowMessageTime(messages, index)
                  const isCompactMessage = isSameMessageGroupWithNext(messages, index)

                  return (
                    <Fragment key={item.id}>
                      {shouldShowDateDivider && (
                        <div className="chat-date-divider">
                          <span>{currentDateLabel}</span>
                        </div>
                      )}

                      <div
                        className={[
                          "chat-message",
                          item.sender === "customer"
                            ? "chat-message--customer"
                            : "chat-message--staff",
                          isCompactMessage ? "chat-message--compact" : "",
                        ].join(" ")}
                      >
                        {item.sender !== "customer" && (
                          <div className="chat-message__icon">
                            <BriefcaseBusiness size={14} />
                          </div>
                        )}

                        <div className="chat-message__content-wrap">
                          {editingMessageId === item.id ? (
                            <div className="chat-edit-box">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(event) =>
                                  setEditingText(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    handleSaveEditMessage(item)
                                  }

                                  if (event.key === "Escape") {
                                    handleCancelEditMessage()
                                  }
                                }}
                                autoFocus
                              />

                              <div className="chat-edit-actions">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditMessage(item)}
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
                            <>
                              <div
                                className={
                                  item.daThuHoi
                                    ? "chat-message__bubble chat-message__bubble--recalled"
                                    : "chat-message__bubble"
                                }
                              >
                                {item.daThuHoi
                                  ? "Tin nhắn đã được thu hồi"
                                  : renderMessageContent(item.content)}
                              </div>

                              {(shouldShowTime || (item.daChinhSua && !item.daThuHoi)) && (
                                <div className="chat-message__meta">
                                  {shouldShowTime && (
                                    <span className="chat-message__time">{item.time}</span>
                                  )}

                                  {item.daChinhSua && !item.daThuHoi && (
                                    <span className="chat-message__edited">Đã chỉnh sửa</span>
                                  )}
                                </div>
                              )}

                              {isOwnMessage(item) && !item.daThuHoi && (
                                <div
                                  className={
                                    openMenuMessageId === item.id
                                      ? "chat-message__menu-wrap open"
                                      : "chat-message__menu-wrap"
                                  }
                                >
                                  <button
                                    type="button"
                                    className="chat-message__more-btn"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      setOpenMenuMessageId((currentId) =>
                                        currentId === item.id ? null : item.id
                                      )
                                    }}
                                    title="Tuỳ chọn tin nhắn"
                                  >
                                    <MoreVertical size={17} />
                                  </button>

                                  {openMenuMessageId === item.id && (
                                    <div className="chat-message__dropdown">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStartEditMessage(item)
                                        }
                                      >
                                        Chỉnh sửa
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRecallMessage(item)
                                        }
                                      >
                                        Thu hồi
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  )
                })}
              </>
            )}

            {errorMessage && (
              <div className="chat-popup__error">{errorMessage}</div>
            )}

            {messageActionError && (
              <div className="chat-popup__error">{messageActionError}</div>
            )}
          </div>

          <div className="chat-popup__footer">
            <input
              type="text"
              placeholder={
                currentUser?.maTK
                  ? "Nhập tin nhắn..."
                  : "Bạn cần đăng nhập để nhắn tin"
              }
              value={message}
              disabled={!currentUser?.maTK || isSending}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend()
              }}
            />

            <button
              type="button"
              className="chat-popup__send"
              onClick={handleSend}
              disabled={!currentUser?.maTK || isSending}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          className="floating-chat"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={22} />

          {unreadCount > 0 && (
            <span className="floating-chat__badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  )
}

export default FloatingChat
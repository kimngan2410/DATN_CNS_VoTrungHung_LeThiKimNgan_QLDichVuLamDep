import { useState } from "react"
import { X, Send, BriefcaseBusiness, MessageCircle } from "lucide-react"
import "./FloatingChat.css"

function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (!message.trim()) return
    setMessage("")
  }

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
              className="chat-popup__close"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-popup__body">
            <div className="chat-message">
              <div className="chat-message__icon">
                <BriefcaseBusiness size={14} />
              </div>

              <div className="chat-message__bubble">
                Xin chào! Serenity Spa có thể giúp gì cho bạn hôm nay?
              </div>
            </div>
          </div>

          <div className="chat-popup__footer">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend()
              }}
            />
            <button className="chat-popup__send" onClick={handleSend}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button className="floating-chat" onClick={() => setIsOpen(true)}>
          <MessageCircle size={22} />
        </button>
      )}
    </>
  )
}

export default FloatingChat
import React, { useMemo, useState } from "react";
import {
  Search,
  Bell,
  UserRound,
  Phone,
  Send,
  MessageCircle,
} from "lucide-react";
import "./StaffConversations.css";

const initialConversations = [
  {
    id: "HT001",
    customerName: "Nguyễn Thị Mai",
    phone: "0901234567",
    avatarText: "N",
    lastTime: "16:30",
    unread: 0,
    status: "answered",
    activityStatus: "recent",
    activityText: "Hoạt động 5 phút trước",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Chị muốn đặt lịch massage body chiều nay.",
        time: "16:20",
      },
      {
        id: 2,
        sender: "staff",
        content: "Dạ được ạ, em đã lên lịch cho chị rồi nhé.",
        time: "16:30",
      },
    ],
  },
  {
    id: "HT002",
    customerName: "Lê Thu Hà",
    phone: "0987654321",
    avatarText: "L",
    lastTime: "17:15",
    unread: 1,
    status: "unanswered",
    activityStatus: "online",
    activityText: "Đang hoạt động",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Cho mình hỏi giá tắm trắng phi thuyền là bao nhiêu?",
        time: "17:15",
      },
    ],
  },
  {
    id: "HT003",
    customerName: "Trần Văn Hùng",
    phone: "0912345678",
    avatarText: "T",
    lastTime: "11:45",
    unread: 2,
    status: "unanswered",
    activityStatus: "online",
    activityText: "Đang hoạt động",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Spa có chỗ đậu xe ô tô không?",
        time: "11:42",
      },
      {
        id: 2,
        sender: "customer",
        content: "Mình muốn đặt lịch chiều nay nữa.",
        time: "11:45",
      },
    ],
  },
  {
    id: "HT004",
    customerName: "Hoàng Thu Trang",
    phone: "0945678901",
    avatarText: "H",
    lastTime: "Hôm qua",
    unread: 0,
    status: "answered",
    activityStatus: "offline",
    activityText: "Ngoại tuyến",
    messages: [
      {
        id: 1,
        sender: "customer",
        content: "Cho mình hỏi hôm nay còn lịch làm nail không ạ?",
        time: "16:20",
      },
      {
        id: 2,
        sender: "staff",
        content: "Dạ còn chị nhé. Chị muốn đặt khung giờ nào ạ?",
        time: "16:22",
      },
      {
        id: 3,
        sender: "customer",
        content: "Ok bạn",
        time: "16:25",
      },
      {
        id: 4,
        sender: "staff",
        content: "Dạ em giữ lịch cho chị rồi ạ.",
        time: "16:28",
      },
    ],
  },
];

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
];

const getConversationPreview = (conversation) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  if (!lastMessage) {
    return "";
  }

  if (lastMessage.sender === "staff") {
    return `Bạn: ${lastMessage.content}`;
  }

  return lastMessage.content;
};

function StaffConversations() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesKeyword =
        keyword === "" ||
        conversation.customerName.toLowerCase().includes(keyword) ||
        conversation.phone.includes(keyword);

      const matchesFilter =
        activeFilter === "all" || conversation.status === activeFilter;

      return matchesKeyword && matchesFilter;
    });
  }, [conversations, searchTerm, activeFilter]);

  const selectedConversation = useMemo(() => {
    return conversations.find((item) => item.id === selectedId);
  }, [conversations, selectedId]);

  const handleSelectConversation = (conversationId) => {
    setSelectedId(conversationId);
    setErrorMessage("");

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation
      )
    );
  };

  const handleSendMessage = () => {
    const content = replyText.trim();

    if (!content) {
      setErrorMessage("Vui lòng nhập nội dung phản hồi trước khi gửi.");
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== selectedId) {
          return conversation;
        }

        const newMessage = {
          id: Date.now(),
          sender: "staff",
          content,
          time: currentTime,
        };

        return {
          ...conversation,
          status: "answered",
          unread: 0,
          lastTime: currentTime,
          messages: [...conversation.messages, newMessage],
        };
      })
    );

    setReplyText("");
    setErrorMessage("");
  };

  return (
    <div className="staff-conversations-page">
      <header className="staff-conversations-topbar">
        <h1>Quản lý hội thoại</h1>

        <div className="staff-conversations-topbar-actions">
          <div className="staff-conversations-global-search">
            <Search size={18} />
            <input type="text" placeholder="Tìm kiếm nhanh..." />
          </div>

          <button type="button" className="staff-conversations-bell-btn">
            <Bell size={18} />
            <span></span>
          </button>

          <div className="staff-conversations-user-divider"></div>

          <div className="staff-conversations-user-info">
            <div className="staff-conversations-avatar">
              <UserRound size={18} />
            </div>

            <div>
              <strong>Lễ tân 01</strong>
              <p>Ca sáng</p>
            </div>
          </div>
        </div>
      </header>

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
              {filterOptions.map((option) => (
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
                </button>
              ))}
            </div>

            <div className="conversation-list">
              {filteredConversations.length === 0 ? (
                <div className="conversation-empty">
                  <MessageCircle size={28} />
                  <p>Chưa có hội thoại nào</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isUnread = conversation.unread > 0;
                  const previewText = getConversationPreview(conversation);

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
                  );
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
                      {selectedConversation.avatarText}
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

                <div className="conversation-message-area">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.sender === "staff"
                          ? "message-row staff"
                          : "message-row customer"
                      }
                    >
                      <div className="message-bubble">{message.content}</div>
                      <span className="message-time">{message.time}</span>
                    </div>
                  ))}
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
                      onChange={(event) => {
                        setReplyText(event.target.value);
                        setErrorMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />

                    <button type="button" onClick={handleSendMessage}>
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
  );
}

export default StaffConversations;
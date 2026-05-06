import React, { useState } from "react";
import {
  UserRound,
  Bell,
  ShieldCheck,
  Clock3,
  Palette,
  Save,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import StaffPageHeader from "../../../components/StaffPageHeader/StaffPageHeader";
import "./StaffSettings.css";

function StaffSettings() {
  const [profile, setProfile] = useState({
    fullName: "Lễ tân 01",
    email: "letan01@serenityspa.com",
    phone: "0909 123 456",
    role: "Nhân viên lễ tân",
    shift: "Ca sáng",
  });

  const [notifications, setNotifications] = useState({
    newAppointment: true,
    customerMessage: true,
    paymentSuccess: true,
    systemAlert: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "Sáng",
    language: "Tiếng Việt",
    tableDensity: "Thoải mái",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChangeProfile = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePreference = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleNotification = (field) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTogglePasswordView = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveSettings = () => {
    setSuccessMessage("Đã lưu thay đổi cài đặt thành công.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const handleUpdatePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setSuccessMessage("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSuccessMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setSuccessMessage("Đã cập nhật mật khẩu thành công.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  return (
    <div className="staff-settings-page">
      <StaffPageHeader title="Cài đặt" />

      <section className="staff-settings-content">
        {successMessage && (
          <div className="staff-settings-alert">
            <Check size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="staff-settings-grid">
          <div className="staff-settings-main">
            <div className="staff-settings-card">
              <div className="staff-settings-card-header">
                <div className="staff-settings-card-title">
                  <div className="staff-settings-card-icon">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <h2>Thông tin tài khoản</h2>
                    <p>Cập nhật thông tin cá nhân của nhân viên đang đăng nhập.</p>
                  </div>
                </div>
              </div>

              <div className="staff-settings-form-grid">
                <div className="staff-settings-form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(event) =>
                      handleChangeProfile("fullName", event.target.value)
                    }
                  />
                </div>

                <div className="staff-settings-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      handleChangeProfile("email", event.target.value)
                    }
                  />
                </div>

                <div className="staff-settings-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(event) =>
                      handleChangeProfile("phone", event.target.value)
                    }
                  />
                </div>

                <div className="staff-settings-form-group">
                  <label>Vai trò</label>
                  <input type="text" value={profile.role} readOnly />
                </div>

                <div className="staff-settings-form-group">
                  <label>Ca làm việc</label>
                  <select
                    value={profile.shift}
                    onChange={(event) =>
                      handleChangeProfile("shift", event.target.value)
                    }
                  >
                    <option value="Ca sáng">Ca sáng</option>
                    <option value="Ca chiều">Ca chiều</option>
                    <option value="Ca tối">Ca tối</option>
                  </select>
                </div>
              </div>

              <div className="staff-settings-card-footer">
                <button
                  type="button"
                  className="staff-settings-save-btn"
                  onClick={handleSaveSettings}
                >
                  <Save size={17} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>

            <div className="staff-settings-card">
              <div className="staff-settings-card-header">
                <div className="staff-settings-card-title">
                  <div className="staff-settings-card-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h2>Bảo mật tài khoản</h2>
                    <p>Thay đổi mật khẩu đăng nhập của tài khoản nhân viên.</p>
                  </div>
                </div>
              </div>

              <div className="staff-settings-form-grid">
                <div className="staff-settings-form-group full">
                  <label>Mật khẩu hiện tại</label>
                  <div className="staff-settings-password-field">
                    <input
                      type={
                        showPassword.currentPassword ? "text" : "password"
                      }
                      placeholder="Nhập mật khẩu hiện tại"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        handleChangePassword(
                          "currentPassword",
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleTogglePasswordView("currentPassword")
                      }
                    >
                      {showPassword.currentPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="staff-settings-form-group">
                  <label>Mật khẩu mới</label>
                  <div className="staff-settings-password-field">
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        handleChangePassword("newPassword", event.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => handleTogglePasswordView("newPassword")}
                    >
                      {showPassword.newPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="staff-settings-form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="staff-settings-password-field">
                    <input
                      type={
                        showPassword.confirmPassword ? "text" : "password"
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        handleChangePassword(
                          "confirmPassword",
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleTogglePasswordView("confirmPassword")
                      }
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="staff-settings-card-footer">
                <button
                  type="button"
                  className="staff-settings-save-btn"
                  onClick={handleUpdatePassword}
                >
                  <ShieldCheck size={17} />
                  <span>Cập nhật mật khẩu</span>
                </button>
              </div>
            </div>
          </div>

          <aside className="staff-settings-side">
            <div className="staff-settings-card">
              <div className="staff-settings-card-header">
                <div className="staff-settings-card-title">
                  <div className="staff-settings-card-icon">
                    <Bell size={19} />
                  </div>

                  <div>
                    <h2>Thông báo</h2>
                    <p>Tuỳ chỉnh các thông báo hiển thị cho lễ tân.</p>
                  </div>
                </div>
              </div>

              <div className="staff-settings-toggle-list">
                <div className="staff-settings-toggle-item">
                  <div>
                    <strong>Lịch hẹn mới</strong>
                    <p>Thông báo khi khách đặt lịch mới.</p>
                  </div>

                  <button
                    type="button"
                    className={
                      notifications.newAppointment
                        ? "staff-settings-toggle active"
                        : "staff-settings-toggle"
                    }
                    onClick={() => handleToggleNotification("newAppointment")}
                  >
                    <span></span>
                  </button>
                </div>

                <div className="staff-settings-toggle-item">
                  <div>
                    <strong>Tin nhắn khách hàng</strong>
                    <p>Thông báo khi có hội thoại chưa trả lời.</p>
                  </div>

                  <button
                    type="button"
                    className={
                      notifications.customerMessage
                        ? "staff-settings-toggle active"
                        : "staff-settings-toggle"
                    }
                    onClick={() => handleToggleNotification("customerMessage")}
                  >
                    <span></span>
                  </button>
                </div>

                <div className="staff-settings-toggle-item">
                  <div>
                    <strong>Thanh toán thành công</strong>
                    <p>Thông báo khi giao dịch được thanh toán.</p>
                  </div>

                  <button
                    type="button"
                    className={
                      notifications.paymentSuccess
                        ? "staff-settings-toggle active"
                        : "staff-settings-toggle"
                    }
                    onClick={() => handleToggleNotification("paymentSuccess")}
                  >
                    <span></span>
                  </button>
                </div>

                <div className="staff-settings-toggle-item">
                  <div>
                    <strong>Cảnh báo hệ thống</strong>
                    <p>Thông báo lỗi hoặc cảnh báo từ hệ thống.</p>
                  </div>

                  <button
                    type="button"
                    className={
                      notifications.systemAlert
                        ? "staff-settings-toggle active"
                        : "staff-settings-toggle"
                    }
                    onClick={() => handleToggleNotification("systemAlert")}
                  >
                    <span></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="staff-settings-card">
              <div className="staff-settings-card-header">
                <div className="staff-settings-card-title">
                  <div className="staff-settings-card-icon">
                    <Palette size={19} />
                  </div>

                  <div>
                    <h2>Tuỳ chọn hiển thị</h2>
                    <p>Cài đặt giao diện hiển thị trong trang quản lý.</p>
                  </div>
                </div>
              </div>

              <div className="staff-settings-form-group">
                <label>Giao diện</label>
                <select
                  value={preferences.theme}
                  onChange={(event) =>
                    handleChangePreference("theme", event.target.value)
                  }
                >
                  <option value="Sáng">Sáng</option>
                  <option value="Tối">Tối</option>
                  <option value="Theo hệ thống">Theo hệ thống</option>
                </select>
              </div>

              <div className="staff-settings-form-group">
                <label>Ngôn ngữ</label>
                <select
                  value={preferences.language}
                  onChange={(event) =>
                    handleChangePreference("language", event.target.value)
                  }
                >
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="staff-settings-form-group">
                <label>Mật độ bảng</label>
                <select
                  value={preferences.tableDensity}
                  onChange={(event) =>
                    handleChangePreference("tableDensity", event.target.value)
                  }
                >
                  <option value="Thoải mái">Thoải mái</option>
                  <option value="Vừa phải">Vừa phải</option>
                  <option value="Thu gọn">Thu gọn</option>
                </select>
              </div>

              <div className="staff-settings-card-footer compact">
                <button
                  type="button"
                  className="staff-settings-save-btn full"
                  onClick={handleSaveSettings}
                >
                  <Save size={17} />
                  <span>Lưu tuỳ chọn</span>
                </button>
              </div>
            </div>

            <div className="staff-settings-card staff-settings-shift-card">
              <div className="staff-settings-card-title">
                <div className="staff-settings-card-icon dark">
                  <Clock3 size={19} />
                </div>

                <div>
                  <h2>Ca làm hiện tại</h2>
                  <p>Lễ tân đang được phân công trực quầy trong ca sáng.</p>
                </div>
              </div>

              <div className="staff-settings-shift-box">
                <strong>Ca sáng</strong>
                <span>08:00 - 12:00</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default StaffSettings;
import smtplib
from app.core.config import settings
from datetime import datetime
from email.header import Header
from email.message import EmailMessage
from email.utils import formataddr
from html import escape


def format_money(value):
    try:
        return f"{float(value):,.0f} đ".replace(",", ".")
    except Exception:
        return "0 đ"


def format_datetime_vn(value):
    if not value:
        return ""

    try:
        date_value = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return date_value.strftime("%H:%M ngày %d/%m/%Y")
    except Exception:
        return str(value)


def build_service_rows(booking_data):
    rows = []

    for item in booking_data.get("chiTietLichHen", []):
        ten_dich_vu = escape(str(item.get("tenDichVu", "")))
        so_luong = int(item.get("soLuong", 1) or 1)
        thoi_luong = int(item.get("thoiLuongPhut", 0) or 0)
        thanh_tien = format_money(item.get("thanhTien", 0))

        rows.append(
            f"""
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#2f2a27;">
                    <strong>{ten_dich_vu}</strong><br/>
                    <span style="font-size:13px;color:#777;">Thời lượng: {thoi_luong} phút</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;color:#2f2a27;">
                    {so_luong}
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#d7a93f;font-weight:700;">
                    {thanh_tien}
                </td>
            </tr>
            """
        )

    return "\n".join(rows)


def send_booking_success_email(to_email: str, customer_name: str, booking_data: dict):
    email_host = settings.EMAIL_HOST
    email_port = settings.EMAIL_PORT
    email_username = settings.EMAIL_USERNAME
    email_password = settings.EMAIL_APP_PASSWORD
    email_from_name = settings.EMAIL_FROM_NAME

    if not email_username or not email_password:
        return False, "Đặt lịch thành công nhưng chưa cấu hình email gửi thông báo."

    ma_lh = booking_data.get("maLH", "")
    thoi_gian_bat_dau = format_datetime_vn(booking_data.get("thoiGianBatDau"))
    thoi_gian_ket_thuc = format_datetime_vn(booking_data.get("thoiGianKetThuc"))
    tong_tien = format_money(booking_data.get("tongTienDuKien", 0))
    tong_thoi_luong = booking_data.get("tongThoiLuong", 0)
    so_luong_nguoi = booking_data.get("soLuongNguoi", 1)
    ghi_chu = booking_data.get("ghiChu") or "Không có"

    service_rows = build_service_rows(booking_data)

    subject = f"Xác nhận đặt lịch Serenity Spa - {ma_lh}"

    html_body = f"""
    <div style="margin:0;padding:0;background:#faf8f5;font-family:Arial,sans-serif;color:#2f2a27;">
      <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border-radius:18px;padding:28px;border:1px solid #ece7e1;">
          <h2 style="margin:0;color:#d7a93f;">Serenity Spa</h2>
          <h1 style="margin:14px 0 8px;color:#2f2a27;font-size:24px;">
            Đặt lịch thành công
          </h1>

          <p style="margin:0 0 18px;color:#5f554e;line-height:1.6;">
            Xin chào <strong>{escape(customer_name)}</strong>, Serenity Spa đã nhận được lịch hẹn của bạn.
            Lịch hẹn hiện đang ở trạng thái <strong>Chờ xác nhận</strong>.
          </p>

          <div style="background:#fffaf0;border:1px solid #ead7ad;border-radius:14px;padding:16px;margin:18px 0;">
            <p style="margin:0 0 8px;"><strong>Mã lịch hẹn:</strong> {escape(str(ma_lh))}</p>
            <p style="margin:0 0 8px;"><strong>Thời gian bắt đầu:</strong> {escape(thoi_gian_bat_dau)}</p>
            <p style="margin:0 0 8px;"><strong>Thời gian kết thúc dự kiến:</strong> {escape(thoi_gian_ket_thuc)}</p>
            <p style="margin:0 0 8px;"><strong>Số lượng người:</strong> {so_luong_nguoi}</p>
            <p style="margin:0;"><strong>Ghi chú:</strong> {escape(str(ghi_chu))}</p>
          </div>

          <h3 style="margin:22px 0 10px;color:#2f2a27;">Dịch vụ đã đặt</h3>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 0;color:#667085;border-bottom:1px solid #eee;">Dịch vụ</th>
                <th style="text-align:center;padding:8px 0;color:#667085;border-bottom:1px solid #eee;">SL</th>
                <th style="text-align:right;padding:8px 0;color:#667085;border-bottom:1px solid #eee;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {service_rows}
            </tbody>
          </table>

          <div style="margin-top:18px;text-align:right;">
            <p style="margin:0 0 8px;color:#5f554e;">
              Tổng thời lượng: <strong>{tong_thoi_luong} phút</strong>
            </p>
            <p style="margin:0;color:#2f2a27;font-size:20px;">
              Tổng tiền dự kiến:
              <strong style="color:#d7a93f;">{tong_tien}</strong>
            </p>
          </div>

          <p style="margin:24px 0 0;color:#667085;line-height:1.6;font-size:14px;">
            Serenity Spa sẽ liên hệ xác nhận lịch hẹn của bạn trong thời gian sớm nhất.
            Cảm ơn bạn đã tin tưởng sử dụng dịch vụ.
          </p>
        </div>
      </div>
    </div>
    """

    text_body = f"""
Serenity Spa - Đặt lịch thành công

Xin chào {customer_name},

Serenity Spa đã nhận được lịch hẹn của bạn.

Mã lịch hẹn: {ma_lh}
Thời gian bắt đầu: {thoi_gian_bat_dau}
Thời gian kết thúc dự kiến: {thoi_gian_ket_thuc}
Số lượng người: {so_luong_nguoi}
Tổng thời lượng: {tong_thoi_luong} phút
Tổng tiền dự kiến: {tong_tien}
Trạng thái: Chờ xác nhận

Serenity Spa sẽ liên hệ xác nhận lịch hẹn của bạn trong thời gian sớm nhất.
"""

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = formataddr((str(Header(email_from_name, "utf-8")), email_username))
    message["To"] = to_email

    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(email_host, email_port, timeout=20) as server:
            server.starttls()
            server.login(email_username, email_password)
            server.send_message(message)

        return True, "Email xác nhận đặt lịch đã được gửi đến tài khoản của bạn."
    except Exception as error:
        return False, f"Đặt lịch thành công nhưng gửi email thất bại: {str(error)}"
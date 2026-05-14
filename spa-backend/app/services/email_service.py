import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status

from app.core.config import settings


def send_otp_email(to_email: str, otp_code: str) -> None:
    if not settings.EMAIL_USERNAME or not settings.EMAIL_APP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chưa cấu hình email gửi OTP trong file .env",
        )

    subject = "Mã xác thực đăng ký Serenity Spa"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; background: #f8f5ef; padding: 24px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; padding: 28px; border: 1px solid #eee4d4;">
        <h2 style="margin: 0 0 12px; color: #4d4a4b;">Serenity Spa</h2>

        <p style="font-size: 15px; color: #4d4a4b; line-height: 1.6;">
          Xin chào,<br/>
          Bạn đang đăng ký tài khoản tại hệ thống Serenity Spa.
          Vui lòng sử dụng mã OTP bên dưới để xác thực email.
        </p>

        <div style="margin: 26px 0; text-align: center;">
          <div style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #d7a93f; background: #fbf6e8; padding: 14px 22px; border-radius: 14px;">
            {otp_code}
          </div>
        </div>

        <p style="font-size: 14px; color: #6b625c; line-height: 1.6;">
          Mã OTP có hiệu lực trong <strong>5 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
        </p>

        <hr style="border: none; border-top: 1px solid #eee4d4; margin: 22px 0;" />

        <p style="font-size: 13px; color: #9a918a;">
          Email này được gửi tự động từ hệ thống Serenity Spa.
        </p>
      </div>
    </div>
    """

    text_content = f"""
    Serenity Spa

    Mã OTP đăng ký của bạn là: {otp_code}

    Mã OTP có hiệu lực trong 5 phút.
    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_USERNAME}>"
    message["To"] = to_email

    message.attach(MIMEText(text_content, "plain", "utf-8"))
    message.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_APP_PASSWORD)
            server.sendmail(
                settings.EMAIL_USERNAME,
                to_email,
                message.as_string(),
            )

    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không đăng nhập được SMTP. Hãy kiểm tra EMAIL_USERNAME hoặc EMAIL_APP_PASSWORD.",
        )

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi gửi email OTP: {str(error)}",
        )
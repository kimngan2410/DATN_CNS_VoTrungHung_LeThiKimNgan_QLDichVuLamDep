import random
import re
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import quote_plus

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.khach_hang import KhachHang
from app.models.otp_xac_thuc import OTPXacThuc
from app.models.tai_khoan import TaiKhoan
from app.schemas.auth_schema import (
    ChangePasswordRequest,
    ForgotPasswordResendOtpRequest,
    ForgotPasswordResetRequest,
    ForgotPasswordSendOtpRequest,
    ForgotPasswordVerifyOtpRequest,
    RegisterResendOtpRequest,
    RegisterSendOtpRequest,
    RegisterVerifyOtpRequest,
)
from app.services.email_service import send_otp_email


OTP_EXPIRE_MINUTES = 5


def make_default_avatar(name: str | None, email: str | None) -> str:
    display_name = name or (email.split("@")[0] if email else "User")
    encoded_name = quote_plus(display_name)

    return (
        "https://ui-avatars.com/api/"
        f"?name={encoded_name}"
        "&background=d7a93f"
        "&color=ffffff"
        "&size=128"
        "&bold=true"
    )


DEFAULT_AVATAR = make_default_avatar("Khách hàng", None)


def is_valid_avatar_url(avatar: str | None) -> bool:
    if not avatar:
        return False

    avatar = avatar.strip()

    return (
        avatar.startswith("http://")
        or avatar.startswith("https://")
        or avatar.startswith("/")
        or avatar.startswith("data:image/")
    )


def get_safe_avatar(
    khach_hang: Optional[KhachHang],
    tai_khoan: TaiKhoan,
) -> str:
    ho_ten = khach_hang.hoTen if khach_hang else None
    avatar = khach_hang.anhDaiDien if khach_hang else None

    if is_valid_avatar_url(avatar):
        return avatar.strip()

    return make_default_avatar(ho_ten, tai_khoan.email)


def map_role_to_frontend(loai_tk: str) -> str:
    if loai_tk == "ADMIN":
        return "Admin"

    if loai_tk == "NHAN_VIEN":
        return "NhanVien"

    if loai_tk == "KHACH_HANG":
        return "KhachHang"

    return loai_tk


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def generate_customer_code(db: Session) -> str:
    max_id = db.query(func.max(KhachHang.idKhachHang)).scalar() or 0
    next_number = int(max_id) + 1
    return f"KH{next_number:04d}"


def build_user_payload(
    tai_khoan: TaiKhoan,
    khach_hang: Optional[KhachHang] = None,
):
    return {
        "maTK": tai_khoan.idTaiKhoan,
        "email": tai_khoan.email,
        "vaiTro": map_role_to_frontend(tai_khoan.loaiTK),
        "maKH": khach_hang.idKhachHang if khach_hang else None,
        "maNV": None,
        "hoTen": khach_hang.hoTen if khach_hang else None,
        "avatar": get_safe_avatar(khach_hang, tai_khoan),
    }


def build_login_response(
    tai_khoan: TaiKhoan,
    khach_hang: Optional[KhachHang] = None,
):
    user = build_user_payload(tai_khoan, khach_hang)

    access_token = create_access_token(
        data={
            "sub": str(user["maTK"]),
            "email": user["email"],
            "vaiTro": user["vaiTro"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


def authenticate_user(db: Session, email: str, password: str):
    email = email.strip().lower()

    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if not tai_khoan:
        return None

    if tai_khoan.trangThai == "KHOA":
        return None

    if tai_khoan.loaiTK == "KHACH_HANG" and not tai_khoan.emailDaXacThuc:
        return None

    if not tai_khoan.matKhau:
        return None

    is_valid_password = verify_password(password, tai_khoan.matKhau)

    # Hỗ trợ tạm nếu DB cũ từng lưu mật khẩu dạng text thường.
    if not is_valid_password and password == tai_khoan.matKhau:
        tai_khoan.matKhau = hash_password(password)
        db.commit()
        db.refresh(tai_khoan)
        is_valid_password = True

    if not is_valid_password:
        return None

    tai_khoan.lanDangNhapCuoi = datetime.now()

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
        .first()
    )

    db.commit()
    db.refresh(tai_khoan)

    return build_user_payload(tai_khoan, khach_hang)

def validate_strong_password(password: str):
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng nhập mật khẩu",
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 8 ký tự",
        )

    if re.search(r"\s", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu không được chứa khoảng trắng",
        )

    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 1 chữ hoa",
        )

    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 1 chữ thường",
        )

    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 1 chữ số",
        )

    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
        )

def send_register_otp(db: Session, payload: RegisterSendOtpRequest):
    email = payload.email.strip().lower()
    phone = payload.sdt.strip()
    ho_ten = payload.hoTen.strip()

    if payload.password != payload.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp",
        )
    
    validate_strong_password(payload.password)

    existing_account = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if existing_account and existing_account.emailDaXacThuc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại",
        )

    existing_phone = db.query(KhachHang).filter(KhachHang.sdt == phone).first()

    if existing_phone:
        if (
            not existing_account
            or existing_phone.idTaiKhoan != existing_account.idTaiKhoan
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại đã tồn tại",
            )

    try:
        default_avatar = make_default_avatar(ho_ten, email)

        if existing_account and not existing_account.emailDaXacThuc:
            tai_khoan = existing_account

            tai_khoan.matKhau = hash_password(payload.password)
            tai_khoan.loaiTK = "KHACH_HANG"
            tai_khoan.trangThai = "HOAT_DONG"
            tai_khoan.loaiDangNhap = "LOCAL"

            khach_hang = (
                db.query(KhachHang)
                .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
                .first()
            )

            if khach_hang:
                khach_hang.hoTen = ho_ten
                khach_hang.sdt = phone
                khach_hang.loaiKH = khach_hang.loaiKH or "Thường"

                if not is_valid_avatar_url(khach_hang.anhDaiDien):
                    khach_hang.anhDaiDien = default_avatar
            else:
                khach_hang = KhachHang(
                    idTaiKhoan=tai_khoan.idTaiKhoan,
                    maKH=generate_customer_code(db),
                    hoTen=ho_ten,
                    sdt=phone,
                    loaiKH="Thường",
                    anhDaiDien=default_avatar,
                )
                db.add(khach_hang)

        else:
            tai_khoan = TaiKhoan(
                email=email,
                matKhau=hash_password(payload.password),
                loaiTK="KHACH_HANG",
                trangThai="HOAT_DONG",
                emailDaXacThuc=False,
                loaiDangNhap="LOCAL",
            )

            db.add(tai_khoan)
            db.flush()

            khach_hang = KhachHang(
                idTaiKhoan=tai_khoan.idTaiKhoan,
                maKH=generate_customer_code(db),
                hoTen=ho_ten,
                sdt=phone,
                loaiKH="Thường",
                anhDaiDien=default_avatar,
            )

            db.add(khach_hang)

        db.query(OTPXacThuc).filter(
            OTPXacThuc.idTaiKhoan == tai_khoan.idTaiKhoan,
            OTPXacThuc.loaiOTP == "DANG_KY",
            OTPXacThuc.daSuDung.is_(False),
        ).update(
            {OTPXacThuc.daSuDung: True},
            synchronize_session=False,
        )

        otp_code = generate_otp()
        now = datetime.now()

        otp = OTPXacThuc(
            idTaiKhoan=tai_khoan.idTaiKhoan,
            maOTP=otp_code,
            loaiOTP="DANG_KY",
            thoiGianHetHan=now + timedelta(minutes=OTP_EXPIRE_MINUTES),
            daSuDung=False,
            soLanGui=1,
            thoiGianGuiCuoi=now,
        )

        db.add(otp)
        db.commit()

        send_otp_email(to_email=email, otp_code=otp_code)

        return {
            "message": "Mã OTP đã được gửi đến email đăng ký",
            "email": email,
            "expires_in_seconds": OTP_EXPIRE_MINUTES * 60,
            "dev_otp": None,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi gửi OTP đăng ký: {str(error)}",
        )


def verify_register_otp(db: Session, payload: RegisterVerifyOtpRequest):
    email = payload.email.strip().lower()
    otp_code = payload.otp.strip()

    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản đăng ký",
        )

    if tai_khoan.emailDaXacThuc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được xác thực",
        )

    otp = (
        db.query(OTPXacThuc)
        .filter(
            OTPXacThuc.idTaiKhoan == tai_khoan.idTaiKhoan,
            OTPXacThuc.loaiOTP == "DANG_KY",
            OTPXacThuc.daSuDung.is_(False),
        )
        .order_by(OTPXacThuc.otp_id.desc())
        .first()
    )

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không tìm thấy mã OTP hợp lệ",
        )

    if otp.thoiGianHetHan < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP đã hết hạn",
        )

    if otp.maOTP != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP không đúng",
        )

    try:
        otp.daSuDung = True
        tai_khoan.emailDaXacThuc = True
        tai_khoan.lanDangNhapCuoi = datetime.now()

        khach_hang = (
            db.query(KhachHang)
            .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
            .first()
        )

        if khach_hang and not is_valid_avatar_url(khach_hang.anhDaiDien):
            khach_hang.anhDaiDien = make_default_avatar(
                khach_hang.hoTen,
                tai_khoan.email,
            )

        db.commit()
        db.refresh(tai_khoan)

        return build_login_response(tai_khoan, khach_hang)

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xác nhận OTP đăng ký: {str(error)}",
        )


def resend_register_otp(db: Session, payload: RegisterResendOtpRequest):
    email = payload.email.strip().lower()

    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản đăng ký",
        )

    if tai_khoan.emailDaXacThuc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản này đã xác thực email",
        )

    latest_otp = (
        db.query(OTPXacThuc)
        .filter(
            OTPXacThuc.idTaiKhoan == tai_khoan.idTaiKhoan,
            OTPXacThuc.loaiOTP == "DANG_KY",
            OTPXacThuc.daSuDung.is_(False),
        )
        .order_by(OTPXacThuc.otp_id.desc())
        .first()
    )

    try:
        if latest_otp:
            latest_otp.daSuDung = True

        otp_code = generate_otp()
        now = datetime.now()

        new_otp = OTPXacThuc(
            idTaiKhoan=tai_khoan.idTaiKhoan,
            maOTP=otp_code,
            loaiOTP="DANG_KY",
            thoiGianHetHan=now + timedelta(minutes=OTP_EXPIRE_MINUTES),
            daSuDung=False,
            soLanGui=(latest_otp.soLanGui + 1) if latest_otp else 1,
            thoiGianGuiCuoi=now,
        )

        db.add(new_otp)
        db.commit()

        send_otp_email(to_email=email, otp_code=otp_code)

        return {
            "message": "Mã OTP mới đã được gửi lại email đăng ký",
            "email": email,
            "expires_in_seconds": OTP_EXPIRE_MINUTES * 60,
            "dev_otp": None,
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi gửi lại OTP: {str(error)}",
        )


def create_or_login_social_user(
    db: Session,
    email: str,
    full_name: str,
    avatar: str | None,
    provider: str,
):
    email = email.strip().lower()
    provider = provider.upper()

    if provider not in ["GOOGLE", "FACEBOOK"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nhà cung cấp đăng nhập không hợp lệ",
        )

    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    try:
        is_new_account = tai_khoan is None

        if tai_khoan:
            if tai_khoan.trangThai == "KHOA":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Tài khoản đã bị khóa",
                )

            tai_khoan.emailDaXacThuc = True
            tai_khoan.loaiDangNhap = provider
            tai_khoan.lanDangNhapCuoi = datetime.now()

        else:
            tai_khoan = TaiKhoan(
                email=email,
                matKhau=None,
                loaiTK="KHACH_HANG",
                trangThai="HOAT_DONG",
                emailDaXacThuc=True,
                loaiDangNhap=provider,
                lanDangNhapCuoi=datetime.now(),
            )

            db.add(tai_khoan)
            db.flush()

        khach_hang = (
            db.query(KhachHang)
            .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
            .first()
        )

        safe_name = full_name.strip() if full_name else "Khách hàng"
        safe_avatar = avatar.strip() if avatar and is_valid_avatar_url(avatar) else None

        if tai_khoan.loaiTK == "KHACH_HANG":
            if khach_hang:
                # Chỉ lấy tên từ Google/Facebook nếu khách hàng chưa có tên.
                # Không ghi đè tên người dùng đã tự cập nhật trong hệ thống.
                if not khach_hang.hoTen and safe_name:
                    khach_hang.hoTen = safe_name

                # Chỉ lấy avatar từ Google/Facebook nếu avatar trong DB đang trống/không hợp lệ.
                # Không ghi đè avatar người dùng đã upload trong hệ thống.
                if not is_valid_avatar_url(khach_hang.anhDaiDien):
                    khach_hang.anhDaiDien = (
                        safe_avatar
                        or make_default_avatar(khach_hang.hoTen, tai_khoan.email)
                    )

                khach_hang.loaiKH = khach_hang.loaiKH or "Thường"

            else:
                khach_hang = KhachHang(
                    idTaiKhoan=tai_khoan.idTaiKhoan,
                    maKH=generate_customer_code(db),
                    hoTen=safe_name,
                    sdt=None,
                    loaiKH="Thường",
                    anhDaiDien=safe_avatar
                    or make_default_avatar(safe_name, tai_khoan.email),
                )

                db.add(khach_hang)

        db.commit()
        db.refresh(tai_khoan)

        return build_login_response(tai_khoan, khach_hang)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi đăng nhập {provider}: {str(error)}",
        )
    
FORGOT_PASSWORD_OTP_TYPE = "QUEN_MAT_KHAU"
RESEND_OTP_COOLDOWN_SECONDS = 60


def get_latest_forgot_password_otp(db: Session, tai_khoan_id: int):
    return (
        db.query(OTPXacThuc)
        .filter(
            OTPXacThuc.idTaiKhoan == tai_khoan_id,
            OTPXacThuc.loaiOTP == FORGOT_PASSWORD_OTP_TYPE,
            OTPXacThuc.daSuDung.is_(False),
        )
        .order_by(OTPXacThuc.otp_id.desc())
        .first()
    )


def validate_forgot_password_account(db: Session, email: str):
    email = email.strip().lower()

    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản với email này",
        )

    if tai_khoan.trangThai == "KHOA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    if tai_khoan.loaiTK == "KHACH_HANG" and not tai_khoan.emailDaXacThuc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản chưa xác thực email",
        )

    if not tai_khoan.matKhau:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản này đăng nhập bằng Google/Facebook, vui lòng dùng phương thức đăng nhập tương ứng",
        )

    return tai_khoan


def send_forgot_password_otp(db: Session, payload: ForgotPasswordSendOtpRequest):
    email = payload.email.strip().lower()
    tai_khoan = validate_forgot_password_account(db, email)

    try:
        db.query(OTPXacThuc).filter(
            OTPXacThuc.idTaiKhoan == tai_khoan.idTaiKhoan,
            OTPXacThuc.loaiOTP == FORGOT_PASSWORD_OTP_TYPE,
            OTPXacThuc.daSuDung.is_(False),
        ).update(
            {OTPXacThuc.daSuDung: True},
            synchronize_session=False,
        )

        otp_code = generate_otp()
        now = datetime.now()

        otp = OTPXacThuc(
            idTaiKhoan=tai_khoan.idTaiKhoan,
            maOTP=otp_code,
            loaiOTP=FORGOT_PASSWORD_OTP_TYPE,
            thoiGianHetHan=now + timedelta(minutes=OTP_EXPIRE_MINUTES),
            daSuDung=False,
            soLanGui=1,
            thoiGianGuiCuoi=now,
        )

        db.add(otp)
        db.commit()

        send_otp_email(to_email=email, otp_code=otp_code)

        return {
            "message": "Mã OTP đặt lại mật khẩu đã được gửi đến email",
            "email": email,
            "expires_in_seconds": OTP_EXPIRE_MINUTES * 60,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi gửi OTP quên mật khẩu: {str(error)}",
        )


def resend_forgot_password_otp(
    db: Session,
    payload: ForgotPasswordResendOtpRequest,
):
    email = payload.email.strip().lower()
    tai_khoan = validate_forgot_password_account(db, email)

    latest_otp = get_latest_forgot_password_otp(db, tai_khoan.idTaiKhoan)

    if latest_otp and latest_otp.thoiGianGuiCuoi:
        seconds_from_last_send = (
            datetime.now() - latest_otp.thoiGianGuiCuoi
        ).total_seconds()

        if seconds_from_last_send < RESEND_OTP_COOLDOWN_SECONDS:
            wait_seconds = int(RESEND_OTP_COOLDOWN_SECONDS - seconds_from_last_send)

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Vui lòng chờ {wait_seconds} giây trước khi gửi lại mã OTP",
            )

    try:
        if latest_otp:
            latest_otp.daSuDung = True

        otp_code = generate_otp()
        now = datetime.now()

        new_otp = OTPXacThuc(
            idTaiKhoan=tai_khoan.idTaiKhoan,
            maOTP=otp_code,
            loaiOTP=FORGOT_PASSWORD_OTP_TYPE,
            thoiGianHetHan=now + timedelta(minutes=OTP_EXPIRE_MINUTES),
            daSuDung=False,
            soLanGui=(latest_otp.soLanGui + 1) if latest_otp else 1,
            thoiGianGuiCuoi=now,
        )

        db.add(new_otp)
        db.commit()

        send_otp_email(to_email=email, otp_code=otp_code)

        return {
            "message": "Mã OTP mới đã được gửi lại email",
            "email": email,
            "expires_in_seconds": OTP_EXPIRE_MINUTES * 60,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi gửi lại OTP quên mật khẩu: {str(error)}",
        )


def verify_forgot_password_otp(
    db: Session,
    payload: ForgotPasswordVerifyOtpRequest,
):
    email = payload.email.strip().lower()
    otp_code = payload.otp.strip()

    tai_khoan = validate_forgot_password_account(db, email)

    otp = get_latest_forgot_password_otp(db, tai_khoan.idTaiKhoan)

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không tìm thấy mã OTP hợp lệ",
        )

    if otp.thoiGianHetHan < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP đã hết hạn",
        )

    if otp.maOTP != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP không đúng",
        )

    return {
        "message": "Xác minh OTP thành công",
        "email": email,
    }


def reset_password_by_otp(db: Session, payload: ForgotPasswordResetRequest):
    email = payload.email.strip().lower()
    otp_code = payload.otp.strip()

    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp",
        )

    validate_strong_password(payload.newPassword)

    tai_khoan = validate_forgot_password_account(db, email)

    otp = get_latest_forgot_password_otp(db, tai_khoan.idTaiKhoan)

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không tìm thấy mã OTP hợp lệ",
        )

    if otp.thoiGianHetHan < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP đã hết hạn",
        )

    if otp.maOTP != otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã OTP không đúng",
        )

    try:
        tai_khoan.matKhau = hash_password(payload.newPassword)
        tai_khoan.loaiDangNhap = "LOCAL"
        tai_khoan.lanDangNhapCuoi = None

        otp.daSuDung = True

        db.commit()

        return {
            "message": "Đặt lại mật khẩu thành công",
            "email": email,
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi đặt lại mật khẩu: {str(error)}",
        )
    
def change_password(
    db: Session,
    id_tai_khoan: int,
    payload: ChangePasswordRequest,
):
    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản",
        )

    if tai_khoan.trangThai == "KHOA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    if not tai_khoan.matKhau:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản này đăng nhập bằng Google/Facebook nên chưa có mật khẩu để đổi",
        )

    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp",
        )

    validate_strong_password(payload.newPassword)

    if payload.currentPassword == payload.newPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới không được trùng với mật khẩu hiện tại",
        )

    is_valid_current_password = verify_password(
        payload.currentPassword,
        tai_khoan.matKhau,
    )

    # Hỗ trợ nếu DB cũ từng lưu mật khẩu dạng text thường.
    if not is_valid_current_password and payload.currentPassword == tai_khoan.matKhau:
        is_valid_current_password = True

    if not is_valid_current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác",
        )

    try:
        tai_khoan.matKhau = hash_password(payload.newPassword)
        tai_khoan.loaiDangNhap = "LOCAL"
        tai_khoan.ngayCapNhat = datetime.now()

        db.commit()

        return {
            "message": "Đổi mật khẩu thành công",
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi đổi mật khẩu: {str(error)}",
        )
import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.services.email_service import send_otp_email
from app.models.khach_hang import KhachHang
from app.models.otp_xac_thuc import OTPXacThuc
from app.models.tai_khoan import TaiKhoan
from app.schemas.auth_schema import (
    RegisterResendOtpRequest,
    RegisterSendOtpRequest,
    RegisterVerifyOtpRequest,
)


DEFAULT_AVATAR = (
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"
)

OTP_EXPIRE_MINUTES = 5


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


def build_login_response(
    tai_khoan: TaiKhoan,
    khach_hang: Optional[KhachHang] = None,
):
    user = {
        "maTK": tai_khoan.idTaiKhoan,
        "email": tai_khoan.email,
        "vaiTro": map_role_to_frontend(tai_khoan.loaiTK),
        "maKH": khach_hang.idKhachHang if khach_hang else None,
        "maNV": None,
        "hoTen": khach_hang.hoTen if khach_hang else None,
        "avatar": (
            khach_hang.anhDaiDien
            if khach_hang and khach_hang.anhDaiDien
            else DEFAULT_AVATAR
        ),
    }

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

    is_valid_password = verify_password(password, tai_khoan.matKhau)

    # Hỗ trợ tạm nếu DB cũ từng lưu mật khẩu dạng text thường.
    if not is_valid_password and password == tai_khoan.matKhau:
        tai_khoan.matKhau = hash_password(password)
        db.commit()
        db.refresh(tai_khoan)
        is_valid_password = True

    if not is_valid_password:
        return None

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
        .first()
    )

    return {
        "maTK": tai_khoan.idTaiKhoan,
        "email": tai_khoan.email,
        "vaiTro": map_role_to_frontend(tai_khoan.loaiTK),
        "maKH": khach_hang.idKhachHang if khach_hang else None,
        "maNV": None,
        "hoTen": khach_hang.hoTen if khach_hang else None,
        "avatar": (
            khach_hang.anhDaiDien
            if khach_hang and khach_hang.anhDaiDien
            else DEFAULT_AVATAR
        ),
    }


def send_register_otp(db: Session, payload: RegisterSendOtpRequest):
    email = payload.email.strip().lower()
    phone = payload.sdt.strip()

    if payload.password != payload.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp",
        )

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
                khach_hang.hoTen = payload.hoTen.strip()
                khach_hang.sdt = phone
                khach_hang.anhDaiDien = khach_hang.anhDaiDien or DEFAULT_AVATAR
                khach_hang.loaiKH = khach_hang.loaiKH or "Thường"
            else:
                khach_hang = KhachHang(
                    idTaiKhoan=tai_khoan.idTaiKhoan,
                    maKH=generate_customer_code(db),
                    hoTen=payload.hoTen.strip(),
                    sdt=phone,
                    loaiKH="Thường",
                    anhDaiDien=DEFAULT_AVATAR,
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
                hoTen=payload.hoTen.strip(),
                sdt=phone,
                loaiKH="Thường",
                anhDaiDien=DEFAULT_AVATAR,
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

        if tai_khoan.loaiTK == "KHACH_HANG":
            if khach_hang:
                if full_name:
                    khach_hang.hoTen = full_name

                if avatar:
                    khach_hang.anhDaiDien = avatar

                khach_hang.loaiKH = khach_hang.loaiKH or "Thường"

            else:
                khach_hang = KhachHang(
                    idTaiKhoan=tai_khoan.idTaiKhoan,
                    maKH=generate_customer_code(db),
                    hoTen=full_name or "Khách hàng",
                    sdt=None,
                    loaiKH="Thường",
                    anhDaiDien=avatar or DEFAULT_AVATAR,
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

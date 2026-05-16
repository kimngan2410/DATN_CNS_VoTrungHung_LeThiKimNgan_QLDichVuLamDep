import shutil
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.khach_hang import KhachHang
from app.models.tai_khoan import TaiKhoan


AVATAR_UPLOAD_DIR = Path("uploads/avatars")
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_AVATAR_SIZE = 2 * 1024 * 1024

DEFAULT_AVATAR = (
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"
)


def generate_customer_code(db: Session) -> str:
    max_id = db.query(func.max(KhachHang.idKhachHang)).scalar() or 0
    next_number = int(max_id) + 1

    while True:
        code = f"KH{next_number:05d}"

        existed = db.query(KhachHang).filter(KhachHang.maKH == code).first()

        if not existed:
            return code

        next_number += 1


def format_birth_date(value):
    if not value:
        return ""

    return value.strftime("%Y-%m-%d")


def build_profile_response(tai_khoan: TaiKhoan, khach_hang: KhachHang):
    return {
        "idTaiKhoan": int(tai_khoan.idTaiKhoan),
        "idKhachHang": int(khach_hang.idKhachHang) if khach_hang else None,
        "maKH": khach_hang.maKH if khach_hang else None,
        "fullName": khach_hang.hoTen if khach_hang else tai_khoan.email.split("@")[0],
        "email": tai_khoan.email,
        "phone": khach_hang.sdt or "" if khach_hang else "",
        "birthDate": format_birth_date(khach_hang.ngaySinh) if khach_hang else "",
        "gender": khach_hang.gioiTinh or "" if khach_hang else "",
        "avatar": khach_hang.anhDaiDien or DEFAULT_AVATAR if khach_hang else DEFAULT_AVATAR,
        "customerType": khach_hang.loaiKH if khach_hang else "Thường",
        "accountType": tai_khoan.loaiTK,
        "loginType": tai_khoan.loaiDangNhap,
        "status": tai_khoan.trangThai,
    }


def get_account_or_404(db: Session, id_tai_khoan: int) -> TaiKhoan:
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

    return tai_khoan


def get_or_create_customer(db: Session, tai_khoan: TaiKhoan) -> KhachHang:
    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == tai_khoan.idTaiKhoan)
        .first()
    )

    if khach_hang:
        return khach_hang

    khach_hang = KhachHang(
        idTaiKhoan=tai_khoan.idTaiKhoan,
        maKH=generate_customer_code(db),
        hoTen=tai_khoan.email.split("@")[0],
        sdt=None,
        ngaySinh=None,
        gioiTinh=None,
        anhDaiDien=None,
        loaiKH="Thường",
    )

    db.add(khach_hang)
    db.commit()
    db.refresh(khach_hang)

    return khach_hang


def get_customer_profile(db: Session, id_tai_khoan: int):
    tai_khoan = get_account_or_404(db, id_tai_khoan)
    khach_hang = get_or_create_customer(db, tai_khoan)

    return build_profile_response(tai_khoan, khach_hang)


def parse_birth_date(birth_date: str | None):
    if not birth_date:
        return None

    try:
        selected_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày sinh không đúng định dạng",
        )

    today = datetime.now().date()

    if selected_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày sinh không được lớn hơn ngày hiện tại",
        )

    return selected_date


def validate_phone(db: Session, id_tai_khoan: int, phone: str | None):
    if not phone:
        return None

    phone = phone.strip()

    existed = (
        db.query(KhachHang)
        .filter(
            KhachHang.sdt == phone,
            KhachHang.idTaiKhoan != id_tai_khoan,
        )
        .first()
    )

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại đã được sử dụng bởi tài khoản khác",
        )

    return phone


def save_avatar_file(avatar: UploadFile | None, id_tai_khoan: int):
    if not avatar:
        return None

    if avatar.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh đại diện không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.",
        )

    avatar.file.seek(0, 2)
    file_size = avatar.file.tell()
    avatar.file.seek(0)

    if file_size > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ảnh đại diện vượt quá dung lượng cho phép. Tối đa 2MB.",
        )

    AVATAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    original_name = avatar.filename or ""
    suffix = Path(original_name).suffix.lower()

    if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
        suffix = ".jpg"

    file_name = f"avatar_{id_tai_khoan}_{uuid4().hex}{suffix}"
    file_path = AVATAR_UPLOAD_DIR / file_name

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(avatar.file, buffer)

    return f"/uploads/avatars/{file_name}"


def update_customer_profile(
    db: Session,
    id_tai_khoan: int,
    full_name: str,
    phone: str | None,
    birth_date: str | None,
    gender: str | None,
    avatar: UploadFile | None,
):
    tai_khoan = get_account_or_404(db, id_tai_khoan)
    khach_hang = get_or_create_customer(db, tai_khoan)

    full_name = full_name.strip()

    if len(full_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Họ và tên phải có ít nhất 2 ký tự",
        )

    valid_genders = ["Nam", "Nữ", "Khác", ""]

    if gender not in valid_genders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giới tính không hợp lệ",
        )

    khach_hang.hoTen = full_name
    khach_hang.sdt = validate_phone(db, id_tai_khoan, phone)
    khach_hang.ngaySinh = parse_birth_date(birth_date)
    khach_hang.gioiTinh = gender or None

    avatar_url = save_avatar_file(avatar, id_tai_khoan)

    if avatar_url:
        khach_hang.anhDaiDien = avatar_url

    db.commit()
    db.refresh(khach_hang)

    return build_profile_response(tai_khoan, khach_hang)
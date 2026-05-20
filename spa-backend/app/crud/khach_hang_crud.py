import shutil
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
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

COMPLETED_APPOINTMENT_STATUS = "Đã hoàn thành"


def format_date_value(value):
    if not value:
        return ""

    return value.strftime("%Y-%m-%d")


def format_time_value(value):
    if not value:
        return ""

    return value.strftime("%H:%M")


def get_account_status_label(status_value: str | None):
    if status_value in ["KHOA", "Tạm khoá", "Tạm khóa", "LOCKED"]:
        return "Tạm khoá"

    return "Đang hoạt động"


def get_account_status_value(status_label: str | None):
    if status_label in ["Tạm khoá", "Tạm khóa", "KHOA"]:
        return "KHOA"

    return "Hoạt động"


def get_customer_avatar_text(full_name: str):
    full_name = (full_name or "K").strip()

    if not full_name:
        return "K"

    return full_name[0].upper()


def get_appointment_services_text(db: Session, id_lich_hen: int):
    rows = (
        db.query(DichVu.tenDV)
        .join(ChiTietLichHen, ChiTietLichHen.idDichVu == DichVu.idDichVu)
        .filter(ChiTietLichHen.idLichHen == id_lich_hen)
        .all()
    )

    service_names = [row[0] for row in rows if row[0]]

    if len(service_names) <= 2:
        return ", ".join(service_names)

    return f"{', '.join(service_names[:2])}..."


def get_customer_total_spent(db: Session, id_tai_khoan: int):
    total = (
        db.query(
            func.coalesce(
                func.sum(ChiTietLichHen.donGia * ChiTietLichHen.soLuong),
                0,
            )
        )
        .join(LichHen, LichHen.idLichHen == ChiTietLichHen.idLichHen)
        .filter(
            LichHen.idTaiKhoan == id_tai_khoan,
            LichHen.trangThai == COMPLETED_APPOINTMENT_STATUS,
        )
        .scalar()
    )

    return float(total or 0)


def get_customer_recent_appointments(db: Session, id_tai_khoan: int):
    appointments = (
        db.query(LichHen)
        .filter(LichHen.idTaiKhoan == id_tai_khoan)
        .order_by(LichHen.thoiGianBatDau.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": item.maLH,
            "date": format_date_value(item.thoiGianBatDau),
            "time": format_time_value(item.thoiGianBatDau),
            "services": get_appointment_services_text(db, int(item.idLichHen)),
            "status": item.trangThai,
        }
        for item in appointments
    ]


def get_customer_service_history_for_staff(db: Session, id_tai_khoan: int):
    rows = (
        db.query(ChiTietLichHen, LichHen, DichVu)
        .join(LichHen, LichHen.idLichHen == ChiTietLichHen.idLichHen)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(
            LichHen.idTaiKhoan == id_tai_khoan,
            LichHen.trangThai == COMPLETED_APPOINTMENT_STATUS,
        )
        .order_by(LichHen.thoiGianBatDau.desc())
        .limit(8)
        .all()
    )

    result = []

    for chi_tiet, lich_hen, dich_vu in rows:
        amount = float(chi_tiet.donGia or 0) * int(chi_tiet.soLuong or 1)

        result.append(
            {
                "id": f"LS{int(chi_tiet.idChiTietLH):05d}",
                "serviceName": dich_vu.tenDV,
                "date": format_date_value(lich_hen.thoiGianBatDau),
                "amount": amount,
            }
        )

    return result


def build_staff_customer_response(db: Session, khach_hang: KhachHang):
    tai_khoan = khach_hang.taiKhoan

    total_appointments = (
        db.query(func.count(LichHen.idLichHen))
        .filter(LichHen.idTaiKhoan == khach_hang.idTaiKhoan)
        .scalar()
        or 0
    )

    last_completed_appointment = (
        db.query(LichHen)
        .filter(
            LichHen.idTaiKhoan == khach_hang.idTaiKhoan,
            LichHen.trangThai == COMPLETED_APPOINTMENT_STATUS,
        )
        .order_by(LichHen.thoiGianBatDau.desc())
        .first()
    )

    last_visit = (
        format_date_value(last_completed_appointment.thoiGianBatDau)
        if last_completed_appointment
        else "Chưa sử dụng"
    )

    full_name = khach_hang.hoTen or "Khách hàng"

    return {
        "id": khach_hang.maKH,
        "idKhachHang": int(khach_hang.idKhachHang),
        "idTaiKhoan": int(khach_hang.idTaiKhoan),
        "maKH": khach_hang.maKH,
        "fullName": full_name,
        "avatarText": get_customer_avatar_text(full_name),
        "avatar": khach_hang.anhDaiDien or "",
        "phone": khach_hang.sdt or "",
        "email": tai_khoan.email if tai_khoan else "",
        "gender": khach_hang.gioiTinh or "Chưa cập nhật",
        "birthday": format_date_value(khach_hang.ngaySinh) or "Chưa cập nhật",
        "createdAt": format_date_value(khach_hang.ngayTao),
        "loaiKH": khach_hang.loaiKH or "Thường",
        "status": get_account_status_label(tai_khoan.trangThai if tai_khoan else ""),
        "totalAppointments": int(total_appointments),
        "totalSpent": get_customer_total_spent(db, int(khach_hang.idTaiKhoan)),
        "lastVisit": last_visit,
        "appointments": get_customer_recent_appointments(
            db,
            int(khach_hang.idTaiKhoan),
        ),
        "serviceHistory": get_customer_service_history_for_staff(
            db,
            int(khach_hang.idTaiKhoan),
        ),
    }


def get_staff_customers(db: Session):
    customers = (
        db.query(KhachHang)
        .join(TaiKhoan, TaiKhoan.idTaiKhoan == KhachHang.idTaiKhoan)
        .order_by(KhachHang.ngayTao.desc(), KhachHang.idKhachHang.desc())
        .all()
    )

    return [build_staff_customer_response(db, customer) for customer in customers]


def validate_staff_customer_phone(db: Session, phone: str):
    phone = phone.strip()

    existed = db.query(KhachHang).filter(KhachHang.sdt == phone).first()

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại này đã tồn tại trong danh sách khách hàng",
        )

    return phone


def validate_staff_customer_email(db: Session, email: str | None, phone: str):
    if email and email.strip():
        email = email.strip().lower()
    else:
        email = f"khachhang_{phone}@serenity.local"

    existed = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được sử dụng",
        )

    return email


def create_staff_customer(db: Session, payload):
    full_name = payload.fullName.strip()
    phone = validate_staff_customer_phone(db, payload.phone)
    email = validate_staff_customer_email(db, payload.email, phone)

    valid_genders = ["Nam", "Nữ", "Khác", "", None]

    if payload.gender not in valid_genders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giới tính không hợp lệ",
        )

    birth_date = parse_birth_date(payload.birthday)

    try:
        tai_khoan = TaiKhoan(
            email=email,
            matKhau=f"STAFF_CREATED_{uuid4().hex}",
            loaiTK="KHACH_HANG",
            trangThai=get_account_status_value(payload.status),
            emailDaXacThuc=True,
            loaiDangNhap="LOCAL",
        )

        db.add(tai_khoan)
        db.flush()

        khach_hang = KhachHang(
            idTaiKhoan=tai_khoan.idTaiKhoan,
            maKH=generate_customer_code(db),
            hoTen=full_name,
            sdt=phone,
            ngaySinh=birth_date,
            gioiTinh=payload.gender or None,
            anhDaiDien=None,
            loaiKH=payload.loaiKH or "Thường",
        )

        db.add(khach_hang)
        db.commit()
        db.refresh(khach_hang)

        customer = build_staff_customer_response(db, khach_hang)

        return {
            "message": "Thêm khách hàng thành công",
            "customer": customer,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi thêm khách hàng: {str(error)}",
        )


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
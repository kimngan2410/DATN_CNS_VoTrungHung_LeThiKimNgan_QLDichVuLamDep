from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.tai_khoan import TaiKhoan


DEFAULT_AVATAR = (
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80"
)


def map_role_to_frontend(loai_tk: str) -> str:
    if loai_tk == "ADMIN":
        return "Admin"

    if loai_tk == "NHAN_VIEN":
        return "NhanVien"

    if loai_tk == "KHACH_HANG":
        return "KhachHang"

    return loai_tk


def authenticate_user(db: Session, email: str, password: str):
    tai_khoan = db.query(TaiKhoan).filter(TaiKhoan.email == email).first()

    if not tai_khoan:
        return None

    if tai_khoan.trangThai == "KHOA":
        return None

    is_valid_password = verify_password(password, tai_khoan.matKhau)

    # Hỗ trợ tạm nếu mật khẩu trong DB đang lưu dạng thường
    if not is_valid_password and password == tai_khoan.matKhau:
        tai_khoan.matKhau = hash_password(password)
        db.commit()
        db.refresh(tai_khoan)
        is_valid_password = True

    if not is_valid_password:
        return None

    return {
        "maTK": tai_khoan.idTaiKhoan,
        "email": tai_khoan.email,
        "vaiTro": map_role_to_frontend(tai_khoan.loaiTK),
        "maKH": None,
        "maNV": None,
        "hoTen": "Nguyễn Thị Mai",
        "avatar": DEFAULT_AVATAR,
    }


def create_test_customer_account(db: Session):
    test_email = "lethikimngan.dn43@gmail.com"
    test_password = "123456"

    existed = db.query(TaiKhoan).filter(TaiKhoan.email == test_email).first()

    if existed:
        return {
            "message": "Tài khoản test đã tồn tại",
            "email": test_email,
            "password": test_password,
        }

    tai_khoan = TaiKhoan(
        email=test_email,
        matKhau=hash_password(test_password),
        loaiTK="KHACH_HANG",
        trangThai="HOAT_DONG",
        emailDaXacThuc=True,
        loaiDangNhap="LOCAL",
    )

    db.add(tai_khoan)
    db.commit()
    db.refresh(tai_khoan)

    return {
        "message": "Tạo tài khoản test thành công",
        "idTaiKhoan": tai_khoan.idTaiKhoan,
        "email": test_email,
        "password": test_password,
    }
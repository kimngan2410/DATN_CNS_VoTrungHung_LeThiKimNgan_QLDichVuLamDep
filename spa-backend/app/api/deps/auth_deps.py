from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.tai_khoan import TaiKhoan
from app.models.nhan_vien import NhanVien


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/dang-nhap")


def get_jwt_settings():
    secret_key = getattr(settings, "SECRET_KEY", None)
    algorithm = getattr(settings, "ALGORITHM", "HS256")

    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chưa cấu hình SECRET_KEY cho JWT",
        )

    return secret_key, algorithm


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    secret_key, algorithm = get_jwt_settings()

    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        id_tai_khoan = payload.get("sub")

        if not id_tai_khoan:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ",
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
        )

    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == int(id_tai_khoan))
        .first()
    )

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không tìm thấy tài khoản đăng nhập",
        )

    if tai_khoan.trangThai == "KHOA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    return tai_khoan


def require_receptionist(
    current_user: TaiKhoan = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.loaiTK != "NHAN_VIEN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ nhân viên mới được truy cập chức năng này",
        )

    nhan_vien = (
        db.query(NhanVien)
        .filter(NhanVien.idTaiKhoan == current_user.idTaiKhoan)
        .first()
    )

    if not nhan_vien:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không tìm thấy thông tin nhân viên",
        )

    chuc_vu = (nhan_vien.chucVu or "").strip().lower()
    trang_thai = (nhan_vien.trangThaiLamViec or "").strip().lower()

    valid_receptionist_roles = [
        "lễ tân",
        "le tan",
        "nhân viên lễ tân",
        "nhan vien le tan",
    ]

    valid_working_statuses = [
        "đang làm",
        "dang lam",
        "đang làm việc",
        "dang lam viec",
        "hoạt động",
        "hoat dong",
        "active",
        "hoat_dong",
    ]

    if chuc_vu not in valid_receptionist_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản này không thuộc actor nhân viên lễ tân",
        )

    if trang_thai not in valid_working_statuses:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nhân viên không còn ở trạng thái đang làm",
        )

    return {
        "taiKhoan": current_user,
        "nhanVien": nhan_vien,
    }
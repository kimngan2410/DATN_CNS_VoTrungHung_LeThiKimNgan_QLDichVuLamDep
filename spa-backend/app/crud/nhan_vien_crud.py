from datetime import datetime
from uuid import uuid4

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.nhan_vien import NhanVien
from app.models.tai_khoan import TaiKhoan


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    password = str(password or "")
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        password = password_bytes[:72].decode("utf-8", errors="ignore")

    return pwd_context.hash(password)


def format_date(value):
    if not value:
        return ""

    return value.strftime("%Y-%m-%d")


def format_datetime(value):
    if not value:
        return ""

    return value.isoformat()


def parse_date(value: str | None, field_label: str):
    if not value:
        return None

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_label} không đúng định dạng YYYY-MM-DD",
        )


def generate_employee_code(db: Session) -> str:
    max_id = db.query(func.max(NhanVien.idNhanVien)).scalar() or 0
    next_number = int(max_id) + 1

    while True:
        code = f"NV{next_number:03d}"

        existed = db.query(NhanVien).filter(NhanVien.maNV == code).first()

        if not existed:
            return code

        next_number += 1


def build_employee_response(employee: NhanVien):
    account = employee.taiKhoan

    return {
        "idNhanVien": int(employee.idNhanVien),
        "idTaiKhoan": int(employee.idTaiKhoan),
        "maNV": employee.maNV,
        "hoTen": employee.hoTen,
        "email": account.email if account else "",
        "sdt": employee.sdt or "",
        "chucVu": employee.chucVu,
        "gioiTinh": employee.gioiTinh or "",
        "ngaySinh": format_date(employee.ngaySinh),
        "anhDaiDien": employee.anhDaiDien or "",
        "ngayVaoLam": format_date(employee.ngayVaoLam),
        "trangThaiLamViec": employee.trangThaiLamViec,
        "ngayTao": format_datetime(employee.ngayTao),
    }


def get_admin_employees(db: Session):
    employees = (
        db.query(NhanVien)
        .join(TaiKhoan, TaiKhoan.idTaiKhoan == NhanVien.idTaiKhoan)
        .order_by(NhanVien.ngayTao.desc(), NhanVien.idNhanVien.desc())
        .all()
    )

    return [build_employee_response(employee) for employee in employees]


def get_employee_or_404(db: Session, id_nhan_vien: int):
    employee = (
        db.query(NhanVien)
        .filter(NhanVien.idNhanVien == id_nhan_vien)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy nhân viên",
        )

    return employee


def validate_email_unique(db: Session, email: str, current_account_id: int | None = None):
    email = email.strip().lower()

    query = db.query(TaiKhoan).filter(TaiKhoan.email == email)

    if current_account_id:
        query = query.filter(TaiKhoan.idTaiKhoan != current_account_id)

    existed = query.first()

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại trong hệ thống",
        )

    return email


def validate_phone_unique(db: Session, phone: str, current_employee_id: int | None = None):
    phone = phone.strip()

    query = db.query(NhanVien).filter(NhanVien.sdt == phone)

    if current_employee_id:
        query = query.filter(NhanVien.idNhanVien != current_employee_id)

    existed = query.first()

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Số điện thoại đã tồn tại trong hệ thống",
        )

    return phone


def validate_employee_payload(payload):
    valid_roles = ["Lễ tân", "Kỹ thuật viên", "Quản lý", "Khác"]
    valid_genders = ["Nam", "Nữ", "Khác"]
    valid_statuses = ["Đang làm", "Tạm nghỉ", "Đã nghỉ"]

    if payload.chucVu not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chức vụ không hợp lệ",
        )

    if payload.gioiTinh not in valid_genders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giới tính không hợp lệ",
        )

    if payload.trangThaiLamViec not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trạng thái làm việc không hợp lệ",
        )


def create_admin_employee(db: Session, payload):
    validate_employee_payload(payload)

    email = validate_email_unique(db, str(payload.email))
    phone = validate_phone_unique(db, payload.sdt)

    try:
        account = TaiKhoan(
            email=email,
            matKhau=hash_password("NV@123456"),
            loaiTK="NHAN_VIEN",
            trangThai="HOAT_DONG",
            emailDaXacThuc=True,
            loaiDangNhap="LOCAL",
        )

        db.add(account)
        db.flush()

        employee = NhanVien(
            idTaiKhoan=account.idTaiKhoan,
            maNV=generate_employee_code(db),
            hoTen=payload.hoTen.strip(),
            sdt=phone,
            chucVu=payload.chucVu,
            gioiTinh=payload.gioiTinh,
            ngaySinh=parse_date(payload.ngaySinh, "Ngày sinh"),
            anhDaiDien=payload.anhDaiDien or "",
            ngayVaoLam=parse_date(payload.ngayVaoLam, "Ngày vào làm"),
            trangThaiLamViec=payload.trangThaiLamViec or "Đang làm",
        )

        db.add(employee)
        db.commit()
        db.refresh(employee)

        return {
            "message": "Thêm nhân viên thành công",
            "employee": build_employee_response(employee),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi thêm nhân viên: {str(error)}",
        )


def update_admin_employee(db: Session, id_nhan_vien: int, payload):
    validate_employee_payload(payload)

    employee = get_employee_or_404(db, id_nhan_vien)
    account = employee.taiKhoan

    email = validate_email_unique(
        db,
        str(payload.email),
        current_account_id=int(employee.idTaiKhoan),
    )

    phone = validate_phone_unique(
        db,
        payload.sdt,
        current_employee_id=int(employee.idNhanVien),
    )

    try:
        if account:
            account.email = email

        employee.hoTen = payload.hoTen.strip()
        employee.sdt = phone
        employee.chucVu = payload.chucVu
        employee.gioiTinh = payload.gioiTinh
        employee.ngaySinh = parse_date(payload.ngaySinh, "Ngày sinh")
        employee.anhDaiDien = payload.anhDaiDien or ""
        employee.ngayVaoLam = parse_date(payload.ngayVaoLam, "Ngày vào làm")
        employee.trangThaiLamViec = payload.trangThaiLamViec or "Đang làm"

        db.commit()
        db.refresh(employee)

        return {
            "message": "Cập nhật nhân viên thành công",
            "employee": build_employee_response(employee),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật nhân viên: {str(error)}",
        )


def delete_admin_employee(db: Session, id_nhan_vien: int):
    employee = get_employee_or_404(db, id_nhan_vien)
    account = employee.taiKhoan

    try:
        db.delete(employee)
        db.flush()

        if account:
            db.delete(account)

        db.commit()

        return {
            "message": "Xoá nhân viên thành công",
            "employee": None,
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Không thể xoá nhân viên vì nhân viên này đã có dữ liệu liên quan. "
                "Vui lòng chuyển trạng thái làm việc sang 'Đã nghỉ'."
            ),
        )

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xoá nhân viên: {str(error)}",
        )
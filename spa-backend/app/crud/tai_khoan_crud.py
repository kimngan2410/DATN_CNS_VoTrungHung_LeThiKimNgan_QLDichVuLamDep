from urllib.parse import quote_plus

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.khach_hang import KhachHang
from app.models.nhan_vien import NhanVien
from app.models.tai_khoan import TaiKhoan


VALID_FRONTEND_ROLES = [
    "Admin",
    "Lễ tân",
    "Kỹ thuật viên",
    "Khách hàng",
]

VALID_FRONTEND_STATUSES = ["Hoạt động", "Khóa"]


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


def normalize_db_status(frontend_status: str):
    if frontend_status == "Khóa":
        return "KHOA"

    return "HOAT_DONG"


def normalize_frontend_status(db_status: str | None):
    value = (db_status or "").strip().upper()

    if value == "KHOA":
        return "Khóa"

    return "Hoạt động"


def get_account_code(account: TaiKhoan):
    return f"ACC{int(account.idTaiKhoan):03d}"


def get_role_from_account(
    account: TaiKhoan,
    customer: KhachHang | None = None,
    employee: NhanVien | None = None,
):
    if account.loaiTK == "ADMIN":
        return "Admin"

    if account.loaiTK == "KHACH_HANG":
        return "Khách hàng"

    if account.loaiTK == "NHAN_VIEN":
        return employee.chucVu if employee and employee.chucVu else "Nhân viên"

    return account.loaiTK or "Không rõ"


def get_related_profile(db: Session, account: TaiKhoan):
    customer = None
    employee = None

    if account.loaiTK == "KHACH_HANG":
        customer = (
            db.query(KhachHang)
            .filter(KhachHang.idTaiKhoan == account.idTaiKhoan)
            .first()
        )

    if account.loaiTK == "NHAN_VIEN":
        employee = (
            db.query(NhanVien)
            .filter(NhanVien.idTaiKhoan == account.idTaiKhoan)
            .first()
        )

    return customer, employee


def build_admin_account_response(db: Session, account: TaiKhoan):
    customer, employee = get_related_profile(db, account)

    full_name = "Admin Tổng"
    phone = ""
    avatar = ""
    related_user = "Tài khoản quản trị hệ thống"

    if customer:
        full_name = customer.hoTen or "Khách hàng"
        phone = customer.sdt or ""
        avatar = customer.anhDaiDien or ""
        related_user = customer.maKH or f"KH{int(customer.idKhachHang):03d}"

    if employee:
        full_name = employee.hoTen or "Nhân viên"
        phone = employee.sdt or ""
        avatar = employee.anhDaiDien or ""
        related_user = employee.maNV or f"NV{int(employee.idNhanVien):03d}"

    if account.loaiTK == "ADMIN":
        avatar = make_default_avatar(full_name, account.email)

    role = get_role_from_account(account, customer, employee)

    return {
        "idTaiKhoan": int(account.idTaiKhoan),
        "id": get_account_code(account),

        "fullName": full_name,
        "email": account.email,
        "phone": phone,

        "role": role,
        "status": normalize_frontend_status(account.trangThai),

        "createdAt": account.ngayTao.isoformat() if account.ngayTao else "",
        "lastLoginAt": (
            account.lanDangNhapCuoi.isoformat()
            if account.lanDangNhapCuoi
            else ""
        ),

        "relatedUser": related_user,
        "avatar": avatar,
        "note": f"Tài khoản {role}",
    }


def generate_customer_code(db: Session):
    max_id = db.query(func.max(KhachHang.idKhachHang)).scalar() or 0
    return f"KH{int(max_id) + 1:04d}"


def generate_employee_code(db: Session):
    max_id = db.query(func.max(NhanVien.idNhanVien)).scalar() or 0
    return f"NV{int(max_id) + 1:03d}"


def get_admin_accounts(db: Session):
    accounts = (
        db.query(TaiKhoan)
        .order_by(TaiKhoan.ngayTao.desc(), TaiKhoan.idTaiKhoan.desc())
        .all()
    )

    return [build_admin_account_response(db, account) for account in accounts]


def get_admin_account_or_404(db: Session, id_tai_khoan: int):
    account = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản",
        )

    return account


def validate_account_payload(db: Session, email: str, phone: str | None, exclude_id=None):
    existed_email = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.email == email)
        .first()
    )

    if existed_email and int(existed_email.idTaiKhoan) != int(exclude_id or 0):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại trong hệ thống",
        )

    if phone:
        existed_customer_phone = (
            db.query(KhachHang)
            .filter(KhachHang.sdt == phone)
            .first()
        )

        if (
            existed_customer_phone
            and int(existed_customer_phone.idTaiKhoan) != int(exclude_id or 0)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại đã tồn tại trong khách hàng",
            )

        existed_employee_phone = (
            db.query(NhanVien)
            .filter(NhanVien.sdt == phone)
            .first()
        )

        if (
            existed_employee_phone
            and int(existed_employee_phone.idTaiKhoan) != int(exclude_id or 0)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại đã tồn tại trong nhân viên",
            )


def create_admin_account(db: Session, payload):
    role = payload.role

    if role not in VALID_FRONTEND_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vai trò tài khoản không hợp lệ",
        )

    if payload.status not in VALID_FRONTEND_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trạng thái tài khoản không hợp lệ",
        )

    email = str(payload.email).strip().lower()
    phone = str(payload.phone or "").strip()
    full_name = payload.fullName.strip()
    password = payload.password or "TK@123456"

    validate_account_payload(db, email=email, phone=phone)

    if role == "Admin":
        loai_tk = "ADMIN"
    elif role == "Khách hàng":
        loai_tk = "KHACH_HANG"
    else:
        loai_tk = "NHAN_VIEN"

    try:
        account = TaiKhoan(
            email=email,
            matKhau=hash_password(password),
            loaiTK=loai_tk,
            trangThai=normalize_db_status(payload.status),
            emailDaXacThuc=True,
            loaiDangNhap="LOCAL",
        )

        db.add(account)
        db.flush()

        if role == "Khách hàng":
            customer = KhachHang(
                idTaiKhoan=account.idTaiKhoan,
                maKH=generate_customer_code(db),
                hoTen=full_name,
                sdt=phone or None,
                loaiKH="Thường",
                anhDaiDien=make_default_avatar(full_name, email),
            )

            db.add(customer)

        if role in ["Lễ tân", "Kỹ thuật viên"]:
            employee = NhanVien(
                idTaiKhoan=account.idTaiKhoan,
                maNV=generate_employee_code(db),
                hoTen=full_name,
                sdt=phone or None,
                chucVu=role,
                gioiTinh="Nữ",
                anhDaiDien=make_default_avatar(full_name, email),
                trangThaiLamViec="Đang làm",
            )

            db.add(employee)

        db.commit()
        db.refresh(account)

        return build_admin_account_response(db, account)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo tài khoản: {str(error)}",
        )


def update_admin_account(db: Session, id_tai_khoan: int, payload, current_admin_id: int):
    account = get_admin_account_or_404(db, id_tai_khoan)

    if payload.role not in VALID_FRONTEND_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vai trò tài khoản không hợp lệ",
        )

    if payload.status not in VALID_FRONTEND_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trạng thái tài khoản không hợp lệ",
        )

    email = str(payload.email).strip().lower()
    phone = str(payload.phone or "").strip()
    full_name = payload.fullName.strip()

    validate_account_payload(
        db,
        email=email,
        phone=phone,
        exclude_id=account.idTaiKhoan,
    )

    if int(account.idTaiKhoan) == int(current_admin_id) and payload.status == "Khóa":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể khóa chính tài khoản admin đang đăng nhập",
        )

    try:
        account.email = email
        account.trangThai = normalize_db_status(payload.status)

        customer, employee = get_related_profile(db, account)

        password = str(getattr(payload, "password", "") or "").strip()

        if password:
            role = get_role_from_account(account, customer, employee)

            if role == "Khách hàng":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không thể cập nhật mật khẩu của tài khoản khách hàng tại trang quản trị",
                )

            if len(password) < 6:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mật khẩu phải có ít nhất 6 ký tự",
                )

            if len(password.encode("utf-8")) > 72:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mật khẩu không được vượt quá 72 bytes",
                )

            account.matKhau = hash_password(password)

        if account.loaiTK == "KHACH_HANG":
            if payload.role != "Khách hàng":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không thể đổi tài khoản khách hàng sang vai trò khác tại trang này",
                )

            if customer:
                customer.hoTen = full_name
                customer.sdt = phone or None

        elif account.loaiTK == "NHAN_VIEN":
            if payload.role not in ["Lễ tân", "Kỹ thuật viên"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không thể đổi tài khoản nhân viên sang vai trò khác tại trang này",
                )

            if employee:
                employee.hoTen = full_name
                employee.sdt = phone or None
                employee.chucVu = payload.role

        elif account.loaiTK == "ADMIN":
            if payload.role != "Admin":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Không thể đổi tài khoản admin sang vai trò khác",
                )

        db.commit()
        db.refresh(account)

        return build_admin_account_response(db, account)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật tài khoản: {str(error)}",
        )


def update_admin_account_status(
    db: Session,
    id_tai_khoan: int,
    status_value: str,
    current_admin_id: int,
):
    account = get_admin_account_or_404(db, id_tai_khoan)

    if status_value not in VALID_FRONTEND_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trạng thái tài khoản không hợp lệ",
        )

    if int(account.idTaiKhoan) == int(current_admin_id) and status_value == "Khóa":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể khóa chính tài khoản admin đang đăng nhập",
        )

    try:
        account.trangThai = normalize_db_status(status_value)

        db.commit()
        db.refresh(account)

        return build_admin_account_response(db, account)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật trạng thái tài khoản: {str(error)}",
        )
    
def delete_admin_account(
    db: Session,
    id_tai_khoan: int,
    current_admin_id: int,
):
    account = get_admin_account_or_404(db, id_tai_khoan)

    if int(account.idTaiKhoan) == int(current_admin_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xoá chính tài khoản admin đang đăng nhập",
        )

    customer, employee = get_related_profile(db, account)

    try:
        if customer:
            db.delete(customer)
            db.flush()

        if employee:
            db.delete(employee)
            db.flush()

        db.delete(account)
        db.commit()

        return {
            "message": "Xoá tài khoản thành công",
        }

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Không thể xoá tài khoản vì tài khoản này đã có dữ liệu liên quan. "
                "Vui lòng khóa tài khoản thay vì xoá."
            ),
        )

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xoá tài khoản: {str(error)}",
        )
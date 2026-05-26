from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.crud.khach_hang_crud import (
    create_staff_customer,
    get_admin_customer_detail,
    get_admin_customers,
    get_customer_profile,
    get_staff_customers,
    update_customer_profile,
)
from app.db.session import get_db
from app.schemas.khach_hang_schema import (
    AccountProfileResponse,
    AdminCustomerOut,
    StaffCustomerActionResponse,
    StaffCustomerCreateRequest,
    StaffCustomerOut,
)
from app.api.deps.auth_deps import require_admin, require_receptionist

router = APIRouter()


# =========================
# CUSTOMER ACCOUNT PROFILE
# =========================

@router.get(
    "/profile/{id_tai_khoan}",
    response_model=AccountProfileResponse,
)
def get_profile(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_profile(db, id_tai_khoan)


@router.put(
    "/profile/{id_tai_khoan}",
    response_model=AccountProfileResponse,
)
def update_profile(
    id_tai_khoan: int,
    fullName: str = Form(...),
    phone: str | None = Form(None),
    birthDate: str | None = Form(None),
    gender: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return update_customer_profile(
        db=db,
        id_tai_khoan=id_tai_khoan,
        full_name=fullName,
        phone=phone,
        birth_date=birthDate,
        gender=gender,
        avatar=avatar,
    )


# =========================
# STAFF CUSTOMER MANAGEMENT
# =========================

@router.get(
    "/",
    response_model=list[StaffCustomerOut],
)
def get_customers(
    db: Session = Depends(get_db),
):
    return get_staff_customers(db)


@router.get(
    "/staff/danh-sach",
    response_model=list[StaffCustomerOut],
)
def get_staff_customers_api(
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return get_staff_customers(db)


@router.post(
    "/staff/tao",
    response_model=StaffCustomerActionResponse,
)
def create_staff_customer_api(
    payload: StaffCustomerCreateRequest,
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return create_staff_customer(db, payload)

@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: int,
    db: Session = Depends(get_db),
):
    return {
        "message": "API chi tiết khách hàng",
        "customer_id": customer_id,
    }

# =========================
# ADMIN CUSTOMER MANAGEMENT
# =========================

@router.get(
    "/admin/danh-sach",
    response_model=list[AdminCustomerOut],
)
def get_admin_customers_api(
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_customers(db)


@router.get(
    "/admin/{id_khach_hang}",
    response_model=AdminCustomerOut,
)
def get_admin_customer_detail_api(
    id_khach_hang: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_customer_detail(
        db=db,
        id_khach_hang=id_khach_hang,
    )
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.crud.khach_hang_crud import (
    get_customer_profile,
    update_customer_profile,
)
from app.db.session import get_db
from app.schemas.khach_hang_schema import AccountProfileResponse

router = APIRouter()


@router.get("/profile/{id_tai_khoan}", response_model=AccountProfileResponse)
def get_profile(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_profile(db, id_tai_khoan)


@router.put("/profile/{id_tai_khoan}", response_model=AccountProfileResponse)
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


@router.get("/")
def get_customers():
    return {
        "message": "API danh sách khách hàng đang hoạt động"
    }


@router.get("/{customer_id}")
def get_customer_detail(customer_id: int):
    return {
        "message": "API chi tiết khách hàng",
        "customer_id": customer_id,
    }
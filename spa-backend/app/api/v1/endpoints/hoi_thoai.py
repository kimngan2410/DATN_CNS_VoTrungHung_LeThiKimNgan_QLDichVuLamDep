from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.crud.hoi_thoai_crud import (
    get_customer_conversation,
    get_customer_unread_count,
    get_staff_conversation_detail,
    get_staff_conversations,
    get_staff_unread_count,
    recall_conversation_message,
    send_customer_message,
    send_staff_message,
    update_conversation_message,
)
from app.db.session import get_db


router = APIRouter()


class CustomerMessageCreate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)


class StaffMessageCreate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)

class MessageUpdate(BaseModel):
    idTaiKhoan: int
    noiDung: str = Field(..., min_length=1)


class MessageRecall(BaseModel):
    idTaiKhoan: int

@router.get("/customer/{id_tai_khoan}")
def get_customer_conversation_api(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_conversation(
        db=db,
        id_tai_khoan=id_tai_khoan,
    )

@router.get("/customer/{id_tai_khoan}/unread-count")
def get_customer_unread_count_api(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_unread_count(
        db=db,
        id_tai_khoan=id_tai_khoan,
    )

@router.post("/customer/tin-nhan")
def send_customer_message_api(
    payload: CustomerMessageCreate,
    db: Session = Depends(get_db),
):
    return send_customer_message(
        db=db,
        id_tai_khoan=payload.idTaiKhoan,
        content=payload.noiDung,
    )


@router.get("/staff/danh-sach")
def get_staff_conversations_api(
    db: Session = Depends(get_db),
):
    return get_staff_conversations(db=db)

@router.get("/staff/unread-count")
def get_staff_unread_count_api(
    db: Session = Depends(get_db),
):
    return get_staff_unread_count(db=db)

@router.put("/tin-nhan/{id_tin_nhan}")
def update_conversation_message_api(
    id_tin_nhan: int,
    payload: MessageUpdate,
    db: Session = Depends(get_db),
):
    return update_conversation_message(
        db=db,
        id_tin_nhan=id_tin_nhan,
        id_tai_khoan=payload.idTaiKhoan,
        content=payload.noiDung,
    )


@router.patch("/tin-nhan/{id_tin_nhan}/thu-hoi")
def recall_conversation_message_api(
    id_tin_nhan: int,
    payload: MessageRecall,
    db: Session = Depends(get_db),
):
    return recall_conversation_message(
        db=db,
        id_tin_nhan=id_tin_nhan,
        id_tai_khoan=payload.idTaiKhoan,
    )

@router.get("/staff/{id_hoi_thoai}")
def get_staff_conversation_detail_api(
    id_hoi_thoai: int,
    db: Session = Depends(get_db),
):
    return get_staff_conversation_detail(
        db=db,
        id_hoi_thoai=id_hoi_thoai,
    )


@router.post("/staff/{id_hoi_thoai}/tin-nhan")
def send_staff_message_api(
    id_hoi_thoai: int,
    payload: StaffMessageCreate,
    db: Session = Depends(get_db),
):
    return send_staff_message(
        db=db,
        id_hoi_thoai=id_hoi_thoai,
        id_tai_khoan_nhan_vien=payload.idTaiKhoan,
        content=payload.noiDung,
    )
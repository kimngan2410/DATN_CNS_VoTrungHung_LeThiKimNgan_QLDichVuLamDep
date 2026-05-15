from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.lich_hen_crud import create_booking
from app.db.session import get_db
from app.schemas.lich_hen_schema import (
    LichHenCreateRequest,
    LichHenCreateResponse,
)

router = APIRouter()


@router.get("/")
def get_appointments():
    return {
        "message": "API danh sách lịch hẹn đang hoạt động"
    }


@router.get("/{appointment_id}")
def get_appointment_detail(appointment_id: int):
    return {
        "message": "API chi tiết lịch hẹn",
        "appointment_id": appointment_id,
    }


@router.post("/", response_model=LichHenCreateResponse)
def create_appointment(
    payload: LichHenCreateRequest,
    db: Session = Depends(get_db),
):
    return create_booking(db, payload)


@router.patch("/{appointment_id}/trang-thai")
def update_appointment_status(appointment_id: int):
    return {
        "message": "API cập nhật trạng thái lịch hẹn",
        "appointment_id": appointment_id,
    }
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud.lich_hen_crud import (
    cancel_customer_appointment,
    create_booking,
    get_available_booking_slots,
    get_customer_appointment_detail,
    get_customer_appointments,
    get_customer_service_history,
    get_staff_appointments,
    reschedule_customer_appointment,
    create_staff_appointment,
    update_staff_appointment_status,
)
from app.db.session import get_db
from app.schemas.lich_hen_schema import (
    LichHenActionResponse,
    LichHenCancelRequest,
    LichHenCreateRequest,
    LichHenCreateResponse,
    LichHenCustomerOut,
    LichHenRescheduleRequest,
    StaffLichHenOut,
    StaffLichHenActionResponse,
    StaffLichHenCreateRequest,
    StaffLichHenStatusRequest,
)

router = APIRouter()


@router.get(
    "/tai-khoan/{id_tai_khoan}",
    response_model=list[LichHenCustomerOut],
)
def get_my_appointments(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_appointments(db, id_tai_khoan)

@router.get(
    "/tai-khoan/{id_tai_khoan}/lich-su-dich-vu",
    response_model=list[LichHenCustomerOut],
)
def get_my_service_history(
    id_tai_khoan: int,
    db: Session = Depends(get_db),
):
    return get_customer_service_history(db, id_tai_khoan)

@router.get(
    "/tai-khoan/{id_tai_khoan}/{appointment_id}",
    response_model=LichHenCustomerOut,
)
def get_my_appointment_detail(
    id_tai_khoan: int,
    appointment_id: int,
    db: Session = Depends(get_db),
):
    return get_customer_appointment_detail(db, id_tai_khoan, appointment_id)


@router.post("/", response_model=LichHenCreateResponse)
def create_appointment(
    payload: LichHenCreateRequest,
    db: Session = Depends(get_db),
):
    return create_booking(db, payload)


@router.patch(
    "/{appointment_id}/huy",
    response_model=LichHenActionResponse,
)
def cancel_appointment(
    appointment_id: int,
    payload: LichHenCancelRequest,
    db: Session = Depends(get_db),
):
    return cancel_customer_appointment(
        db=db,
        appointment_id=appointment_id,
        id_tai_khoan=payload.idTaiKhoan,
        ly_do_huy=payload.lyDoHuy,
    )


@router.patch(
    "/{appointment_id}/doi-lich",
    response_model=LichHenActionResponse,
)
def reschedule_appointment(
    appointment_id: int,
    payload: LichHenRescheduleRequest,
    db: Session = Depends(get_db),
):
    return reschedule_customer_appointment(
        db=db,
        appointment_id=appointment_id,
        id_tai_khoan=payload.idTaiKhoan,
        ngay_hen=payload.ngayHen,
        gio_hen=payload.gioHen,
    )

@router.get(
    "/staff/danh-sach",
    response_model=list[StaffLichHenOut],
)
def get_staff_appointments_api(
    ngay: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    trang_thai: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_staff_appointments(
        db=db,
        ngay=ngay,
        keyword=keyword,
        trang_thai=trang_thai,
    )

@router.post(
    "/staff/tao",
    response_model=StaffLichHenActionResponse,
)
def create_staff_appointment_api(
    payload: StaffLichHenCreateRequest,
    db: Session = Depends(get_db),
):
    return create_staff_appointment(db, payload)


@router.patch(
    "/staff/{appointment_id}/trang-thai",
    response_model=StaffLichHenActionResponse,
)
def update_staff_appointment_status_api(
    appointment_id: int,
    payload: StaffLichHenStatusRequest,
    db: Session = Depends(get_db),
):
    return update_staff_appointment_status(
        db=db,
        appointment_id=appointment_id,
        payload=payload,
    )

@router.get("/")
def get_appointments():
    return {
        "message": "API danh sách lịch hẹn đang hoạt động"
    }

@router.get("/khung-gio-kha-dung")
def get_available_booking_slots_api(
    ngay: str,
    thoi_luong: int,
    db: Session = Depends(get_db),
):
    return get_available_booking_slots(
        db=db,
        ngay=ngay,
        thoi_luong=thoi_luong,
    )

@router.get("/{appointment_id}")
def get_appointment_detail(appointment_id: int):
    return {
        "message": "API chi tiết lịch hẹn",
        "appointment_id": appointment_id,
    }


@router.patch("/{appointment_id}/trang-thai")
def update_appointment_status(appointment_id: int):
    return {
        "message": "API cập nhật trạng thái lịch hẹn",
        "appointment_id": appointment_id,
    }


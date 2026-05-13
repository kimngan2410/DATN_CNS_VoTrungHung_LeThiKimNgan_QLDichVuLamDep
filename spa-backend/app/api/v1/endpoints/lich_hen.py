from fastapi import APIRouter

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


@router.post("/")
def create_appointment():
    return {
        "message": "API đặt lịch hẹn"
    }


@router.patch("/{appointment_id}/trang-thai")
def update_appointment_status(appointment_id: int):
    return {
        "message": "API cập nhật trạng thái lịch hẹn",
        "appointment_id": appointment_id,
    }
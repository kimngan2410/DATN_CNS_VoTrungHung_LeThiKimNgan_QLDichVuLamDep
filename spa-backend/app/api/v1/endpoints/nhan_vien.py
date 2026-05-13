from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_staffs():
    return {
        "message": "API danh sách nhân viên đang hoạt động"
    }


@router.get("/{staff_id}")
def get_staff_detail(staff_id: int):
    return {
        "message": "API chi tiết nhân viên",
        "staff_id": staff_id,
    }
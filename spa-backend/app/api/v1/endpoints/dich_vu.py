from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_services():
    return {
        "message": "API danh sách dịch vụ đang hoạt động"
    }


@router.get("/{service_id}")
def get_service_detail(service_id: int):
    return {
        "message": "API chi tiết dịch vụ",
        "service_id": service_id,
    }


@router.post("/")
def create_service():
    return {
        "message": "API thêm dịch vụ"
    }
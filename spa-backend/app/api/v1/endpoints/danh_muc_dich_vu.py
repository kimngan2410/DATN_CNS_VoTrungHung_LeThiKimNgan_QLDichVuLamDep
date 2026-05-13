from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_service_categories():
    return {
        "message": "API danh mục dịch vụ đang hoạt động"
    }


@router.post("/")
def create_service_category():
    return {
        "message": "API thêm danh mục dịch vụ"
    }
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_reviews():
    return {
        "message": "API danh sách đánh giá đang hoạt động"
    }


@router.post("/")
def create_review():
    return {
        "message": "API thêm đánh giá"
    }
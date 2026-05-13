from fastapi import APIRouter

router = APIRouter()


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
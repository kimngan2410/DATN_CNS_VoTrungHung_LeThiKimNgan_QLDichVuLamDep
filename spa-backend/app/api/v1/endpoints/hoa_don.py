from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_invoices():
    return {
        "message": "API danh sách hóa đơn đang hoạt động"
    }


@router.get("/{invoice_id}")
def get_invoice_detail(invoice_id: int):
    return {
        "message": "API chi tiết hóa đơn",
        "invoice_id": invoice_id,
    }


@router.post("/")
def create_invoice():
    return {
        "message": "API lập hóa đơn"
    }
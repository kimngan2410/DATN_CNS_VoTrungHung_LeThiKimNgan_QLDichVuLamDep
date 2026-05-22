from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud.hoa_don_crud import (
    create_staff_invoice,
    get_staff_invoice_detail,
    get_staff_invoices,
)
from app.schemas.hoa_don_schema import (
    CreateStaffInvoiceRequest,
)
from app.api.deps.auth_deps import require_receptionist


router = APIRouter()

@router.post("/staff/lap-hoa-don")
def create_staff_invoice_api(
    payload: CreateStaffInvoiceRequest,
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return create_staff_invoice(
        db=db,
        payload=payload,
    )

@router.get("/staff")
def get_staff_invoice_list_api(
    date: str | None = Query(default=None),
    payment_method: str | None = Query(default=None),
    status: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return get_staff_invoices(
        db=db,
        date=date,
        payment_method=payment_method,
        invoice_status=status,
        keyword=keyword,
    )


@router.get("/staff/{invoice_id}")
def get_staff_invoice_detail_api(
    invoice_id: str,
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return get_staff_invoice_detail(
        db=db,
        invoice_id=invoice_id,
    )

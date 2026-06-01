from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.admin_invoice_report_crud import build_admin_invoice_report
from app.db.session import get_db
from app.schemas.admin_invoice_report_schema import AdminInvoiceReportResponse


router = APIRouter()


@router.get(
    "",
    response_model=AdminInvoiceReportResponse,
)
def get_admin_invoice_report_api(
    fromDate: str | None = Query(None),
    toDate: str | None = Query(None),
    keyword: str | None = Query(None),
    paymentMethod: str = Query("Tất cả"),
    status: str = Query("Tất cả"),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_invoice_report(
        db=db,
        from_date=fromDate,
        to_date=toDate,
        keyword=keyword,
        payment_method=paymentMethod,
        status=status,
    )
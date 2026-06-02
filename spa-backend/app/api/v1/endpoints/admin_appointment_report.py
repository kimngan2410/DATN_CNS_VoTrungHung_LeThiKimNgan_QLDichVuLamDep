from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.admin_appointment_report_crud import build_admin_appointment_report
from app.db.session import get_db
from app.schemas.admin_appointment_report_schema import (
    AdminAppointmentReportResponse,
)


router = APIRouter()


@router.get(
    "",
    response_model=AdminAppointmentReportResponse,
)
def get_admin_appointment_report_api(
    fromDate: str | None = Query(None),
    toDate: str | None = Query(None),
    keyword: str | None = Query(None),
    status: str = Query("Tất cả"),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_appointment_report(
        db=db,
        from_date=fromDate,
        to_date=toDate,
        keyword=keyword,
        status=status,
    )
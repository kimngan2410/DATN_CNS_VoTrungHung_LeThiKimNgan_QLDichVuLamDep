from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.admin_revenue_report_crud import build_admin_revenue_report
from app.db.session import get_db
from app.schemas.admin_revenue_report_schema import AdminRevenueReportResponse


router = APIRouter()


@router.get(
    "",
    response_model=AdminRevenueReportResponse,
)
def get_admin_revenue_report_api(
    fromDate: str | None = Query(None),
    toDate: str | None = Query(None),
    compare: str = Query(
        "previous_period",
        pattern="^(none|previous_period|previous_month|previous_year)$",
    ),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_revenue_report(
        db=db,
        from_date=fromDate,
        to_date=toDate,
        compare=compare,
    )
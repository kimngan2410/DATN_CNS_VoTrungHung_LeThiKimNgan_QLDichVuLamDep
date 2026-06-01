from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.admin_service_usage_report_crud import (
    build_admin_service_usage_report,
)
from app.db.session import get_db
from app.schemas.admin_service_usage_report_schema import (
    AdminServiceUsageReportResponse,
)


router = APIRouter()


@router.get(
    "",
    response_model=AdminServiceUsageReportResponse,
)
def get_admin_service_usage_report_api(
    fromDate: str | None = Query(None),
    toDate: str | None = Query(None),
    keyword: str | None = Query(None),
    category: str = Query("Tất cả"),
    usageStatus: str = Query("Tất cả"),
    serviceStatus: str = Query("Tất cả"),
    sortBy: str = Query("Lượt sử dụng cao nhất"),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_service_usage_report(
        db=db,
        from_date=fromDate,
        to_date=toDate,
        keyword=keyword,
        category=category,
        usage_status=usageStatus,
        service_status=serviceStatus,
        sort_by=sortBy,
    )
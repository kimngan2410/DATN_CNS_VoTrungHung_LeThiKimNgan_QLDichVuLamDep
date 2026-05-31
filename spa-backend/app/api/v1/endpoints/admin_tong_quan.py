from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.admin_tong_quan_crud import build_admin_overview
from app.db.session import get_db
from app.schemas.admin_tong_quan_schema import AdminOverviewResponse


router = APIRouter()


@router.get(
    "/admin",
    response_model=AdminOverviewResponse,
)
def get_admin_overview_api(
    period: str = Query("date", pattern="^(date|week|month|year)$"),
    value: str | None = Query(None),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return build_admin_overview(db, period, value)
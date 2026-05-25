from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_receptionist
from app.crud.staff_overview_crud import get_staff_overview
from app.db.session import get_db


router = APIRouter()


@router.get("/overview")
def get_staff_overview_api(
    period: str = Query(default="date"),
    value: str | None = Query(default=None),
    current_staff: dict = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    return get_staff_overview(
        db=db,
        period=period,
        value=value,
    )
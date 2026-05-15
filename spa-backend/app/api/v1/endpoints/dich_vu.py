from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud.dich_vu_crud import (
    create_service,
    get_service_by_id,
    get_service_reviews,
    get_services,
)
from app.db.session import get_db
from app.schemas.dich_vu_schema import (
    DichVuCreate,
    DichVuDetailOut,
    DichVuOut,
    ServiceReviewResponse,
)

router = APIRouter()


@router.get("/", response_model=list[DichVuOut])
def get_services_api(
    keyword: str | None = Query(default=None),
    category_id: int | None = Query(default=None),
    only_active: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    return get_services(
        db=db,
        keyword=keyword,
        category_id=category_id,
        only_active=only_active,
    )


@router.get("/{service_id}/danh-gia", response_model=ServiceReviewResponse)
def get_service_reviews_api(
    service_id: int,
    db: Session = Depends(get_db),
):
    return get_service_reviews(db, service_id)


@router.get("/{service_id}", response_model=DichVuDetailOut)
def get_service_detail_api(
    service_id: int,
    db: Session = Depends(get_db),
):
    return get_service_by_id(db, service_id)


@router.post("/", response_model=DichVuDetailOut)
def create_service_api(
    payload: DichVuCreate,
    db: Session = Depends(get_db),
):
    return create_service(db, payload)
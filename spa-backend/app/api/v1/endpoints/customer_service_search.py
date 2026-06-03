from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud.customer_service_search_crud import (
    search_customer_services,
    suggest_customer_services,
)
from app.db.session import get_db
from app.schemas.customer_service_search_schema import CustomerServiceSearchResponse


router = APIRouter()


@router.get("", response_model=CustomerServiceSearchResponse)
def search_customer_services_api(
    keyword: str | None = Query(None),
    category: str = Query("Tất cả"),
    priceRange: str = Query("Tất cả mức giá"),
    duration: str = Query("Tất cả thời lượng"),
    sortBy: str = Query("default"),
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=60),
    db: Session = Depends(get_db),
):
    return search_customer_services(
        db=db,
        keyword=keyword,
        category=category,
        price_range=priceRange,
        duration=duration,
        sort_by=sortBy,
        page=page,
        limit=limit,
    )

@router.get("/suggest")
def suggest_customer_services_api(
    keyword: str | None = Query(None),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
):
    return suggest_customer_services(
        db=db,
        keyword=keyword,
        limit=limit,
    )
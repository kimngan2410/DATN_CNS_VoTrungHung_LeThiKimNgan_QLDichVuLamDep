from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud.staff_service_consultation_crud import (
    get_service_template,
    search_consultation_services,
)
from app.db.session import get_db
from app.schemas.staff_service_consultation_schema import (
    StaffConsultationServiceSearchResponse,
    StaffConsultationTemplateRequest,
    StaffConsultationTemplateResponse,
)


router = APIRouter()


@router.get(
    "/services",
    response_model=StaffConsultationServiceSearchResponse,
)
def search_consultation_services_api(
    keyword: str | None = Query(""),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    return search_consultation_services(
        db=db,
        keyword=keyword,
        limit=limit,
    )


@router.post(
    "/template",
    response_model=StaffConsultationTemplateResponse,
)
def get_service_consultation_template_api(
    payload: StaffConsultationTemplateRequest,
    db: Session = Depends(get_db),
):
    return get_service_template(
        db=db,
        id_dich_vu=payload.idDichVu,
        customer_concern=payload.customerConcern,
    )
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.home_crud import (
    get_featured_services_from_db,
    get_featured_testimonials_from_db,
    get_home_data_from_db,
)
from app.db.session import get_db
from app.schemas.home_schema import (
    HomeResponse,
    HomeServiceOut,
    HomeTestimonialOut,
)

router = APIRouter()


@router.get("/", response_model=HomeResponse)
def get_home_data(db: Session = Depends(get_db)):
    return get_home_data_from_db(db)


@router.get("/dich-vu-noi-bat", response_model=list[HomeServiceOut])
def get_featured_services(db: Session = Depends(get_db)):
    return get_featured_services_from_db(db, limit=4)


@router.get("/danh-gia-noi-bat", response_model=list[HomeTestimonialOut])
def get_featured_testimonials(db: Session = Depends(get_db)):
    return get_featured_testimonials_from_db(db, limit=3)
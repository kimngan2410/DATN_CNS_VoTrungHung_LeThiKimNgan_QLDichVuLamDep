from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.dich_vu_crud import get_service_categories
from app.db.session import get_db
from app.schemas.dich_vu_schema import DanhMucDichVuOut

router = APIRouter()


@router.get("/", response_model=list[DanhMucDichVuOut])
def get_service_categories_api(db: Session = Depends(get_db)):
    return get_service_categories(db)
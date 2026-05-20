from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.home_crud import get_home_data
from app.db.session import get_db
from app.schemas.home_schema import HomeResponse

router = APIRouter()


@router.get("/", response_model=HomeResponse)
def get_home_api(db: Session = Depends(get_db)):
    return get_home_data(db)
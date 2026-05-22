from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.crud.danh_gia_crud import create_customer_review, update_customer_review
from app.db.session import get_db
from app.schemas.danh_gia_schema import ReviewOut


router = APIRouter()


@router.post("/", response_model=ReviewOut)
def create_review_api(
    idTaiKhoan: int = Form(...),
    idChiTietLH: int = Form(...),
    soSao: int = Form(...),
    noiDung: str | None = Form(default=""),
    images: list[UploadFile] | None = File(default=None),
    db: Session = Depends(get_db),
):
    return create_customer_review(
        db=db,
        id_tai_khoan=idTaiKhoan,
        id_chi_tiet_lh=idChiTietLH,
        so_sao=soSao,
        noi_dung=noiDung,
        images=images or [],
    )

@router.patch("/{id_danh_gia}", response_model=ReviewOut)
def update_review_api(
    id_danh_gia: int,
    idTaiKhoan: int = Form(...),
    soSao: int = Form(...),
    noiDung: str | None = Form(default=""),
    keptImages: list[str] | None = Form(default=None),
    images: list[UploadFile] | None = File(default=None),
    db: Session = Depends(get_db),
):
    return update_customer_review(
        db=db,
        id_tai_khoan=idTaiKhoan,
        id_danh_gia=id_danh_gia,
        so_sao=soSao,
        noi_dung=noiDung,
        kept_image_urls=keptImages or [],
        images=images or [],
    )
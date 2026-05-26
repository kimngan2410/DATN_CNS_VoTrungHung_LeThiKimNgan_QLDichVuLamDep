from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.dich_vu_crud import (
    create_admin_service,
    create_service,
    delete_admin_service,
    get_admin_service_detail,
    get_admin_services,
    get_service_by_id,
    get_service_reviews,
    get_services,
    update_admin_service,
)
from app.db.session import get_db
from app.schemas.dich_vu_schema import (
    AdminServiceActionResponse,
    AdminServiceCreate,
    AdminServiceOut,
    AdminServiceUpdate,
    AdminUploadImagesResponse,
    DichVuCreate,
    DichVuDetailOut,
    DichVuOut,
    ServiceReviewResponse,
)

router = APIRouter()

UPLOAD_SERVICE_DIR = Path("uploads/services")
UPLOAD_SERVICE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def save_service_upload_file(file: UploadFile):
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP",
        )

    filename = f"service_{uuid4().hex}{extension}"
    file_path = UPLOAD_SERVICE_DIR / filename

    with file_path.open("wb") as buffer:
        buffer.write(file.file.read())

    return f"/uploads/services/{filename}"


# =========================
# ADMIN SERVICE MANAGEMENT
# =========================

@router.get(
    "/admin/danh-sach",
    response_model=list[AdminServiceOut],
)
def get_admin_services_api(
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_services(db)


@router.get(
    "/admin/{id_dich_vu}",
    response_model=AdminServiceOut,
)
def get_admin_service_detail_api(
    id_dich_vu: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_service_detail(
        db=db,
        id_dich_vu=id_dich_vu,
    )


@router.post(
    "/admin/upload-anh",
    response_model=AdminUploadImagesResponse,
)
def upload_admin_service_images_api(
    files: list[UploadFile] = File(...),
    current_admin: dict = Depends(require_admin),
):
    if len(files) == 0:
        return {"images": []}

    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mỗi dịch vụ chỉ được tải tối đa 5 ảnh",
        )

    image_urls = []

    try:
        for file in files:
            image_urls.append(save_service_upload_file(file))

        return {"images": image_urls}

    finally:
        for file in files:
            file.file.close()


@router.post(
    "/admin/tao",
    response_model=AdminServiceOut,
)
def create_admin_service_api(
    payload: AdminServiceCreate,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return create_admin_service(
        db=db,
        payload=payload,
    )


@router.put(
    "/admin/{id_dich_vu}",
    response_model=AdminServiceOut,
)
def update_admin_service_api(
    id_dich_vu: int,
    payload: AdminServiceUpdate,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return update_admin_service(
        db=db,
        id_dich_vu=id_dich_vu,
        payload=payload,
    )


@router.delete(
    "/admin/{id_dich_vu}",
    response_model=AdminServiceActionResponse,
)
def delete_admin_service_api(
    id_dich_vu: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return delete_admin_service(
        db=db,
        id_dich_vu=id_dich_vu,
    )


# =========================
# PUBLIC / CUSTOMER
# =========================

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
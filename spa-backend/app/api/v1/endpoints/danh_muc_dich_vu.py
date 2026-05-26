from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.danh_muc_dich_vu_crud import (
    create_admin_service_category,
    delete_admin_service_category,
    get_admin_service_categories,
    get_admin_service_category_detail,
    update_admin_service_category,
)
from app.crud.dich_vu_crud import get_service_categories
from app.db.session import get_db
from app.schemas.danh_muc_dich_vu_schema import (
    AdminServiceCategoryActionResponse,
    AdminServiceCategoryCreate,
    AdminServiceCategoryOut,
    AdminServiceCategoryUpdate,
)
from app.schemas.dich_vu_schema import DanhMucDichVuOut


router = APIRouter()


# =========================
# PUBLIC / CUSTOMER
# =========================

@router.get("/", response_model=list[DanhMucDichVuOut])
def get_service_categories_api(db: Session = Depends(get_db)):
    return get_service_categories(db)


# =========================
# ADMIN CATEGORY MANAGEMENT
# =========================

@router.get(
    "/admin/danh-sach",
    response_model=list[AdminServiceCategoryOut],
)
def get_admin_service_categories_api(
    fromDate: str | None = Query(default=None),
    toDate: str | None = Query(default=None),
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_service_categories(
        db=db,
        from_date=fromDate,
        to_date=toDate,
    )


@router.get(
    "/admin/{id_danh_muc}",
    response_model=AdminServiceCategoryOut,
)
def get_admin_service_category_detail_api(
    id_danh_muc: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_service_category_detail(
        db=db,
        id_danh_muc=id_danh_muc,
    )


@router.post(
    "/admin/tao",
    response_model=AdminServiceCategoryOut,
)
def create_admin_service_category_api(
    payload: AdminServiceCategoryCreate,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return create_admin_service_category(
        db=db,
        payload=payload,
    )


@router.put(
    "/admin/{id_danh_muc}",
    response_model=AdminServiceCategoryOut,
)
def update_admin_service_category_api(
    id_danh_muc: int,
    payload: AdminServiceCategoryUpdate,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return update_admin_service_category(
        db=db,
        id_danh_muc=id_danh_muc,
        payload=payload,
    )


@router.delete(
    "/admin/{id_danh_muc}",
    response_model=AdminServiceCategoryActionResponse,
)
def delete_admin_service_category_api(
    id_danh_muc: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return delete_admin_service_category(
        db=db,
        id_danh_muc=id_danh_muc,
    )
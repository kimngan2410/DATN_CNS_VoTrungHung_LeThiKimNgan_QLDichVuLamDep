from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps.auth_deps import require_admin
from app.crud.tai_khoan_crud import (
    create_admin_account,
    delete_admin_account,
    get_admin_account_or_404,
    get_admin_accounts,
    build_admin_account_response,
    update_admin_account,
    update_admin_account_status,
)
from app.db.session import get_db
from app.schemas.tai_khoan_schema import (
    AdminAccountCreateRequest,
    AdminAccountOut,
    AdminAccountStatusRequest,
    AdminAccountUpdateRequest,
)


router = APIRouter()


def get_current_admin_id(current_admin):
    tai_khoan = current_admin.get("taiKhoan") if isinstance(current_admin, dict) else None

    if tai_khoan:
        return int(tai_khoan.idTaiKhoan)

    return int(
        current_admin.get("idTaiKhoan")
        or current_admin.get("id")
        or 0
    )


@router.get(
    "/admin/danh-sach",
    response_model=list[AdminAccountOut],
)
def get_admin_account_list_api(
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_accounts(db)


@router.get(
    "/admin/{id_tai_khoan}",
    response_model=AdminAccountOut,
)
def get_admin_account_detail_api(
    id_tai_khoan: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    account = get_admin_account_or_404(db, id_tai_khoan)

    return build_admin_account_response(db, account)


@router.post(
    "/admin/tao",
    response_model=AdminAccountOut,
)
def create_admin_account_api(
    payload: AdminAccountCreateRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return create_admin_account(db, payload)


@router.put(
    "/admin/{id_tai_khoan}",
    response_model=AdminAccountOut,
)
def update_admin_account_api(
    id_tai_khoan: int,
    payload: AdminAccountUpdateRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    current_admin_id = get_current_admin_id(current_admin)

    return update_admin_account(
        db=db,
        id_tai_khoan=id_tai_khoan,
        payload=payload,
        current_admin_id=current_admin_id,
    )


@router.patch(
    "/admin/{id_tai_khoan}/trang-thai",
    response_model=AdminAccountOut,
)
def update_admin_account_status_api(
    id_tai_khoan: int,
    payload: AdminAccountStatusRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    current_admin_id = get_current_admin_id(current_admin)

    return update_admin_account_status(
        db=db,
        id_tai_khoan=id_tai_khoan,
        status_value=payload.status,
        current_admin_id=current_admin_id,
    )

@router.delete(
    "/admin/{id_tai_khoan}",
)
def delete_admin_account_api(
    id_tai_khoan: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    current_admin_id = get_current_admin_id(current_admin)

    return delete_admin_account(
        db=db,
        id_tai_khoan=id_tai_khoan,
        current_admin_id=current_admin_id,
    )
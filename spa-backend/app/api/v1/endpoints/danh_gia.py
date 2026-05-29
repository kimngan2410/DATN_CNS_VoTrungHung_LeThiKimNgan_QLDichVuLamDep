from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.crud.danh_gia_crud import (
    create_customer_review,
    get_admin_review_or_404,
    get_admin_reviews,
    update_customer_review,
    upsert_admin_review_reply,
)

from app.db.session import get_db
from app.schemas.danh_gia_schema import (
    AdminReviewOut,
    AdminReviewReplyRequest,
    ReviewOut,
)
from app.api.deps.auth_deps import require_admin
from app.models.tai_khoan import TaiKhoan


router = APIRouter()

def get_admin_account_id(current_admin, db: Session):
    print("CURRENT_ADMIN_DEBUG:", current_admin)

    if isinstance(current_admin, dict):
        tai_khoan = current_admin.get("taiKhoan")

        if tai_khoan:
            admin_id = getattr(tai_khoan, "idTaiKhoan", None)

            if admin_id:
                return int(admin_id)

        admin_id = (
            current_admin.get("idTaiKhoan")
            or current_admin.get("id_tai_khoan")
            or current_admin.get("id_taikhoan")
            or current_admin.get("idTaiKhoanAdmin")
            or current_admin.get("user_id")
            or current_admin.get("account_id")
            or current_admin.get("id")
        )

        if admin_id:
            return int(admin_id)

        email = (
            current_admin.get("email")
            or current_admin.get("sub")
            or current_admin.get("username")
        )

        if email:
            account = (
                db.query(TaiKhoan)
                .filter(TaiKhoan.email == str(email))
                .first()
            )

            if account:
                return int(account.idTaiKhoan)

    admin_id = (
        getattr(current_admin, "idTaiKhoan", None)
        or getattr(current_admin, "id_tai_khoan", None)
        or getattr(current_admin, "id_taikhoan", None)
        or getattr(current_admin, "idTaiKhoanAdmin", None)
        or getattr(current_admin, "user_id", None)
        or getattr(current_admin, "account_id", None)
        or getattr(current_admin, "id", None)
    )

    if admin_id:
        return int(admin_id)

    email = (
        getattr(current_admin, "email", None)
        or getattr(current_admin, "sub", None)
        or getattr(current_admin, "username", None)
    )

    if email:
        account = (
            db.query(TaiKhoan)
            .filter(TaiKhoan.email == str(email))
            .first()
        )

        if account:
            return int(account.idTaiKhoan)

    return None

@router.get(
    "/admin/danh-sach",
    response_model=list[AdminReviewOut],
)
def get_admin_review_list_api(
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_admin_reviews(db)


@router.get(
    "/admin/{id_danh_gia}",
    response_model=AdminReviewOut,
)
def get_admin_review_detail_api(
    id_danh_gia: int,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    review = get_admin_review_or_404(db, id_danh_gia)

    from app.crud.danh_gia_crud import build_admin_review_response

    return build_admin_review_response(db, review)


@router.post(
    "/admin/{id_danh_gia}/phan-hoi",
    response_model=AdminReviewOut,
)
def reply_admin_review_api(
    id_danh_gia: int,
    payload: AdminReviewReplyRequest,
    current_admin: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    admin_account_id = get_admin_account_id(current_admin, db)

    return upsert_admin_review_reply(
        db=db,
        id_danh_gia=id_danh_gia,
        noi_dung_phan_hoi=payload.noiDungPhanHoi,
        id_tai_khoan_admin=admin_account_id,
    )


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
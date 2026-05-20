from sqlalchemy.orm import Session, joinedload

from app.crud.dich_vu_crud import get_service_categories, get_services
from app.models.danh_gia import DanhGia
from app.models.khach_hang import KhachHang


VISIBLE_REVIEW_STATUSES = [
    "Hiển thị",
    "HIEN_THI",
    "Hien thi",
    "ACTIVE",
]


def format_date(value):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y")


def get_home_data(db: Session):
    # get_services hiện đã order theo ngày tạo mới nhất.
    services = get_services(
        db=db,
        keyword=None,
        category_id=None,
        only_active=True,
    )

    new_services = services[:4]

    categories = get_service_categories(db)

    reviews = (
        db.query(DanhGia)
        .options(joinedload(DanhGia.khachHang))
        .filter(DanhGia.trangThaiHienThi.in_(VISIBLE_REVIEW_STATUSES))
        .order_by(DanhGia.ngayDanhGia.desc(), DanhGia.idDanhGia.desc())
        .limit(6)
        .all()
    )

    testimonials = []

    for review in reviews:
        customer_name = "Khách hàng"
        avatar = None

        if review.khachHang:
            customer_name = review.khachHang.hoTen or "Khách hàng"
            avatar = getattr(review.khachHang, "anhDaiDien", None)

        testimonials.append(
            {
                "id": int(review.idDanhGia),
                "customerName": customer_name,
                "avatar": avatar,
                "rating": int(review.soSao or 5),
                "content": review.noiDung or "",
                "createdAt": format_date(review.ngayDanhGia),
            }
        )

    return {
        "newServices": new_services,
        "categories": categories,
        "testimonials": testimonials,
    }
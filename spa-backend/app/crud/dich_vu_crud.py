from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu
from app.models.danh_gia import DanhGia
from app.models.hinh_anh_danh_gia import HinhAnhDanhGia
from app.models.phan_hoi_danh_gia import PhanHoiDanhGia
from app.models.khach_hang import KhachHang
from app.models.tai_khoan import TaiKhoan

# Nếu file model của bạn tên khác thì sửa lại dòng import này cho đúng.
# Thường sẽ là app.models.chi_tiet_lich_hen
from app.models.chi_tiet_lich_hen import ChiTietLichHen


DEFAULT_SERVICE_IMAGE = (
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80"
)

ACTIVE_SERVICE_STATUSES = [
    "Hoạt động",
    "HOAT_DONG",
    "Hoat dong",
    "ACTIVE",
]

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


def generate_service_code(db: Session) -> str:
    max_id = db.query(func.max(DichVu.idDichVu)).scalar() or 0
    next_number = int(max_id) + 1

    while True:
        code = f"DV{next_number:04d}"
        existing = db.query(DichVu).filter(DichVu.maDV == code).first()

        if not existing:
            return code

        next_number += 1


def get_service_images(db: Session, id_dich_vu: int) -> list[str]:
    images = (
        db.query(HinhAnhDichVu)
        .filter(HinhAnhDichVu.idDichVu == id_dich_vu)
        .order_by(HinhAnhDichVu.anhChinh.desc(), HinhAnhDichVu.idHinhAnh.asc())
        .all()
    )

    image_urls = [image.duongDanAnh for image in images if image.duongDanAnh]

    if not image_urls:
        return [DEFAULT_SERVICE_IMAGE]

    return image_urls


def get_service_main_image(db: Session, id_dich_vu: int) -> str:
    images = get_service_images(db, id_dich_vu)

    return images[0] if images else DEFAULT_SERVICE_IMAGE


def format_service_item(db: Session, service: DichVu):
    is_active = service.trangThai in ACTIVE_SERVICE_STATUSES

    return {
        "id": int(service.idDichVu),
        "maDV": service.maDV,
        "title": service.tenDV,
        "category": service.danhMuc.tenDM if service.danhMuc else "Dịch vụ",
        "categoryId": int(service.idDanhMuc),
        "description": service.moTaNgan or service.moTaChiTiet or "",
        "detailDescription": service.moTaChiTiet,
        "price": float(service.gia or 0),
        "duration": int(service.thoiLuongPhut or 0),
        "image": get_service_main_image(db, service.idDichVu),
        "isActive": is_active,
        "isFeatured": is_active,
    }


def get_service_categories(db: Session):
    categories = (
        db.query(DanhMucDichVu)
        .order_by(DanhMucDichVu.idDanhMuc.asc())
        .all()
    )

    return [
        {
            "id": int(category.idDanhMuc),
            "tenDM": category.tenDM,
            "moTa": category.moTa,
        }
        for category in categories
    ]


def get_services(
    db: Session,
    keyword: str | None = None,
    category_id: int | None = None,
    only_active: bool = True,
):
    query = db.query(DichVu).options(joinedload(DichVu.danhMuc))

    if only_active:
        query = query.filter(DichVu.trangThai.in_(ACTIVE_SERVICE_STATUSES))

    if category_id:
        query = query.filter(DichVu.idDanhMuc == category_id)

    if keyword:
        keyword_like = f"%{keyword.strip()}%"

        query = query.filter(
            or_(
                DichVu.tenDV.ilike(keyword_like),
                DichVu.moTaNgan.ilike(keyword_like),
                DichVu.moTaChiTiet.ilike(keyword_like),
                DichVu.maDV.ilike(keyword_like),
            )
        )

    services = (
        query.order_by(DichVu.ngayTao.desc(), DichVu.idDichVu.desc())
        .all()
    )

    return [format_service_item(db, service) for service in services]


def get_related_services(db: Session, service: DichVu, limit: int = 3):
    related_services = (
        db.query(DichVu)
        .options(joinedload(DichVu.danhMuc))
        .filter(
            DichVu.idDichVu != service.idDichVu,
            DichVu.idDanhMuc == service.idDanhMuc,
            DichVu.trangThai.in_(ACTIVE_SERVICE_STATUSES),
        )
        .order_by(DichVu.ngayTao.desc(), DichVu.idDichVu.desc())
        .limit(limit)
        .all()
    )

    return [format_service_item(db, item) for item in related_services]


def get_service_by_id(db: Session, service_id: int):
    service = (
        db.query(DichVu)
        .options(joinedload(DichVu.danhMuc))
        .filter(DichVu.idDichVu == service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dịch vụ",
        )

    service_data = format_service_item(db, service)

    service_data["images"] = get_service_images(db, service.idDichVu)
    service_data["relatedServices"] = get_related_services(db, service, limit=3)

    return service_data


def create_service(db: Session, payload):
    category = (
        db.query(DanhMucDichVu)
        .filter(DanhMucDichVu.idDanhMuc == payload.idDanhMuc)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục dịch vụ",
        )

    service = DichVu(
        idDanhMuc=payload.idDanhMuc,
        maDV=generate_service_code(db),
        tenDV=payload.tenDV.strip(),
        moTaNgan=payload.moTaNgan,
        moTaChiTiet=payload.moTaChiTiet,
        gia=payload.gia,
        thoiLuongPhut=payload.thoiLuongPhut,
        trangThai=payload.trangThai,
    )

    db.add(service)
    db.flush()

    if payload.anhChinh:
        image = HinhAnhDichVu(
            idDichVu=service.idDichVu,
            duongDanAnh=payload.anhChinh,
            anhChinh=True,
        )
        db.add(image)

    db.commit()
    db.refresh(service)

    return get_service_by_id(db, service.idDichVu)


def get_review_images(db: Session, review_id: int):
    images = (
        db.query(HinhAnhDanhGia)
        .filter(HinhAnhDanhGia.idDanhGia == review_id)
        .order_by(HinhAnhDanhGia.idHinhAnhDanhGia.asc())
        .all()
    )

    return [
        {
            "id": int(image.idHinhAnhDanhGia),
            "imageUrl": image.duongDanAnh,
        }
        for image in images
    ]


def get_review_reply(db: Session, review_id: int):
    reply = (
        db.query(PhanHoiDanhGia)
        .options(joinedload(PhanHoiDanhGia.taiKhoan))
        .filter(PhanHoiDanhGia.idDanhGia == review_id)
        .order_by(PhanHoiDanhGia.ngayTao.desc())
        .first()
    )

    if not reply:
        return None

    admin_name = "Serenity Spa"

    if reply.taiKhoan and reply.taiKhoan.email:
        admin_name = reply.taiKhoan.email

    return {
        "adminName": admin_name,
        "content": reply.noiDungDanhGia,
        "createdAt": format_date(reply.ngayTao),
    }


def get_service_reviews(db: Session, service_id: int):
    reviews = (
        db.query(DanhGia)
        .join(
            ChiTietLichHen,
            DanhGia.idChiTietLH == ChiTietLichHen.idChiTietLH,
        )
        .options(joinedload(DanhGia.khachHang))
        .filter(
            ChiTietLichHen.idDichVu == service_id,
            DanhGia.trangThaiHienThi.in_(VISIBLE_REVIEW_STATUSES),
        )
        .order_by(DanhGia.ngayDanhGia.desc(), DanhGia.idDanhGia.desc())
        .all()
    )

    review_items = []

    for review in reviews:
        customer_name = "Khách hàng"
        customer_avatar = None

        if review.khachHang:
            customer_name = review.khachHang.hoTen or "Khách hàng"
            customer_avatar = getattr(review.khachHang, "anhDaiDien", None)

        review_items.append(
            {
                "id": int(review.idDanhGia),
                "serviceId": int(service_id),
                "customerName": customer_name,
                "avatar": customer_avatar,
                "rating": int(review.soSao),
                "content": review.noiDung or "",
                "createdAt": format_date(review.ngayDanhGia),
                "images": get_review_images(db, review.idDanhGia),
                "reply": get_review_reply(db, review.idDanhGia),
            }
        )

    total_reviews = len(review_items)

    average_rating = 0

    if total_reviews > 0:
        average_rating = round(
            sum(item["rating"] for item in review_items) / total_reviews,
            1,
        )

    return {
        "averageRating": average_rating,
        "totalReviews": total_reviews,
        "reviews": review_items,
    }
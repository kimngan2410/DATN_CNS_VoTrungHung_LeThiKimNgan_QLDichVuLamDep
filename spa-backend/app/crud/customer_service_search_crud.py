from math import ceil

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu
from app.models.danh_gia import DanhGia
from app.models.chi_tiet_lich_hen import ChiTietLichHen


ACTIVE_STATUSES = ["Hoạt động", "Đang cung cấp", "HOAT_DONG"]
VISIBLE_REVIEW_STATUSES = [
    "Hiển thị",
    "HIEN_THI",
    "Hien thi",
    "ACTIVE",
]


def normalize_text(value: str | None, default_value: str = ""):
    value = (value or default_value).strip()
    return value if value else default_value


def get_main_service_image(db: Session, service_id: int):
    image = (
        db.query(HinhAnhDichVu)
        .filter(HinhAnhDichVu.idDichVu == service_id)
        .order_by(HinhAnhDichVu.anhChinh.desc(), HinhAnhDichVu.idHinhAnh.asc())
        .first()
    )

    return image.duongDanAnh if image else ""


def map_service_item(
    db: Session,
    service: DichVu,
    category: DanhMucDichVu | None,
    average_rating: float = 0,
    total_reviews: int = 0,
):
    return {
        "id": int(service.idDichVu),
        "maDV": service.maDV,
        "title": service.tenDV,
        "category": category.tenDM if category else "Khác",
        "price": float(service.gia or 0),
        "duration": int(service.thoiLuongPhut or 0),
        "description": service.moTaNgan or service.moTaChiTiet or "",
        "image": get_main_service_image(db, int(service.idDichVu)),
        "isActive": service.trangThai in ACTIVE_STATUSES,
        "averageRating": round(float(average_rating or 0), 1),
        "totalReviews": int(total_reviews or 0),
    }


def build_base_query(db: Session):
    return (
        db.query(DichVu, DanhMucDichVu)
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .filter(DichVu.trangThai.in_(ACTIVE_STATUSES))
    )

def build_service_rating_subquery(db: Session):
    return (
        db.query(
            ChiTietLichHen.idDichVu.label("idDichVu"),
            func.coalesce(func.avg(DanhGia.soSao), 0).label("averageRating"),
            func.count(DanhGia.idDanhGia).label("totalReviews"),
        )
        .join(
            ChiTietLichHen,
            DanhGia.idChiTietLH == ChiTietLichHen.idChiTietLH,
        )
        .filter(DanhGia.trangThaiHienThi.in_(VISIBLE_REVIEW_STATUSES))
        .group_by(ChiTietLichHen.idDichVu)
        .subquery()
    )


def apply_keyword_filter(query, keyword_text: str):
    if not keyword_text:
        return query

    like_keyword = f"%{keyword_text}%"

    return query.filter(
        or_(
            DichVu.maDV.ilike(like_keyword),
            DichVu.tenDV.ilike(like_keyword),
            DichVu.moTaNgan.ilike(like_keyword),
            DichVu.moTaChiTiet.ilike(like_keyword),
            DanhMucDichVu.tenDM.ilike(like_keyword),
            DanhMucDichVu.moTa.ilike(like_keyword),
        )
    )


def apply_price_filter(query, price_filter: str):
    if price_filter == "Dưới 500.000đ":
        return query.filter(DichVu.gia < 500000)

    if price_filter == "500.000đ - 1.000.000đ":
        return query.filter(DichVu.gia >= 500000, DichVu.gia <= 1000000)

    if price_filter == "Trên 1.000.000đ":
        return query.filter(DichVu.gia > 1000000)

    return query


def apply_duration_filter(query, duration_filter: str):
    if duration_filter == "Dưới 60 phút":
        return query.filter(DichVu.thoiLuongPhut < 60)

    if duration_filter == "60 - 90 phút":
        return query.filter(
            DichVu.thoiLuongPhut >= 60,
            DichVu.thoiLuongPhut <= 90,
        )

    if duration_filter == "Trên 90 phút":
        return query.filter(DichVu.thoiLuongPhut > 90)

    return query

def apply_rating_filter(query, rating_filter: str, rating_subquery):
    if rating_filter == "Tất cả":
        return query

    try:
        rating_value = float(rating_filter)
    except ValueError:
        return query

    return query.filter(
        func.coalesce(rating_subquery.c.averageRating, 0) >= rating_value
    )

def search_customer_services(
    db: Session,
    keyword: str | None = None,
    category: str | None = "Tất cả",
    price_range: str | None = "Tất cả mức giá",
    duration: str | None = "Tất cả thời lượng",
    rating: str | None = "Tất cả",
    sort_by: str | None = "default",
    page: int = 1,
    limit: int = 9,
):
    keyword_text = normalize_text(keyword)
    category_filter = normalize_text(category, "Tất cả")
    price_filter = normalize_text(price_range, "Tất cả mức giá")
    duration_filter = normalize_text(duration, "Tất cả thời lượng")
    rating_filter = normalize_text(rating, "Tất cả")
    sort_value = normalize_text(sort_by, "default")

    page = max(page, 1)
    limit = max(min(limit, 60), 1)

    rating_subquery = build_service_rating_subquery(db)

    query = (
        db.query(
            DichVu,
            DanhMucDichVu,
            func.coalesce(rating_subquery.c.averageRating, 0).label("averageRating"),
            func.coalesce(rating_subquery.c.totalReviews, 0).label("totalReviews"),
        )
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .outerjoin(
            rating_subquery,
            DichVu.idDichVu == rating_subquery.c.idDichVu,
        )
        .filter(DichVu.trangThai.in_(ACTIVE_STATUSES))
    )

    query = apply_keyword_filter(query, keyword_text)

    if category_filter != "Tất cả":
        query = query.filter(DanhMucDichVu.tenDM == category_filter)

    query = apply_price_filter(query, price_filter)
    query = apply_duration_filter(query, duration_filter)
    query = apply_rating_filter(query, rating_filter, rating_subquery)

    if sort_value == "price-asc":
        query = query.order_by(DichVu.gia.asc(), DichVu.idDichVu.desc())
    elif sort_value == "price-desc":
        query = query.order_by(DichVu.gia.desc(), DichVu.idDichVu.desc())
    else:
        query = query.order_by(DichVu.idDichVu.desc())

    total = query.count()
    total_pages = ceil(total / limit) if total > 0 else 0

    rows = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "keyword": keyword_text,
        "category": category_filter,
        "priceRange": price_filter,
        "duration": duration_filter,
        "rating": rating_filter,
        "sortBy": sort_value,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
        "services": [
            map_service_item(
                db=db,
                service=service,
                category=category,
                average_rating=average_rating,
                total_reviews=total_reviews,
            )
            for service, category, average_rating, total_reviews in rows
        ],
    }


def suggest_customer_services(
    db: Session,
    keyword: str | None = None,
    limit: int = 5,
):
    keyword_text = normalize_text(keyword)

    if not keyword_text:
        return {
            "keyword": "",
            "services": [],
        }

    limit = max(min(limit, 10), 1)

    rating_subquery = build_service_rating_subquery(db)

    query = (
        db.query(
            DichVu,
            DanhMucDichVu,
            func.coalesce(rating_subquery.c.averageRating, 0).label("averageRating"),
            func.coalesce(rating_subquery.c.totalReviews, 0).label("totalReviews"),
        )
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .outerjoin(
            rating_subquery,
            DichVu.idDichVu == rating_subquery.c.idDichVu,
        )
        .filter(DichVu.trangThai.in_(ACTIVE_STATUSES))
    )

    query = apply_suggestion_keyword_filter(query, keyword_text)

    rows = (
        query.order_by(DichVu.tenDV.asc(), DichVu.idDichVu.desc())
        .limit(limit)
        .all()
    )

    return {
        "keyword": keyword_text,
        "services": [
            map_service_item(
                db=db,
                service=service,
                category=category,
                average_rating=average_rating,
                total_reviews=total_reviews,
            )
            for service, category, average_rating, total_reviews in rows
        ],
    }

def apply_suggestion_keyword_filter(query, keyword_text: str):
    if not keyword_text:
        return query

    like_keyword = f"%{keyword_text}%"

    return query.filter(
        or_(
            DichVu.maDV.ilike(like_keyword),
            DichVu.tenDV.ilike(like_keyword),
        )
    )
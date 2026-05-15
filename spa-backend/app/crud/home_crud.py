from sqlalchemy.orm import Session, joinedload

from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu


DEFAULT_SERVICE_IMAGE = (
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80"
)

ACTIVE_SERVICE_STATUSES = [
    "Hoạt động",
    "HOAT_DONG",
    "Hoat dong",
    "ACTIVE",
]


def get_service_main_image(db: Session, id_dich_vu: int) -> str:
    main_image = (
        db.query(HinhAnhDichVu)
        .filter(
            HinhAnhDichVu.idDichVu == id_dich_vu,
            HinhAnhDichVu.anhChinh.is_(True),
        )
        .first()
    )

    if main_image:
        return main_image.duongDanAnh

    first_image = (
        db.query(HinhAnhDichVu)
        .filter(HinhAnhDichVu.idDichVu == id_dich_vu)
        .first()
    )

    if first_image:
        return first_image.duongDanAnh

    return DEFAULT_SERVICE_IMAGE


def format_home_service(db: Session, service: DichVu):
    return {
        "id": int(service.idDichVu),
        "title": service.tenDV,
        "category": service.danhMuc.tenDM if service.danhMuc else "Dịch vụ",
        "description": service.moTaNgan or service.moTaChiTiet or "",
        "price": float(service.gia or 0),
        "duration": int(service.thoiLuongPhut or 0),
        "image": get_service_main_image(db, service.idDichVu),
        "isFeatured": True,
        "isActive": service.trangThai in ACTIVE_SERVICE_STATUSES,
    }


def get_featured_services_from_db(db: Session, limit: int = 4):
    services = (
        db.query(DichVu)
        .options(joinedload(DichVu.danhMuc))
        .filter(DichVu.trangThai.in_(ACTIVE_SERVICE_STATUSES))
        .order_by(DichVu.ngayTao.desc(), DichVu.idDichVu.desc())
        .limit(limit)
        .all()
    )

    return [format_home_service(db, service) for service in services]


def get_featured_testimonials_from_db(db: Session, limit: int = 3):
    """
    Phần này sẽ nối bảng DanhGia / KhachHang / HinhAnhDanhGia sau.
    Hiện tại chưa viết query thật vì bạn chưa gửi model DanhGia, KhachHang, HinhAnhDanhGia.
    Trả [] để không dùng dữ liệu giả.
    """
    return []


def get_home_data_from_db(db: Session):
    return {
        "featuredServices": get_featured_services_from_db(db, limit=4),
        "testimonials": get_featured_testimonials_from_db(db, limit=3),
    }
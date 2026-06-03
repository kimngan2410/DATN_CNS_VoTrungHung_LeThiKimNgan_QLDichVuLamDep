from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu


ACTIVE_STATUSES = ["Hoạt động", "Đang cung cấp", "HOAT_DONG"]
FRONTEND_BASE_URL = "http://localhost:5173"


def normalize_text(value: str | None):
    return (value or "").strip()


def format_money_vn(value):
    number = float(value or 0)
    return f"{number:,.0f}".replace(",", ".") + "đ"


def get_main_service_image(db: Session, service_id: int):
    image = (
        db.query(HinhAnhDichVu)
        .filter(HinhAnhDichVu.idDichVu == service_id)
        .order_by(HinhAnhDichVu.anhChinh.desc(), HinhAnhDichVu.idHinhAnh.asc())
        .first()
    )

    return image.duongDanAnh if image else ""


def map_consultation_service(db: Session, service: DichVu, category: DanhMucDichVu | None):
    return {
        "id": int(service.idDichVu),
        "idDichVu": int(service.idDichVu),
        "maDV": service.maDV,
        "serviceName": service.tenDV,
        "category": category.tenDM if category else "Khác",
        "price": float(service.gia or 0),
        "duration": int(service.thoiLuongPhut or 0),
        "description": service.moTaNgan or service.moTaChiTiet or "",
        "image": get_main_service_image(db, int(service.idDichVu)),
    }


def search_consultation_services(
    db: Session,
    keyword: str | None = "",
    limit: int = 8,
):
    keyword_text = normalize_text(keyword)
    limit = max(min(limit, 20), 1)

    query = (
        db.query(DichVu, DanhMucDichVu)
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .filter(DichVu.trangThai.in_(ACTIVE_STATUSES))
    )

    if keyword_text:
        like_keyword = f"%{keyword_text}%"

        query = query.filter(
            or_(
                DichVu.maDV.ilike(like_keyword),
                DichVu.tenDV.ilike(like_keyword),
                DichVu.moTaNgan.ilike(like_keyword),
                DichVu.moTaChiTiet.ilike(like_keyword),
                DanhMucDichVu.tenDM.ilike(like_keyword),
                DanhMucDichVu.moTa.ilike(like_keyword),
            )
        )

    rows = (
        query.order_by(DichVu.tenDV.asc(), DichVu.idDichVu.desc())
        .limit(limit)
        .all()
    )

    services = [
        map_consultation_service(db, service, category)
        for service, category in rows
    ]

    return {
        "keyword": keyword_text,
        "total": len(services),
        "services": services,
    }


def get_service_template(
    db: Session,
    id_dich_vu: int,
    customer_concern: str | None = "",
):
    row = (
        db.query(DichVu, DanhMucDichVu)
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .filter(
            DichVu.idDichVu == id_dich_vu,
            DichVu.trangThai.in_(ACTIVE_STATUSES),
        )
        .first()
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy dịch vụ phù hợp để tư vấn.",
        )

    service, category = row
    service_data = map_consultation_service(db, service, category)

    concern = normalize_text(customer_concern)

    concern_text = (
        f"với tình trạng/nhu cầu hiện tại của bạn là {concern}, "
        if concern
        else "với nhu cầu chăm sóc và thư giãn của bạn, "
    )

    description = service.moTaNgan or service.moTaChiTiet or ""
    service_detail_url = f"{FRONTEND_BASE_URL}/dich-vu/{service.idDichVu}"

    service_name_upper = service.tenDV.upper()

    message_template = (
        f"Dạ {concern_text}Serenity Spa gợi ý bạn tham khảo dịch vụ:\n"
        f"{service_name_upper}\n\n"
    )

    if description:
        message_template += f"{description.strip()}\n\n"

    message_template += (
        f"Thời lượng: {int(service.thoiLuongPhut or 0)} phút\n"
        f"Giá tham khảo: {format_money_vn(service.gia)}\n"
        f"Xem chi tiết dịch vụ: {service_detail_url}\n\n"
        "Bạn có muốn Serenity Spa hỗ trợ đặt lịch dịch vụ này không ạ?"
    )

    return {
        "service": service_data,
        "messageTemplate": message_template,
    }
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu


def format_date(value):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y")


def parse_filter_date(value: str | None, field_name: str):
    if not value:
        return None

    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} không đúng định dạng YYYY-MM-DD",
        )


def get_category_code(category_id: int):
    return f"DM{int(category_id):03d}"


def validate_category_name(
    db: Session,
    name: str,
    ignore_category_id: int | None = None,
):
    name = name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên danh mục phải có ít nhất 2 ký tự",
        )

    query = db.query(DanhMucDichVu).filter(
        func.lower(DanhMucDichVu.tenDM) == name.lower()
    )

    if ignore_category_id:
        query = query.filter(DanhMucDichVu.idDanhMuc != ignore_category_id)

    existed = query.first()

    if existed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên danh mục đã tồn tại",
        )

    return name


def build_admin_category_service(service: DichVu):
    return {
        "id": service.maDV or f"DV{int(service.idDichVu):04d}",
        "idDichVu": int(service.idDichVu),
        "maDV": service.maDV or f"DV{int(service.idDichVu):04d}",
        "name": service.tenDV,
        "price": float(service.gia or 0),
        "duration": int(service.thoiLuongPhut or 0),
        "status": service.trangThai or "Hoạt động",
    }


def get_category_services(db: Session, id_danh_muc: int):
    services = (
        db.query(DichVu)
        .filter(DichVu.idDanhMuc == id_danh_muc)
        .order_by(DichVu.idDichVu.desc())
        .all()
    )

    return [build_admin_category_service(service) for service in services]


def build_admin_category_response(db: Session, category: DanhMucDichVu):
    services = get_category_services(db, int(category.idDanhMuc))

    return {
        "id": get_category_code(category.idDanhMuc),
        "idDanhMuc": int(category.idDanhMuc),
        "name": category.tenDM,
        "description": category.moTa or "Chưa có mô tả.",
        "createdAt": format_date(category.ngayTao),
        "serviceCount": len(services),
        "services": services,
    }


def get_admin_service_categories(
    db: Session,
    from_date: str | None = None,
    to_date: str | None = None,
):
    query = db.query(DanhMucDichVu)

    start_date = parse_filter_date(from_date, "Từ ngày")
    end_date = parse_filter_date(to_date, "Đến ngày")

    if start_date:
        query = query.filter(DanhMucDichVu.ngayTao >= start_date)

    if end_date:
        query = query.filter(DanhMucDichVu.ngayTao < end_date + timedelta(days=1))

    categories = (
        query.order_by(DanhMucDichVu.ngayTao.desc(), DanhMucDichVu.idDanhMuc.desc())
        .all()
    )

    return [build_admin_category_response(db, category) for category in categories]


def get_admin_service_category_detail(db: Session, id_danh_muc: int):
    category = (
        db.query(DanhMucDichVu)
        .filter(DanhMucDichVu.idDanhMuc == id_danh_muc)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục dịch vụ",
        )

    return build_admin_category_response(db, category)


def create_admin_service_category(db: Session, payload):
    name = validate_category_name(db, payload.name)
    description = (payload.description or "").strip() or "Chưa có mô tả."

    category = DanhMucDichVu(
        tenDM=name,
        moTa=description,
    )

    try:
        db.add(category)
        db.commit()
        db.refresh(category)

        return build_admin_category_response(db, category)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi thêm danh mục dịch vụ: {str(error)}",
        )


def update_admin_service_category(db: Session, id_danh_muc: int, payload):
    category = (
        db.query(DanhMucDichVu)
        .filter(DanhMucDichVu.idDanhMuc == id_danh_muc)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục dịch vụ",
        )

    name = validate_category_name(
        db=db,
        name=payload.name,
        ignore_category_id=id_danh_muc,
    )

    description = (payload.description or "").strip() or "Chưa có mô tả."

    try:
        category.tenDM = name
        category.moTa = description

        db.commit()
        db.refresh(category)

        return build_admin_category_response(db, category)

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật danh mục dịch vụ: {str(error)}",
        )


def delete_admin_service_category(db: Session, id_danh_muc: int):
    category = (
        db.query(DanhMucDichVu)
        .filter(DanhMucDichVu.idDanhMuc == id_danh_muc)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục dịch vụ",
        )

    service_count = (
        db.query(func.count(DichVu.idDichVu))
        .filter(DichVu.idDanhMuc == id_danh_muc)
        .scalar()
        or 0
    )

    if service_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xoá danh mục đang có dịch vụ trong hệ thống",
        )

    try:
        db.delete(category)
        db.commit()

        return {
            "message": "Xoá danh mục dịch vụ thành công",
            "category": None,
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xoá danh mục dịch vụ: {str(error)}",
        )
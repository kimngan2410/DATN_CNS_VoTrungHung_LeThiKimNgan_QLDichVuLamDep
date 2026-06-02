from datetime import date, datetime, time, timedelta

from sqlalchemy import distinct, func, or_
from sqlalchemy.orm import Session

from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu
from app.models.hoa_don import HoaDon
from app.models.danh_gia import DanhGia


PAID_STATUS = "Đã thanh toán"


def to_float(value):
    return float(value or 0)


def to_int(value):
    return int(value or 0)


def parse_date_value(value: str | None, default_value: date):
    if not value:
        return default_value

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return default_value


def format_date_iso(value: date | datetime | None):
    if not value:
        return ""

    return value.strftime("%Y-%m-%d")


def get_report_range(from_date: str | None, to_date: str | None):
    today = date.today()
    default_from = today.replace(day=1)

    start_date = parse_date_value(from_date, default_from)
    end_date = parse_date_value(to_date, today)

    if end_date < start_date:
        start_date, end_date = end_date, start_date

    start = datetime.combine(start_date, time.min)
    end = datetime.combine(end_date + timedelta(days=1), time.min)

    return start_date, end_date, start, end


def normalize_filter(value: str | None):
    value = (value or "Tất cả").strip()

    return value if value else "Tất cả"


def get_usage_status(usage_count: int):
    return "Đã sử dụng" if usage_count > 0 else "Chưa sử dụng"


def normalize_service_status(status_value: str | None):
    status_value = status_value or ""

    if status_value == "Hoạt động":
        return "Đang cung cấp"

    if status_value == "Ngừng cung cấp":
        return "Ngừng cung cấp"

    return status_value or "Đang cung cấp"


def get_category_options(db: Session):
    rows = (
        db.query(DanhMucDichVu.tenDM)
        .order_by(DanhMucDichVu.tenDM.asc())
        .all()
    )

    return ["Tất cả"] + [row.tenDM for row in rows if row.tenDM]


def get_service_usage_map(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(
            ChiTietHoaDon.idDichVu.label("idDichVu"),
            func.coalesce(func.sum(ChiTietHoaDon.soLuong), 0).label("usageCount"),
            func.count(distinct(HoaDon.idTaiKhoan)).label("customerCount"),
            func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).label("revenue"),
            func.max(HoaDon.ngayTao).label("lastUsedAt"),
        )
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .group_by(ChiTietHoaDon.idDichVu)
        .all()
    )

    usage_map = {}

    for row in rows:
        usage_map[int(row.idDichVu)] = {
            "usageCount": to_int(row.usageCount),
            "customerCount": to_int(row.customerCount),
            "revenue": to_float(row.revenue),
            "lastUsedAt": format_date_iso(row.lastUsedAt),
        }

    return usage_map

def get_service_review_map(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(
            ChiTietLichHen.idDichVu.label("idDichVu"),
            func.count(DanhGia.idDanhGia).label("reviewCount"),
            func.coalesce(func.avg(DanhGia.soSao), 0).label("averageRating"),
        )
        .join(ChiTietLichHen, ChiTietLichHen.idChiTietLH == DanhGia.idChiTietLH)
        .filter(
            DanhGia.trangThaiHienThi == "Hiển thị",
            DanhGia.ngayDanhGia >= start,
            DanhGia.ngayDanhGia < end,
        )
        .group_by(ChiTietLichHen.idDichVu)
        .all()
    )

    review_map = {}

    for row in rows:
        review_map[int(row.idDichVu)] = {
            "reviewCount": int(row.reviewCount or 0),
            "averageRating": round(float(row.averageRating or 0), 1),
        }

    return review_map

def build_service_rows(db: Session, start: datetime, end: datetime):
    usage_map = get_service_usage_map(db, start, end)
    review_map = get_service_review_map(db, start, end)

    rows = (
        db.query(DichVu, DanhMucDichVu)
        .join(DanhMucDichVu, DanhMucDichVu.idDanhMuc == DichVu.idDanhMuc)
        .order_by(DichVu.idDichVu.asc())
        .all()
    )

    services = []

    for service, category in rows:
        usage_data = usage_map.get(
            int(service.idDichVu),
            {
                "usageCount": 0,
                "customerCount": 0,
                "revenue": 0,
                "lastUsedAt": "",
            },
        )

        review_data = review_map.get(
            int(service.idDichVu),
            {
                "reviewCount": 0,
                "averageRating": 0,
            },
        )

        usage_count = usage_data["usageCount"]
        total_duration = usage_count * int(service.thoiLuongPhut or 0)
        service_status = normalize_service_status(service.trangThai)

        services.append(
            {
                "id": int(service.idDichVu),
                "serviceCode": service.maDV,
                "serviceName": service.tenDV,
                "category": category.tenDM if category else "Khác",
                "usageCount": usage_count,
                "customerCount": usage_data["customerCount"],
                "totalDuration": total_duration,
                "revenue": usage_data["revenue"],
                "reviewCount": review_data["reviewCount"],
                "averageRating": review_data["averageRating"],
                "serviceStatus": service_status,
                "usageStatus": get_usage_status(usage_count),
                "lastUsedAt": usage_data["lastUsedAt"],
            }
        )

    return services


def apply_filters(
    services: list[dict],
    keyword: str,
    category_filter: str,
    usage_status_filter: str,
    service_status_filter: str,
):
    keyword_text = keyword.strip().lower()

    result = []

    for service in services:
        matches_keyword = (
            not keyword_text
            or keyword_text in service["serviceCode"].lower()
            or keyword_text in service["serviceName"].lower()
            or keyword_text in service["category"].lower()
        )

        matches_category = (
            category_filter == "Tất cả" or service["category"] == category_filter
        )

        matches_usage_status = (
            usage_status_filter == "Tất cả"
            or service["usageStatus"] == usage_status_filter
        )

        matches_service_status = (
            service_status_filter == "Tất cả"
            or service["serviceStatus"] == service_status_filter
        )

        if (
            matches_keyword
            and matches_category
            and matches_usage_status
            and matches_service_status
        ):
            result.append(service)

    return result


def sort_services(services: list[dict], sort_by: str):
    if sort_by == "Doanh thu cao nhất":
        return sorted(services, key=lambda item: item["revenue"], reverse=True)

    if sort_by == "Số khách cao nhất":
        return sorted(services, key=lambda item: item["customerCount"], reverse=True)

    if sort_by == "Thời lượng cao nhất":
        return sorted(services, key=lambda item: item["totalDuration"], reverse=True)

    if sort_by == "Số sao cao nhất":
        return sorted(
            services,
            key=lambda item: (item["averageRating"], item["reviewCount"]),
            reverse=True,
        )

    if sort_by == "Lượt đánh giá cao nhất":
        return sorted(services, key=lambda item: item["reviewCount"], reverse=True)

    if sort_by == "Tên dịch vụ A-Z":
        return sorted(services, key=lambda item: item["serviceName"].lower())

    return sorted(services, key=lambda item: item["usageCount"], reverse=True)


def build_summary(services: list[dict]):
    total_services = len(services)
    used_services = len([item for item in services if item["usageCount"] > 0])
    unused_services = total_services - used_services

    total_usage = sum(item["usageCount"] for item in services)
    total_customers = sum(item["customerCount"] for item in services)
    total_duration = sum(item["totalDuration"] for item in services)
    total_revenue = sum(item["revenue"] for item in services)

    total_reviews = sum(item["reviewCount"] for item in services)

    rated_services = [
        item for item in services if item["reviewCount"] > 0
    ]

    average_rating = (
        round(
            sum(item["averageRating"] * item["reviewCount"] for item in rated_services)
            / total_reviews,
            1,
        )
        if total_reviews > 0
        else 0
    )

    return {
        "totalServices": total_services,
        "usedServices": used_services,
        "unusedServices": unused_services,
        "totalUsage": total_usage,
        "totalCustomers": total_customers,
        "totalDuration": total_duration,
        "totalRevenue": total_revenue,
        "totalReviews": total_reviews,
        "averageRating": average_rating,
    }


def build_chart_data(services: list[dict]):
    return [
        {
            "name": item["serviceName"],
            "usage": item["usageCount"],
        }
        for item in services
        if item["usageCount"] > 0
    ][:6]


def build_admin_service_usage_report(
    db: Session,
    from_date: str | None = None,
    to_date: str | None = None,
    keyword: str | None = None,
    category: str | None = "Tất cả",
    usage_status: str | None = "Tất cả",
    service_status: str | None = "Tất cả",
    sort_by: str | None = "Lượt sử dụng cao nhất",
):
    allowed_sort_options = [
        "Lượt sử dụng cao nhất",
        "Doanh thu cao nhất",
        "Số khách cao nhất",
        "Thời lượng cao nhất",
        "Số sao cao nhất",
        "Lượt đánh giá cao nhất",
        "Tên dịch vụ A-Z",
    ]

    start_date, end_date, start, end = get_report_range(from_date, to_date)

    keyword_text = (keyword or "").strip()
    category_filter = normalize_filter(category)
    usage_status_filter = normalize_filter(usage_status)
    service_status_filter = normalize_filter(service_status)
    sort_value = sort_by if sort_by in allowed_sort_options else allowed_sort_options[0]

    services = build_service_rows(db, start, end)

    filtered_services = apply_filters(
        services=services,
        keyword=keyword_text,
        category_filter=category_filter,
        usage_status_filter=usage_status_filter,
        service_status_filter=service_status_filter,
    )

    sorted_services = sort_services(filtered_services, sort_value)

    return {
        "fromDate": format_date_iso(start_date),
        "toDate": format_date_iso(end_date),
        "keyword": keyword_text,
        "category": category_filter,
        "usageStatus": usage_status_filter,
        "serviceStatus": service_status_filter,
        "sortBy": sort_value,
        "categoryOptions": get_category_options(db),
        "summary": build_summary(sorted_services),
        "chartData": build_chart_data(sorted_services),
        "services": sorted_services,
    }
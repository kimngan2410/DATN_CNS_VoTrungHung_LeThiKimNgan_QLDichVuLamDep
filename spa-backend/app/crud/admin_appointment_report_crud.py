from datetime import date, datetime, time, timedelta

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan


COMPLETED_STATUS = "Đã hoàn thành"
CANCELLED_STATUS = "Đã huỷ"
NO_SHOW_STATUS = "Không đến"


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


def format_datetime_iso(value: datetime | None):
    if not value:
        return ""

    return value.isoformat()


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


def get_customer_name(customer: KhachHang | None, account: TaiKhoan | None):
    if customer and customer.hoTen:
        return customer.hoTen

    if account and account.email:
        return account.email

    return "Khách hàng"


def get_customer_phone(customer: KhachHang | None):
    if customer and customer.sdt:
        return customer.sdt

    return ""


def get_appointment_services(db: Session, appointment_id: int):
    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(ChiTietLichHen.idLichHen == appointment_id)
        .order_by(ChiTietLichHen.idChiTietLH.asc())
        .all()
    )

    return [
        {
            "serviceCode": service.maDV,
            "serviceName": service.tenDV,
            "quantity": int(detail.soLuong or 1),
            "price": float(detail.donGia or 0),
            "duration": int(detail.thoiLuongPhut or 0),
        }
        for detail, service in rows
    ]


def build_appointment_row(
    db: Session,
    appointment: LichHen,
    customer: KhachHang | None,
    account: TaiKhoan | None,
):
    services = get_appointment_services(db, int(appointment.idLichHen))

    return {
        "id": int(appointment.idLichHen),
        "maLH": appointment.maLH,
        "customer": get_customer_name(customer, account),
        "phone": get_customer_phone(customer),
        "services": [item["serviceName"] for item in services],
        "serviceDetails": services,
        "thoiGianBatDau": format_datetime_iso(appointment.thoiGianBatDau),
        "thoiGianKetThuc": format_datetime_iso(appointment.thoiGianKetThuc),
        "trangThai": appointment.trangThai,
        "lyDoHuy": appointment.lyDoHuy or "",
        "ghiChu": appointment.ghiChu or "",
        "nguonTao": appointment.nguonTao or "",
        "ngayTao": format_datetime_iso(appointment.ngayTao),
    }


def build_summary(appointments: list[dict]):
    total_appointments = len(appointments)

    completed_count = len(
        [item for item in appointments if item["trangThai"] == COMPLETED_STATUS]
    )

    cancelled_count = len(
        [item for item in appointments if item["trangThai"] == CANCELLED_STATUS]
    )

    no_show_count = len(
        [item for item in appointments if item["trangThai"] == NO_SHOW_STATUS]
    )

    completion_rate = (
        round((completed_count / total_appointments) * 100)
        if total_appointments > 0
        else 0
    )

    return {
        "totalAppointments": total_appointments,
        "completedCount": completed_count,
        "cancelledCount": cancelled_count,
        "noShowCount": no_show_count,
        "completionRate": completion_rate,
    }


def build_admin_appointment_report(
    db: Session,
    from_date: str | None = None,
    to_date: str | None = None,
    keyword: str | None = None,
    status: str | None = "Tất cả",
):
    start_date, end_date, start, end = get_report_range(from_date, to_date)

    keyword_text = (keyword or "").strip()
    status_filter = normalize_filter(status)

    query = (
        db.query(LichHen, KhachHang, TaiKhoan)
        .join(TaiKhoan, TaiKhoan.idTaiKhoan == LichHen.idTaiKhoan)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == LichHen.idTaiKhoan)
        .filter(
            LichHen.thoiGianBatDau >= start,
            LichHen.thoiGianBatDau < end,
        )
    )

    if keyword_text:
        like_keyword = f"%{keyword_text}%"

        query = query.filter(
            or_(
                LichHen.maLH.ilike(like_keyword),
                KhachHang.hoTen.ilike(like_keyword),
                KhachHang.sdt.ilike(like_keyword),
                TaiKhoan.email.ilike(like_keyword),
            )
        )

    if status_filter != "Tất cả":
        query = query.filter(LichHen.trangThai == status_filter)

    rows = query.order_by(LichHen.thoiGianBatDau.desc()).all()

    appointments = [
        build_appointment_row(
            db=db,
            appointment=appointment,
            customer=customer,
            account=account,
        )
        for appointment, customer, account in rows
    ]

    if keyword_text:
        keyword_lower = keyword_text.lower()

        appointments = [
            item
            for item in appointments
            if keyword_lower in item["maLH"].lower()
            or keyword_lower in item["customer"].lower()
            or keyword_lower in item["phone"].lower()
            or keyword_lower in " ".join(item["services"]).lower()
        ]

    return {
        "fromDate": format_date_iso(start_date),
        "toDate": format_date_iso(end_date),
        "keyword": keyword_text,
        "status": status_filter,
        "summary": build_summary(appointments),
        "appointments": appointments,
    }
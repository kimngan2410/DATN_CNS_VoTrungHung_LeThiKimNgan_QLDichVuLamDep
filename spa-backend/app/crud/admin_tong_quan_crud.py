from collections import defaultdict
from datetime import date, datetime, time, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.dich_vu import DichVu
from app.models.hoa_don import HoaDon
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan


PAID_STATUS = "Đã thanh toán"
COMPLETED_APPOINTMENT_STATUS = "Đã hoàn thành"

SERVICE_COLORS = [
    "#d7a93f",
    "#4d4a4b",
    "#ead6a0",
    "#f4ead0",
    "#b89742",
]


def to_float(value):
    return float(value or 0)


def to_int(value):
    return int(value or 0)


def format_date_time(value: datetime | None):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y %H:%M")


def format_date(value: datetime | None):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y")


def parse_selected_date(value: str | None):
    if not value:
        return date.today()

    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return date.today()


def parse_selected_month(value: str | None):
    today = date.today()

    if not value:
        return today.year, today.month

    try:
        parsed = datetime.strptime(value, "%Y-%m")
        return parsed.year, parsed.month
    except ValueError:
        return today.year, today.month


def parse_selected_year(value: str | None):
    today = date.today()

    try:
        return int(value or today.year)
    except ValueError:
        return today.year


def parse_selected_week(value: str | None):
    today = date.today()

    if not value:
        selected_date = today
    else:
        try:
            year_text, week_text = value.split("-W")
            year = int(year_text)
            week = int(week_text)
            selected_date = date.fromisocalendar(year, week, 1)
        except Exception:
            selected_date = today

    week_start = selected_date - timedelta(days=selected_date.weekday())
    week_end = week_start + timedelta(days=7)

    return week_start, week_end


def get_period_range(period: str, value: str | None = None):
    if period == "date":
        selected_date = parse_selected_date(value)

        start = datetime.combine(selected_date, time.min)
        end = start + timedelta(days=1)

        previous_start = start - timedelta(days=1)
        previous_end = start

        return {
            "start": start,
            "end": end,
            "previous_start": previous_start,
            "previous_end": previous_end,
            "label": "Hôm nay" if selected_date == date.today() else "Ngày đã chọn",
            "compareText": "so với ngày trước",
            "startDate": selected_date.strftime("%Y-%m-%d"),
            "endDate": selected_date.strftime("%Y-%m-%d"),
        }

    if period == "week":
        week_start, week_end = parse_selected_week(value)

        start = datetime.combine(week_start, time.min)
        end = datetime.combine(week_end, time.min)

        previous_start = start - timedelta(days=7)
        previous_end = start

        return {
            "start": start,
            "end": end,
            "previous_start": previous_start,
            "previous_end": previous_end,
            "label": "Tuần này",
            "compareText": "so với tuần trước",
            "startDate": week_start.strftime("%Y-%m-%d"),
            "endDate": (week_end - timedelta(days=1)).strftime("%Y-%m-%d"),
        }

    if period == "month":
        year, month = parse_selected_month(value)

        start = datetime(year, month, 1)

        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        if month == 1:
            previous_start = datetime(year - 1, 12, 1)
        else:
            previous_start = datetime(year, month - 1, 1)

        previous_end = start

        return {
            "start": start,
            "end": end,
            "previous_start": previous_start,
            "previous_end": previous_end,
            "label": "Tháng này",
            "compareText": "so với tháng trước",
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": (end - timedelta(days=1)).strftime("%Y-%m-%d"),
        }

    year = parse_selected_year(value)

    start = datetime(year, 1, 1)
    end = datetime(year + 1, 1, 1)

    previous_start = datetime(year - 1, 1, 1)
    previous_end = start

    return {
        "start": start,
        "end": end,
        "previous_start": previous_start,
        "previous_end": previous_end,
        "label": "Năm nay",
        "compareText": "so với năm trước",
        "startDate": start.strftime("%Y-%m-%d"),
        "endDate": (end - timedelta(days=1)).strftime("%Y-%m-%d"),
    }


def calculate_growth(current_value: float, previous_value: float):
    if previous_value <= 0:
        if current_value > 0:
            return "+100%"
        return "0%"

    percent = ((current_value - previous_value) / previous_value) * 100
    sign = "+" if percent >= 0 else ""

    return f"{sign}{percent:.1f}%"


def paid_invoice_filter(query, start: datetime, end: datetime):
    return query.filter(
        HoaDon.trangThaiThanhToan == PAID_STATUS,
        HoaDon.ngayTao >= start,
        HoaDon.ngayTao < end,
    )


def appointment_filter(query, start: datetime, end: datetime):
    return query.filter(
        LichHen.thoiGianBatDau >= start,
        LichHen.thoiGianBatDau < end,
    )


def customer_filter(query, start: datetime, end: datetime):
    return query.filter(
        KhachHang.ngayTao >= start,
        KhachHang.ngayTao < end,
    )


def get_revenue(db: Session, start: datetime, end: datetime):
    value = paid_invoice_filter(
        db.query(func.coalesce(func.sum(HoaDon.thanhTien), 0)),
        start,
        end,
    ).scalar()

    return to_float(value)


def get_paid_invoice_count(db: Session, start: datetime, end: datetime):
    return to_int(
        paid_invoice_filter(
            db.query(func.count(HoaDon.idHoaDon)),
            start,
            end,
        ).scalar()
    )


def get_appointment_count(db: Session, start: datetime, end: datetime):
    return to_int(
        appointment_filter(
            db.query(func.count(LichHen.idLichHen)),
            start,
            end,
        ).scalar()
    )


def get_completed_appointment_count(db: Session, start: datetime, end: datetime):
    return to_int(
        appointment_filter(
            db.query(func.count(LichHen.idLichHen)),
            start,
            end,
        )
        .filter(LichHen.trangThai == COMPLETED_APPOINTMENT_STATUS)
        .scalar()
    )


def get_registered_customer_count(db: Session, start: datetime, end: datetime):
    return to_int(
        customer_filter(
            db.query(func.count(KhachHang.idKhachHang)),
            start,
            end,
        ).scalar()
    )


def get_used_service_count(db: Session, start: datetime, end: datetime):
    value = (
        db.query(func.coalesce(func.sum(ChiTietHoaDon.soLuong), 0))
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .scalar()
    )

    return to_int(value)


def get_revenue_trend(db: Session, period: str, start: datetime, end: datetime):
    invoices = paid_invoice_filter(db.query(HoaDon), start, end).all()
    buckets = defaultdict(float)

    if period == "date":
        for hour in range(8, 22, 2):
            buckets[f"{hour}h"] = 0

        for invoice in invoices:
            hour = invoice.ngayTao.hour if invoice.ngayTao else 0
            bucket_hour = max(8, min(20, hour if hour % 2 == 0 else hour - 1))
            buckets[f"{bucket_hour}h"] += to_float(invoice.thanhTien)

        return [{"label": label, "revenue": amount} for label, amount in buckets.items()]

    if period == "week":
        for index in range(7):
            day = start + timedelta(days=index)
            buckets[day.strftime("%d/%m")] = 0

        for invoice in invoices:
            if invoice.ngayTao:
                buckets[invoice.ngayTao.strftime("%d/%m")] += to_float(
                    invoice.thanhTien
                )

        return [{"label": label, "revenue": amount} for label, amount in buckets.items()]

    month_labels = []

    current = datetime(start.year, start.month, 1)

    while current < end:
        month_labels.append((current.year, current.month, f"T{current.month}"))

        if current.month == 12:
            current = datetime(current.year + 1, 1, 1)
        else:
            current = datetime(current.year, current.month + 1, 1)

    for _, _, label in month_labels:
        buckets[label] = 0

    for invoice in invoices:
        if invoice.ngayTao:
            buckets[f"T{invoice.ngayTao.month}"] += to_float(invoice.thanhTien)

    return [{"label": label, "revenue": amount} for _, _, label in month_labels for amount in [buckets[label]]]


def get_customer_growth(db: Session, period: str, start: datetime, end: datetime):
    customers = customer_filter(db.query(KhachHang), start, end).all()
    buckets = defaultdict(int)

    if period == "date":
        for hour in range(8, 22, 2):
            buckets[f"{hour}h"] = 0

        for customer in customers:
            hour = customer.ngayTao.hour if customer.ngayTao else 0
            bucket_hour = max(8, min(20, hour if hour % 2 == 0 else hour - 1))
            buckets[f"{bucket_hour}h"] += 1

        return [{"label": label, "value": value} for label, value in buckets.items()]

    if period == "week":
        for index in range(7):
            day = start + timedelta(days=index)
            buckets[day.strftime("%d/%m")] = 0

        for customer in customers:
            if customer.ngayTao:
                buckets[customer.ngayTao.strftime("%d/%m")] += 1

        return [{"label": label, "value": value} for label, value in buckets.items()]

    month_labels = []
    current = datetime(start.year, start.month, 1)

    while current < end:
        month_labels.append((current.year, current.month, f"T{current.month}"))

        if current.month == 12:
            current = datetime(current.year + 1, 1, 1)
        else:
            current = datetime(current.year, current.month + 1, 1)

    for _, _, label in month_labels:
        buckets[label] = 0

    for customer in customers:
        if customer.ngayTao:
            buckets[f"T{customer.ngayTao.month}"] += 1

    return [{"label": label, "value": buckets[label]} for _, _, label in month_labels]


def get_top_services(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(
            DichVu.tenDV.label("name"),
            func.coalesce(func.sum(ChiTietHoaDon.soLuong), 0).label("value"),
            func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).label("revenue"),
        )
        .join(ChiTietHoaDon, ChiTietHoaDon.idDichVu == DichVu.idDichVu)
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .group_by(DichVu.idDichVu, DichVu.tenDV)
        .order_by(func.sum(ChiTietHoaDon.soLuong).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "name": row.name,
            "value": to_int(row.value),
            "revenue": to_float(row.revenue),
            "color": SERVICE_COLORS[index % len(SERVICE_COLORS)],
        }
        for index, row in enumerate(rows)
    ]


def get_payment_methods(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(
            HoaDon.phuongThucThanhToan.label("name"),
            func.count(HoaDon.idHoaDon).label("value"),
            func.coalesce(func.sum(HoaDon.thanhTien), 0).label("amount"),
        )
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .group_by(HoaDon.phuongThucThanhToan)
        .order_by(func.sum(HoaDon.thanhTien).desc())
        .all()
    )

    return [
        {
            "name": row.name or "Không xác định",
            "value": to_int(row.value),
            "amount": to_float(row.amount),
        }
        for row in rows
    ]


def get_recent_invoices(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(HoaDon, KhachHang)
        .join(TaiKhoan, TaiKhoan.idTaiKhoan == HoaDon.idTaiKhoan)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == TaiKhoan.idTaiKhoan)
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .order_by(HoaDon.ngayTao.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "id": hoa_don.maHD,
            "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
            "method": hoa_don.phuongThucThanhToan,
            "amount": to_float(hoa_don.thanhTien),
            "paidAt": format_date_time(hoa_don.ngayTao),
            "status": hoa_don.trangThaiThanhToan,
        }
        for hoa_don, khach_hang in rows
    ]


def get_recent_activities(db: Session):
    activities = []

    invoices = (
        db.query(HoaDon)
        .filter(HoaDon.trangThaiThanhToan == PAID_STATUS)
        .order_by(HoaDon.ngayTao.desc())
        .limit(5)
        .all()
    )

    for invoice in invoices:
        activities.append(
            {
                "title": "Thanh toán hoá đơn",
                "desc": f"Hoá đơn {invoice.maHD} đã được thanh toán thành công",
                "time": format_date_time(invoice.ngayTao),
                "sortTime": invoice.ngayTao,
            }
        )

    appointments = (
        db.query(LichHen)
        .order_by(LichHen.ngayTao.desc())
        .limit(5)
        .all()
    )

    for appointment in appointments:
        activities.append(
            {
                "title": "Lịch hẹn mới",
                "desc": f"Lịch hẹn {appointment.maLH} đang ở trạng thái {appointment.trangThai}",
                "time": format_date_time(appointment.ngayTao),
                "sortTime": appointment.ngayTao,
            }
        )

    customers = (
        db.query(KhachHang)
        .order_by(KhachHang.ngayTao.desc())
        .limit(5)
        .all()
    )

    for customer in customers:
        activities.append(
            {
                "title": "Khách hàng mới",
                "desc": f"Khách hàng {customer.hoTen} đã được tạo trong hệ thống",
                "time": format_date_time(customer.ngayTao),
                "sortTime": customer.ngayTao,
            }
        )

    activities.sort(
        key=lambda item: item["sortTime"] or datetime.min,
        reverse=True,
    )

    return [
        {
            "title": item["title"],
            "desc": item["desc"],
            "time": item["time"],
        }
        for item in activities[:6]
    ]


def build_admin_overview(db: Session, period: str, value: str | None = None):
    if period not in ["date", "week", "month", "year"]:
        period = "date"

    range_data = get_period_range(period, value)

    start = range_data["start"]
    end = range_data["end"]
    previous_start = range_data["previous_start"]
    previous_end = range_data["previous_end"]

    revenue = get_revenue(db, start, end)
    previous_revenue = get_revenue(db, previous_start, previous_end)

    appointments = get_appointment_count(db, start, end)
    previous_appointments = get_appointment_count(db, previous_start, previous_end)

    registered_customers = get_registered_customer_count(db, start, end)
    previous_registered_customers = get_registered_customer_count(
        db,
        previous_start,
        previous_end,
    )

    used_services = get_used_service_count(db, start, end)
    previous_used_services = get_used_service_count(db, previous_start, previous_end)

    paid_invoices = get_paid_invoice_count(db, start, end)
    previous_paid_invoices = get_paid_invoice_count(db, previous_start, previous_end)

    completed_appointments = get_completed_appointment_count(db, start, end)
    completion_rate = (
        round((completed_appointments / appointments) * 100)
        if appointments > 0
        else 0
    )

    return {
        "period": period,
        "label": range_data["label"],
        "compareText": range_data["compareText"],
        "startDate": range_data["startDate"],
        "endDate": range_data["endDate"],
        "summary": {
            "revenue": revenue,
            "appointments": appointments,
            "registeredCustomers": registered_customers,
            "usedServices": used_services,
            "paidInvoices": paid_invoices,
            "completionRate": completion_rate,
        },
        "growth": {
            "revenue": calculate_growth(revenue, previous_revenue),
            "appointments": calculate_growth(appointments, previous_appointments),
            "registeredCustomers": calculate_growth(
                registered_customers,
                previous_registered_customers,
            ),
            "usedServices": calculate_growth(used_services, previous_used_services),
            "paidInvoices": calculate_growth(paid_invoices, previous_paid_invoices),
        },
        "revenueTrend": get_revenue_trend(db, period, start, end),
        "customerGrowth": get_customer_growth(db, period, start, end),
        "topServices": get_top_services(db, start, end),
        "paymentMethods": get_payment_methods(db, start, end),
        "recentInvoices": get_recent_invoices(db, start, end),
        "recentActivities": get_recent_activities(db),
    }
from datetime import date, datetime, time, timedelta

from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.danh_muc_dich_vu import DanhMucDichVu
from app.models.dich_vu import DichVu
from app.models.hoa_don import HoaDon


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


def format_date_vn(value: date | datetime | None):
    if not value:
        return ""

    return value.strftime("%d/%m/%Y")


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


def get_compare_range(start_date: date, end_date: date, compare: str):
    total_days = (end_date - start_date).days + 1

    if compare == "none":
        return None, None

    if compare == "previous_month":
        first_day_current_month = start_date.replace(day=1)
        previous_month_end = first_day_current_month - timedelta(days=1)
        previous_month_start = previous_month_end.replace(day=1)

        return (
            datetime.combine(previous_month_start, time.min),
            datetime.combine(previous_month_end + timedelta(days=1), time.min),
        )

    if compare == "previous_year":
        try:
            previous_start_date = start_date.replace(year=start_date.year - 1)
            previous_end_date = end_date.replace(year=end_date.year - 1)
        except ValueError:
            previous_start_date = start_date - timedelta(days=365)
            previous_end_date = end_date - timedelta(days=365)

        return (
            datetime.combine(previous_start_date, time.min),
            datetime.combine(previous_end_date + timedelta(days=1), time.min),
        )

    previous_end_date = start_date - timedelta(days=1)
    previous_start_date = previous_end_date - timedelta(days=total_days - 1)

    return (
        datetime.combine(previous_start_date, time.min),
        datetime.combine(previous_end_date + timedelta(days=1), time.min),
    )


def calculate_growth(current_value: float, previous_value: float):
    current_value = float(current_value or 0)
    previous_value = float(previous_value or 0)

    if previous_value <= 0:
        if current_value > 0:
            return "Mới"
        return "0%"

    percent = ((current_value - previous_value) / previous_value) * 100
    sign = "+" if percent >= 0 else ""

    return f"{sign}{percent:.1f}%"


def get_paid_invoice_query(db: Session, start: datetime, end: datetime):
    return db.query(HoaDon).filter(
        HoaDon.trangThaiThanhToan == PAID_STATUS,
        HoaDon.ngayTao >= start,
        HoaDon.ngayTao < end,
    )


def get_revenue_summary(db: Session, start: datetime, end: datetime):
    row = (
        db.query(
            func.coalesce(func.sum(HoaDon.tongTien), 0).label("serviceRevenue"),
            func.coalesce(func.sum(HoaDon.giamGia), 0).label("discount"),
            func.coalesce(func.sum(HoaDon.thanhTien), 0).label("netRevenue"),
            func.count(HoaDon.idHoaDon).label("invoices"),
            func.count(distinct(HoaDon.idTaiKhoan)).label("customers"),
        )
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .first()
    )

    invoices = to_int(row.invoices)
    net_revenue = to_float(row.netRevenue)

    return {
        "totalRevenue": net_revenue,
        "totalInvoices": invoices,
        "totalCustomers": to_int(row.customers),
        "totalDiscount": to_float(row.discount),
        "totalServiceRevenue": to_float(row.serviceRevenue),
        "averageInvoice": round(net_revenue / invoices) if invoices > 0 else 0,
    }


def get_category_revenue(db: Session, start: datetime, end: datetime):
    rows = (
        db.query(
            DanhMucDichVu.tenDM.label("name"),
            func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).label("revenue"),
        )
        .join(DichVu, DichVu.idDanhMuc == DanhMucDichVu.idDanhMuc)
        .join(ChiTietHoaDon, ChiTietHoaDon.idDichVu == DichVu.idDichVu)
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            HoaDon.trangThaiThanhToan == PAID_STATUS,
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
        .group_by(DanhMucDichVu.idDanhMuc, DanhMucDichVu.tenDM)
        .order_by(func.sum(ChiTietHoaDon.thanhTien).desc())
        .all()
    )

    return [
        {
            "name": row.name or "Khác",
            "revenue": to_float(row.revenue),
        }
        for row in rows
    ]


def get_category_breakdown_for_day(db: Session, selected_date: date):
    start = datetime.combine(selected_date, time.min)
    end = start + timedelta(days=1)

    return get_category_revenue(db, start, end)


def get_daily_rows(
    db: Session,
    start_date: date,
    end_date: date,
    start: datetime,
    end: datetime,
):
    invoices = get_paid_invoice_query(db, start, end).all()

    daily_map = {}
    total_days = (end_date - start_date).days + 1

    for index in range(total_days):
        current_date = start_date + timedelta(days=index)

        daily_map[current_date] = {
            "id": index + 1,
            "date": format_date_vn(current_date),
            "isoDate": format_date_iso(current_date),
            "invoices": 0,
            "customersSet": set(),
            "customers": 0,
            "serviceRevenue": 0,
            "discount": 0,
            "netRevenue": 0,
            "change": "0%",
            "categoryBreakdown": [],
        }

    for invoice in invoices:
        if not invoice.ngayTao:
            continue

        invoice_date = invoice.ngayTao.date()

        if invoice_date not in daily_map:
            continue

        item = daily_map[invoice_date]

        item["invoices"] += 1
        item["customersSet"].add(int(invoice.idTaiKhoan))
        item["serviceRevenue"] += to_float(invoice.tongTien)
        item["discount"] += to_float(invoice.giamGia)
        item["netRevenue"] += to_float(invoice.thanhTien)

    previous_revenue = 0
    rows = []

    for current_date in sorted(daily_map.keys()):
        item = daily_map[current_date]

        item["customers"] = len(item["customersSet"])
        item.pop("customersSet", None)

        current_revenue = item["netRevenue"]

        if current_revenue <= 0:
            item["change"] = "Không phát sinh"
        elif previous_revenue <= 0:
            item["change"] = "Phát sinh mới"
        else:
            item["change"] = calculate_growth(current_revenue, previous_revenue)

        previous_revenue = current_revenue

        item["categoryBreakdown"] = get_category_breakdown_for_day(db, current_date)

        rows.append(item)

    return rows


def get_chart_data(rows: list[dict]):
    return [
        {
            "date": row["date"][:5],
            "revenue": row["netRevenue"],
        }
        for row in rows
    ]


def build_admin_revenue_report(
    db: Session,
    from_date: str | None,
    to_date: str | None,
    compare: str = "previous_period",
):
    if compare not in ["none", "previous_period", "previous_month", "previous_year"]:
        compare = "previous_period"

    start_date, end_date, start, end = get_report_range(from_date, to_date)

    summary = get_revenue_summary(db, start, end)

    previous_start, previous_end = get_compare_range(start_date, end_date, compare)

    previous_summary = {
        "totalRevenue": 0,
        "totalInvoices": 0,
        "totalCustomers": 0,
        "totalDiscount": 0,
        "totalServiceRevenue": 0,
        "averageInvoice": 0,
    }

    if previous_start and previous_end:
        previous_summary = get_revenue_summary(db, previous_start, previous_end)

    summary["growth"] = {
        "totalRevenue": calculate_growth(
            summary["totalRevenue"],
            previous_summary["totalRevenue"],
        ),
        "totalInvoices": calculate_growth(
            summary["totalInvoices"],
            previous_summary["totalInvoices"],
        ),
        "totalCustomers": calculate_growth(
            summary["totalCustomers"],
            previous_summary["totalCustomers"],
        ),
        "averageInvoice": calculate_growth(
            summary["averageInvoice"],
            previous_summary["averageInvoice"],
        ),
    }

    rows = get_daily_rows(db, start_date, end_date, start, end)

    return {
        "fromDate": format_date_iso(start_date),
        "toDate": format_date_iso(end_date),
        "compare": compare,
        "summary": summary,
        "chartData": get_chart_data(rows),
        "categoryRevenue": get_category_revenue(db, start, end),
        "rows": rows,
    }
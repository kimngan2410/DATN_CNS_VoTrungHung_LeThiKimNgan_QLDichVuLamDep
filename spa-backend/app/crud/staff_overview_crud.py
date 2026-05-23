from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.lich_hen import LichHen
from app.models.khach_hang import KhachHang
from app.models.hoa_don import HoaDon
from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu


PAID_STATUS = "Đã thanh toán"
CANCELLED_INVOICE_STATUS = "Đã huỷ"

APPOINTMENT_STATUSES = [
    {
        "name": "Chờ xác nhận",
        "color": "#d7a93f",
    },
    {
        "name": "Đã xác nhận",
        "color": "#ead6a0",
    },
    {
        "name": "Đã check-in",
        "color": "#8b7f73",
    },
    {
        "name": "Đang thực hiện",
        "color": "#6a6667",
    },
    {
        "name": "Đã hoàn thành",
        "color": "#4d4a4b",
    },
    {
        "name": "Đã huỷ",
        "color": "#ef6f6c",
    },
    {
        "name": "Không đến",
        "color": "#b45309",
    },
]


def to_float(value):
    return float(value or 0)


def weekday_label(date_value):
    weekday = date_value.weekday()

    labels = {
        0: "T2",
        1: "T3",
        2: "T4",
        3: "T5",
        4: "T6",
        5: "T7",
        6: "CN",
    }

    return labels.get(weekday, "")


def date_range_last_7_days():
    today = datetime.now().date()
    start_date = today - timedelta(days=6)

    return [start_date + timedelta(days=index) for index in range(7)]


def get_today_appointment_count(db: Session, today):
    return int(
        db.query(func.count(LichHen.idLichHen))
        .filter(func.date(LichHen.thoiGianBatDau) == today)
        .scalar()
        or 0
    )


def get_today_status_count(db: Session, today, status_value: str):
    return int(
        db.query(func.count(LichHen.idLichHen))
        .filter(
            func.date(LichHen.thoiGianBatDau) == today,
            LichHen.trangThai == status_value,
        )
        .scalar()
        or 0
    )


def get_today_revenue(db: Session, today):
    return to_float(
        db.query(func.coalesce(func.sum(HoaDon.thanhTien), 0))
        .filter(
            func.date(HoaDon.ngayTao) == today,
            HoaDon.trangThaiThanhToan != CANCELLED_INVOICE_STATUS,
        )
        .scalar()
    )


def get_revenue_last_7_days(db: Session):
    dates = date_range_last_7_days()
    start_date = dates[0]
    end_date = dates[-1]

    rows = (
        db.query(
            func.date(HoaDon.ngayTao).label("ngay"),
            func.coalesce(func.sum(HoaDon.thanhTien), 0).label("doanh_thu"),
        )
        .filter(
            func.date(HoaDon.ngayTao).between(start_date, end_date),
            HoaDon.trangThaiThanhToan != CANCELLED_INVOICE_STATUS,
        )
        .group_by(func.date(HoaDon.ngayTao))
        .all()
    )

    revenue_map = {
        str(row.ngay): to_float(row.doanh_thu)
        for row in rows
    }

    return [
        {
            "day": weekday_label(date_value),
            "date": date_value.strftime("%Y-%m-%d"),
            "revenue": revenue_map.get(str(date_value), 0),
        }
        for date_value in dates
    ]


def get_appointment_count_last_7_days(db: Session):
    dates = date_range_last_7_days()
    start_date = dates[0]
    end_date = dates[-1]

    rows = (
        db.query(
            func.date(LichHen.thoiGianBatDau).label("ngay"),
            func.count(LichHen.idLichHen).label("so_luong"),
        )
        .filter(func.date(LichHen.thoiGianBatDau).between(start_date, end_date))
        .group_by(func.date(LichHen.thoiGianBatDau))
        .all()
    )

    count_map = {
        str(row.ngay): int(row.so_luong or 0)
        for row in rows
    }

    return [
        {
            "day": weekday_label(date_value),
            "date": date_value.strftime("%Y-%m-%d"),
            "count": count_map.get(str(date_value), 0),
        }
        for date_value in dates
    ]


def get_status_distribution_last_7_days(db: Session):
    dates = date_range_last_7_days()
    start_date = dates[0]
    end_date = dates[-1]

    rows = (
        db.query(
            LichHen.trangThai.label("trang_thai"),
            func.count(LichHen.idLichHen).label("so_luong"),
        )
        .filter(func.date(LichHen.thoiGianBatDau).between(start_date, end_date))
        .group_by(LichHen.trangThai)
        .all()
    )

    count_map = {
        row.trang_thai: int(row.so_luong or 0)
        for row in rows
    }

    return [
        {
            "name": item["name"],
            "value": count_map.get(item["name"], 0),
            "color": item["color"],
        }
        for item in APPOINTMENT_STATUSES
    ]


def get_popular_services_last_7_days(db: Session, limit: int = 5):
    dates = date_range_last_7_days()
    start_date = dates[0]
    end_date = dates[-1]

    rows = (
        db.query(
            DichVu.tenDV.label("ten_dich_vu"),
            func.coalesce(func.sum(ChiTietHoaDon.soLuong), 0).label("luot_su_dung"),
            func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).label("doanh_thu"),
        )
        .join(ChiTietHoaDon, ChiTietHoaDon.idDichVu == DichVu.idDichVu)
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            func.date(HoaDon.ngayTao).between(start_date, end_date),
            HoaDon.trangThaiThanhToan != CANCELLED_INVOICE_STATUS,
        )
        .group_by(DichVu.idDichVu, DichVu.tenDV)
        .order_by(func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": row.ten_dich_vu,
            "usage": int(row.luot_su_dung or 0),
            "revenue": to_float(row.doanh_thu),
        }
        for row in rows
    ]


def get_appointment_services(db: Session, appointment_id: int):
    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(ChiTietLichHen.idLichHen == appointment_id)
        .all()
    )

    return [
        {
            "name": dich_vu.tenDV,
            "duration": int(chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0),
            "price": to_float(chi_tiet.donGia or dich_vu.gia or 0),
            "quantity": int(chi_tiet.soLuong or 1),
        }
        for chi_tiet, dich_vu in rows
    ]


def get_recent_appointments(db: Session, limit: int = 5):
    rows = (
        db.query(LichHen, KhachHang)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == LichHen.idTaiKhoan)
        .order_by(LichHen.thoiGianBatDau.desc(), LichHen.idLichHen.desc())
        .limit(limit)
        .all()
    )

    appointments = []

    for lich_hen, khach_hang in rows:
        appointments.append(
            {
                "id": lich_hen.maLH,
                "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
                "phone": khach_hang.sdt if khach_hang else "",
                "services": get_appointment_services(
                    db=db,
                    appointment_id=int(lich_hen.idLichHen),
                ),
                "time": lich_hen.thoiGianBatDau.strftime("%H:%M"),
                "date": lich_hen.thoiGianBatDau.strftime("%Y-%m-%d"),
                "status": lich_hen.trangThai,
            }
        )

    return appointments


def get_staff_overview(db: Session, period: str = "today"):
    today = datetime.now().date()

    total_today = get_today_appointment_count(db, today)
    checked_in_today = get_today_status_count(db, today, "Đã check-in")
    doing_today = get_today_status_count(db, today, "Đang thực hiện")
    today_revenue = get_today_revenue(db, today)

    return {
        "stats": {
            "totalAppointmentsToday": total_today,
            "checkedInToday": checked_in_today,
            "doingToday": doing_today,
            "todayRevenue": today_revenue,
        },
        "revenueData": get_revenue_last_7_days(db),
        "appointmentData": get_appointment_count_last_7_days(db),
        "appointmentStatusData": get_status_distribution_last_7_days(db),
        "popularServicesData": get_popular_services_last_7_days(db),
        "recentAppointments": get_recent_appointments(db),
    }

CANCELLED_INVOICE_STATUS = "Đã huỷ"

APPOINTMENT_STATUSES = [
    {"name": "Chờ xác nhận", "color": "#d7a93f"},
    {"name": "Đã xác nhận", "color": "#ead6a0"},
    {"name": "Đã check-in", "color": "#8b7f73"},
    {"name": "Đang thực hiện", "color": "#6a6667"},
    {"name": "Đã hoàn thành", "color": "#4d4a4b"},
    {"name": "Đã huỷ", "color": "#ef6f6c"},
    {"name": "Không đến", "color": "#b45309"},
]


def to_float(value):
    return float(value or 0)


def get_period_range(period: str):
    now = datetime.now()
    today = now.date()

    if period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=7)

        return {
            "key": "week",
            "label": "Tuần này",
            "start": datetime.combine(start_date, datetime.min.time()),
            "end": datetime.combine(end_date, datetime.min.time()),
            "group": "day",
        }

    if period == "month":
        start_date = today.replace(day=1)

        if start_date.month == 12:
            next_month = start_date.replace(year=start_date.year + 1, month=1)
        else:
            next_month = start_date.replace(month=start_date.month + 1)

        return {
            "key": "month",
            "label": "Tháng này",
            "start": datetime.combine(start_date, datetime.min.time()),
            "end": datetime.combine(next_month, datetime.min.time()),
            "group": "week",
        }

    if period == "quarter":
        quarter_start_month = ((today.month - 1) // 3) * 3 + 1
        start_date = today.replace(month=quarter_start_month, day=1)

        if quarter_start_month == 10:
            next_quarter = start_date.replace(year=start_date.year + 1, month=1)
        else:
            next_quarter = start_date.replace(month=quarter_start_month + 3)

        return {
            "key": "quarter",
            "label": "Quý này",
            "start": datetime.combine(start_date, datetime.min.time()),
            "end": datetime.combine(next_quarter, datetime.min.time()),
            "group": "month",
        }

    if period == "year":
        start_date = today.replace(month=1, day=1)
        next_year = start_date.replace(year=start_date.year + 1)

        return {
            "key": "year",
            "label": "Năm này",
            "start": datetime.combine(start_date, datetime.min.time()),
            "end": datetime.combine(next_year, datetime.min.time()),
            "group": "month",
        }

    tomorrow = today + timedelta(days=1)

    return {
        "key": "today",
        "label": "Hôm nay",
        "start": datetime.combine(today, datetime.min.time()),
        "end": datetime.combine(tomorrow, datetime.min.time()),
        "group": "hour",
    }


def get_bucket_label(value: datetime, group: str):
    if group == "hour":
        return value.strftime("%Hh")

    if group == "day":
        labels = {
            0: "T2",
            1: "T3",
            2: "T4",
            3: "T5",
            4: "T6",
            5: "T7",
            6: "CN",
        }
        return labels.get(value.weekday(), "")

    if group == "week":
        week_index = ((value.day - 1) // 7) + 1
        return f"Tuần {week_index}"

    return f"Tháng {value.month}"


def build_buckets(period_info):
    start = period_info["start"]
    end = period_info["end"]
    group = period_info["group"]

    buckets = []

    if group == "hour":
        current = start.replace(hour=9)
        last = start.replace(hour=21)

        while current <= last:
            buckets.append(
                {
                    "label": get_bucket_label(current, group),
                    "start": current,
                    "end": current + timedelta(hours=1),
                }
            )
            current += timedelta(hours=1)

        return buckets

    if group == "day":
        current = start

        while current < end:
            buckets.append(
                {
                    "label": get_bucket_label(current, group),
                    "start": current,
                    "end": current + timedelta(days=1),
                }
            )
            current += timedelta(days=1)

        return buckets

    if group == "week":
        current = start

        while current < end:
            next_current = min(current + timedelta(days=7), end)

            buckets.append(
                {
                    "label": get_bucket_label(current, group),
                    "start": current,
                    "end": next_current,
                }
            )
            current = next_current

        return buckets

    current = start

    while current < end:
        if current.month == 12:
            next_current = current.replace(year=current.year + 1, month=1)
        else:
            next_current = current.replace(month=current.month + 1)

        buckets.append(
            {
                "label": get_bucket_label(current, group),
                "start": current,
                "end": min(next_current, end),
            }
        )

        current = next_current

    return buckets


def get_appointment_count(db: Session, start, end, status_value: str | None = None):
    query = db.query(func.count(LichHen.idLichHen)).filter(
        LichHen.thoiGianBatDau >= start,
        LichHen.thoiGianBatDau < end,
    )

    if status_value:
        query = query.filter(LichHen.trangThai == status_value)

    return int(query.scalar() or 0)


def get_revenue(db: Session, start, end):
    return to_float(
        db.query(func.coalesce(func.sum(HoaDon.thanhTien), 0))
        .filter(
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
            HoaDon.trangThaiThanhToan != CANCELLED_INVOICE_STATUS,
        )
        .scalar()
    )


def get_revenue_chart(db: Session, period_info):
    buckets = build_buckets(period_info)

    return [
        {
            "day": bucket["label"],
            "revenue": get_revenue(db, bucket["start"], bucket["end"]),
        }
        for bucket in buckets
    ]


def get_appointment_chart(db: Session, period_info):
    buckets = build_buckets(period_info)

    return [
        {
            "day": bucket["label"],
            "count": get_appointment_count(db, bucket["start"], bucket["end"]),
        }
        for bucket in buckets
    ]


def get_status_distribution(db: Session, start, end):
    rows = (
        db.query(
            LichHen.trangThai.label("trang_thai"),
            func.count(LichHen.idLichHen).label("so_luong"),
        )
        .filter(
            LichHen.thoiGianBatDau >= start,
            LichHen.thoiGianBatDau < end,
        )
        .group_by(LichHen.trangThai)
        .all()
    )

    count_map = {
        row.trang_thai: int(row.so_luong or 0)
        for row in rows
    }

    return [
        {
            "name": item["name"],
            "value": count_map.get(item["name"], 0),
            "color": item["color"],
        }
        for item in APPOINTMENT_STATUSES
    ]


def get_popular_services(db: Session, start, end, limit: int = 5):
    rows = (
        db.query(
            DichVu.tenDV.label("ten_dich_vu"),
            func.coalesce(func.sum(ChiTietHoaDon.soLuong), 0).label("luot_su_dung"),
            func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).label("doanh_thu"),
        )
        .join(ChiTietHoaDon, ChiTietHoaDon.idDichVu == DichVu.idDichVu)
        .join(HoaDon, HoaDon.idHoaDon == ChiTietHoaDon.idHoaDon)
        .filter(
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
            HoaDon.trangThaiThanhToan != CANCELLED_INVOICE_STATUS,
        )
        .group_by(DichVu.idDichVu, DichVu.tenDV)
        .order_by(func.coalesce(func.sum(ChiTietHoaDon.thanhTien), 0).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": row.ten_dich_vu,
            "usage": int(row.luot_su_dung or 0),
            "revenue": to_float(row.doanh_thu),
        }
        for row in rows
    ]


def get_appointment_services(db: Session, appointment_id: int):
    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(ChiTietLichHen.idLichHen == appointment_id)
        .all()
    )

    return [
        {
            "name": dich_vu.tenDV,
            "duration": int(chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0),
            "price": to_float(chi_tiet.donGia or dich_vu.gia or 0),
            "quantity": int(chi_tiet.soLuong or 1),
        }
        for chi_tiet, dich_vu in rows
    ]


def get_recent_appointments(db: Session, start, end, limit: int = 5):
    rows = (
        db.query(LichHen, KhachHang)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == LichHen.idTaiKhoan)
        .filter(
            LichHen.thoiGianBatDau >= start,
            LichHen.thoiGianBatDau < end,
        )
        .order_by(LichHen.thoiGianBatDau.desc(), LichHen.idLichHen.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": lich_hen.maLH,
            "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
            "phone": khach_hang.sdt if khach_hang else "",
            "services": get_appointment_services(db, int(lich_hen.idLichHen)),
            "time": lich_hen.thoiGianBatDau.strftime("%H:%M"),
            "date": lich_hen.thoiGianBatDau.strftime("%Y-%m-%d"),
            "status": lich_hen.trangThai,
        }
        for lich_hen, khach_hang in rows
    ]


def get_staff_overview(db: Session, period: str = "today"):
    period_info = get_period_range(period)
    start = period_info["start"]
    end = period_info["end"]

    return {
        "period": {
            "key": period_info["key"],
            "label": period_info["label"],
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": (end - timedelta(days=1)).strftime("%Y-%m-%d"),
        },
        "stats": {
            "totalAppointmentsToday": get_appointment_count(db, start, end),
            "checkedInToday": get_appointment_count(db, start, end, "Đã check-in"),
            "doingToday": get_appointment_count(db, start, end, "Đang thực hiện"),
            "todayRevenue": get_revenue(db, start, end),
        },
        "revenueData": get_revenue_chart(db, period_info),
        "appointmentData": get_appointment_chart(db, period_info),
        "appointmentStatusData": get_status_distribution(db, start, end),
        "popularServicesData": get_popular_services(db, start, end),
        "recentAppointments": get_recent_appointments(db, start, end),
    }
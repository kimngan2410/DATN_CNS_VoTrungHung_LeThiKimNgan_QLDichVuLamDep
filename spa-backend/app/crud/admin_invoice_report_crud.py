from datetime import date, datetime, time, timedelta

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.dich_vu import DichVu
from app.models.hoa_don import HoaDon
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan


PAID_STATUS = "Đã thanh toán"
CANCELLED_STATUS = "Đã huỷ"


def to_float(value):
    return float(value or 0)


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


def get_default_range(from_date: str | None, to_date: str | None):
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


def get_invoice_services(db: Session, invoice_id: int):
    rows = (
        db.query(ChiTietHoaDon, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietHoaDon.idDichVu)
        .filter(ChiTietHoaDon.idHoaDon == invoice_id)
        .order_by(ChiTietHoaDon.idChiTietHD.asc())
        .all()
    )

    return [
        {
            "serviceCode": service.maDV,
            "serviceName": service.tenDV,
            "quantity": detail.soLuong,
            "price": to_float(detail.donGia),
            "total": to_float(detail.thanhTien),
        }
        for detail, service in rows
    ]


def build_invoice_row(
    db: Session,
    invoice: HoaDon,
    appointment: LichHen | None,
    customer: KhachHang | None,
    account: TaiKhoan | None,
):
    services = get_invoice_services(db, invoice.idHoaDon)

    return {
        "id": int(invoice.idHoaDon),
        "invoiceCode": invoice.maHD,
        "appointmentCode": appointment.maLH if appointment else "",
        "customer": get_customer_name(customer, account),
        "customerEmail": account.email if account else "",
        "paymentMethod": invoice.phuongThucThanhToan,
        "serviceTotal": to_float(invoice.tongTien),
        "discount": to_float(invoice.giamGia),
        "totalAmount": to_float(invoice.thanhTien),
        "paidAt": format_datetime_iso(invoice.ngayTao),
        "status": invoice.trangThaiThanhToan,
        "note": invoice.ghiChu or "Không có ghi chú.",
        "services": services,
    }


def build_admin_invoice_report(
    db: Session,
    from_date: str | None = None,
    to_date: str | None = None,
    keyword: str | None = None,
    payment_method: str | None = "Tất cả",
    status: str | None = "Tất cả",
):
    start_date, end_date, start, end = get_default_range(from_date, to_date)

    keyword_text = (keyword or "").strip()
    payment_filter = normalize_filter(payment_method)
    status_filter = normalize_filter(status)

    query = (
        db.query(HoaDon, LichHen, KhachHang, TaiKhoan)
        .join(LichHen, LichHen.idLichHen == HoaDon.idLichHen)
        .join(TaiKhoan, TaiKhoan.idTaiKhoan == HoaDon.idTaiKhoan)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == HoaDon.idTaiKhoan)
        .filter(
            HoaDon.ngayTao >= start,
            HoaDon.ngayTao < end,
        )
    )

    if keyword_text:
        like_keyword = f"%{keyword_text}%"

        query = query.filter(
            or_(
                HoaDon.maHD.ilike(like_keyword),
                LichHen.maLH.ilike(like_keyword),
                KhachHang.hoTen.ilike(like_keyword),
                TaiKhoan.email.ilike(like_keyword),
            )
        )

    if payment_filter != "Tất cả":
        query = query.filter(HoaDon.phuongThucThanhToan == payment_filter)

    if status_filter != "Tất cả":
        query = query.filter(HoaDon.trangThaiThanhToan == status_filter)

    results = query.order_by(HoaDon.ngayTao.desc()).all()

    invoices = [
        build_invoice_row(
            db=db,
            invoice=invoice,
            appointment=appointment,
            customer=customer,
            account=account,
        )
        for invoice, appointment, customer, account in results
    ]

    paid_invoices = [
        invoice for invoice in invoices if invoice["status"] == PAID_STATUS
    ]

    cancelled_invoices = [
        invoice for invoice in invoices if invoice["status"] == CANCELLED_STATUS
    ]

    total_revenue = sum(invoice["totalAmount"] for invoice in paid_invoices)
    cancelled_value = sum(invoice["totalAmount"] for invoice in cancelled_invoices)

    cash_revenue = sum(
        invoice["totalAmount"]
        for invoice in paid_invoices
        if invoice["paymentMethod"] == "Tiền mặt"
    )

    transfer_revenue = sum(
        invoice["totalAmount"]
        for invoice in paid_invoices
        if invoice["paymentMethod"] == "Chuyển khoản"
    )

    card_revenue = sum(
        invoice["totalAmount"]
        for invoice in paid_invoices
        if invoice["paymentMethod"] == "Thẻ ngân hàng"
    )

    other_revenue = total_revenue - cash_revenue - transfer_revenue - card_revenue

    summary = {
        "totalRevenue": total_revenue,
        "cancelledValue": cancelled_value,
        "totalInvoices": len(invoices),
        "paidCount": len(paid_invoices),
        "cancelledCount": len(cancelled_invoices),
        "cashRevenue": cash_revenue,
        "transferRevenue": transfer_revenue,
        "cardRevenue": card_revenue,
        "otherRevenue": other_revenue,
    }

    return {
        "fromDate": format_date_iso(start_date),
        "toDate": format_date_iso(end_date),
        "keyword": keyword_text,
        "paymentMethod": payment_filter,
        "status": status_filter,
        "summary": summary,
        "invoices": invoices,
    }
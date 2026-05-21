from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.hoa_don import HoaDon
from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.lich_hen import LichHen
from app.models.khach_hang import KhachHang


SPA_NAME = "Serinity Spa"
SPA_ADDRESS = "123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng"
SPA_PHONE = "0909 999 888"

PAID_STATUS = "Đã thanh toán"
CANCELLED_STATUS = "Đã huỷ"


def format_money_value(value):
    return float(value or 0)


def format_datetime_value(value):
    if not value:
        return ""

    return value.strftime("%Y-%m-%d %H:%M")


def parse_date_filter(date_value: str | None):
    if not date_value:
        return None

    try:
        return datetime.strptime(date_value, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày lọc không đúng định dạng yyyy-mm-dd",
        )


def get_invoice_or_404(db: Session, invoice_id: str) -> HoaDon:
    query = db.query(HoaDon)

    if str(invoice_id).isdigit():
        invoice = query.filter(HoaDon.idHoaDon == int(invoice_id)).first()
    else:
        invoice = query.filter(HoaDon.maHD == invoice_id).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hoá đơn",
        )

    return invoice


def get_customer_by_account(db: Session, id_tai_khoan: int):
    return (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == id_tai_khoan)
        .first()
    )


def get_invoice_service_items(db: Session, hoa_don: HoaDon):
    rows = (
        db.query(ChiTietHoaDon, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietHoaDon.idDichVu)
        .filter(ChiTietHoaDon.idHoaDon == hoa_don.idHoaDon)
        .all()
    )

    items = []

    for chi_tiet, dich_vu in rows:
        quantity = int(chi_tiet.soLuong or 1)
        unit_price = format_money_value(chi_tiet.donGia)
        total = format_money_value(chi_tiet.thanhTien)

        if total <= 0:
          total = unit_price * quantity

        items.append(
            {
                "idDichVu": int(dich_vu.idDichVu),
                "tenDichVu": dich_vu.tenDV,
                "soLuong": quantity,
                "donGia": unit_price,
                "thanhTien": total,
            }
        )

    return items


def get_fallback_appointment_service_items(db: Session, id_lich_hen: int):
    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(ChiTietLichHen.idLichHen == id_lich_hen)
        .all()
    )

    items = []

    for chi_tiet, dich_vu in rows:
        quantity = int(chi_tiet.soLuong or 1)
        unit_price = format_money_value(chi_tiet.donGia)

        items.append(
            {
                "idDichVu": int(dich_vu.idDichVu),
                "tenDichVu": dich_vu.tenDV,
                "soLuong": quantity,
                "donGia": unit_price,
                "thanhTien": unit_price * quantity,
            }
        )

    return items


def build_staff_invoice_response(db: Session, hoa_don: HoaDon):
    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == hoa_don.idLichHen)
        .first()
    )

    khach_hang = get_customer_by_account(db, int(hoa_don.idTaiKhoan))

    booked_services = get_invoice_service_items(db, hoa_don)

    if not booked_services and lich_hen:
        booked_services = get_fallback_appointment_service_items(
            db=db,
            id_lich_hen=int(lich_hen.idLichHen),
        )

    status_value = hoa_don.trangThaiThanhToan or PAID_STATUS
    note_value = hoa_don.ghiChu or ""

    return {
        "idHoaDonDb": int(hoa_don.idHoaDon),
        "idHoaDon": hoa_don.maHD,
        "maLichHen": lich_hen.maLH if lich_hen else "",
        "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
        "phone": khach_hang.sdt if khach_hang else "",
        "paymentTime": format_datetime_value(hoa_don.ngayTao),
        "paymentMethod": hoa_don.phuongThucThanhToan,
        "status": status_value,
        "spaName": SPA_NAME,
        "spaAddress": SPA_ADDRESS,
        "spaPhone": SPA_PHONE,
        "bookedServices": booked_services,
        "extraServices": [],
        "note": note_value,
        "totalAmount": format_money_value(hoa_don.thanhTien),
        "cancelReason": note_value if status_value == CANCELLED_STATUS else "",
        "cancelledBy": "Lễ tân" if status_value == CANCELLED_STATUS else "",
        "cancelledAt": "",
    }


def get_staff_invoices(
    db: Session,
    date: str | None = None,
    payment_method: str | None = None,
    invoice_status: str | None = None,
    keyword: str | None = None,
):
    selected_date = parse_date_filter(date)

    query = (
        db.query(HoaDon)
        .outerjoin(LichHen, LichHen.idLichHen == HoaDon.idLichHen)
        .outerjoin(KhachHang, KhachHang.idTaiKhoan == HoaDon.idTaiKhoan)
    )

    if selected_date:
        query = query.filter(func.date(HoaDon.ngayTao) == selected_date)

    if payment_method and payment_method != "Tất cả":
        query = query.filter(HoaDon.phuongThucThanhToan == payment_method)

    if invoice_status and invoice_status != "Tất cả":
        query = query.filter(HoaDon.trangThaiThanhToan == invoice_status)

    if keyword and keyword.strip():
        keyword_text = f"%{keyword.strip()}%"

        query = query.filter(
            or_(
                HoaDon.maHD.like(keyword_text),
                LichHen.maLH.like(keyword_text),
                KhachHang.hoTen.like(keyword_text),
                KhachHang.sdt.like(keyword_text),
            )
        )

    invoices = (
        query
        .order_by(HoaDon.ngayTao.desc(), HoaDon.idHoaDon.desc())
        .all()
    )

    return [build_staff_invoice_response(db, invoice) for invoice in invoices]


def get_staff_invoice_detail(db: Session, invoice_id: str):
    invoice = get_invoice_or_404(db, invoice_id)
    return build_staff_invoice_response(db, invoice)


def cancel_staff_invoice(db: Session, invoice_id: str, reason: str):
    reason = reason.strip()

    if not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng nhập lý do huỷ hoá đơn",
        )

    invoice = get_invoice_or_404(db, invoice_id)

    if invoice.trangThaiThanhToan == CANCELLED_STATUS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hoá đơn này đã được huỷ trước đó",
        )

    if invoice.trangThaiThanhToan != PAID_STATUS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ hoá đơn đã thanh toán mới được huỷ",
        )

    invoice.trangThaiThanhToan = CANCELLED_STATUS
    invoice.ghiChu = f"Hoá đơn bị huỷ. Lý do: {reason}"

    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == invoice.idLichHen)
        .first()
    )

    # Khi huỷ hoá đơn, đưa lịch hẹn về Đang thực hiện để có thể lập lại hoá đơn mới
    if lich_hen and lich_hen.trangThai == "Đã hoàn thành":
        lich_hen.trangThai = "Đang thực hiện"

    db.commit()
    db.refresh(invoice)

    return build_staff_invoice_response(db, invoice)

def to_decimal(value) -> Decimal:
    return Decimal(str(value or 0))


def generate_invoice_code() -> str:
    now = datetime.now()
    return f"HD{now.strftime('%Y%m%d%H%M%S%f')}"


def get_customer_by_account_id(db: Session, id_tai_khoan: int):
    return (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == id_tai_khoan)
        .first()
    )


def build_staff_appointment_response(db: Session, lich_hen: LichHen):
    khach_hang = get_customer_by_account_id(db, lich_hen.idTaiKhoan)

    detail_rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietLichHen.idDichVu)
        .filter(ChiTietLichHen.idLichHen == lich_hen.idLichHen)
        .all()
    )

    services = []

    for chi_tiet, dich_vu in detail_rows:
        quantity = int(chi_tiet.soLuong or 1)
        price = float(chi_tiet.donGia or 0)

        services.append(
            {
                "idDichVu": int(dich_vu.idDichVu),
                "id": getattr(dich_vu, "maDV", None) or int(dich_vu.idDichVu),
                "name": dich_vu.tenDV,
                "price": price,
                "soLuong": quantity,
                "thoiLuongPhut": int(chi_tiet.thoiLuongPhut or 0),
                "thanhTien": price * quantity,
            }
        )

    return {
        "appointmentId": int(lich_hen.idLichHen),
        "id": lich_hen.maLH,
        "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
        "phone": khach_hang.sdt if khach_hang else "",
        "date": lich_hen.thoiGianBatDau.strftime("%Y-%m-%d"),
        "time": lich_hen.thoiGianBatDau.strftime("%H:%M"),
        "endTime": lich_hen.thoiGianKetThuc.strftime("%H:%M"),
        "status": lich_hen.trangThai,
        "note": lich_hen.ghiChu or "",
        "statusReason": lich_hen.lyDoHuy or "",
        "services": services,
    }


def build_staff_invoice_response(db: Session, hoa_don: HoaDon):
    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == hoa_don.idLichHen)
        .first()
    )

    khach_hang = get_customer_by_account_id(db, hoa_don.idTaiKhoan)

    detail_rows = (
        db.query(ChiTietHoaDon, DichVu)
        .join(DichVu, DichVu.idDichVu == ChiTietHoaDon.idDichVu)
        .filter(ChiTietHoaDon.idHoaDon == hoa_don.idHoaDon)
        .all()
    )

    booked_services = []

    for chi_tiet, dich_vu in detail_rows:
        booked_services.append(
            {
                "idDichVu": int(dich_vu.idDichVu),
                "tenDichVu": dich_vu.tenDV,
                "soLuong": int(chi_tiet.soLuong or 1),
                "donGia": float(chi_tiet.donGia or 0),
                "thanhTien": float(chi_tiet.thanhTien or 0),
            }
        )

    status_value = hoa_don.trangThaiThanhToan or PAID_STATUS
    note_value = hoa_don.ghiChu or ""

    cancel_reason = ""

    if status_value == CANCELLED_STATUS:
        cancel_reason = note_value.replace("Hoá đơn bị huỷ. Lý do:", "").strip()

    return {
        "idHoaDonDb": int(hoa_don.idHoaDon),
        "idHoaDon": hoa_don.maHD,
        "maLichHen": lich_hen.maLH if lich_hen else "",
        "customer": khach_hang.hoTen if khach_hang else "Khách hàng",
        "phone": khach_hang.sdt if khach_hang else "",
        "paymentTime": hoa_don.ngayTao.strftime("%Y-%m-%d %H:%M")
        if hoa_don.ngayTao
        else "",
        "paymentMethod": hoa_don.phuongThucThanhToan or "",
        "status": status_value,
        "spaName": SPA_NAME,
        "spaAddress": SPA_ADDRESS,
        "spaPhone": SPA_PHONE,
        "bookedServices": booked_services,
        "extraServices": [],
        "note": note_value,
        "totalAmount": float(hoa_don.thanhTien or 0),

        # Thông tin huỷ hoá đơn
        "cancelReason": cancel_reason,
        "cancelledBy": "Lễ tân" if status_value == CANCELLED_STATUS else "",
        "cancelledAt": datetime.now().strftime("%Y-%m-%d %H:%M")
        if status_value == CANCELLED_STATUS
        else "",
    }

def create_staff_invoice(db: Session, payload):
    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == payload.idLichHen)
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    if lich_hen.trangThai != "Đang thực hiện":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ lịch hẹn đang thực hiện mới được lập hoá đơn",
        )

    existed_invoice = (
        db.query(HoaDon)
        .filter(
            HoaDon.idLichHen == lich_hen.idLichHen,
            HoaDon.trangThaiThanhToan != "Đã huỷ",
        )
        .first()
    )

    if existed_invoice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lịch hẹn này đã có hoá đơn thanh toán",
        )

    appointment_details = (
        db.query(ChiTietLichHen)
        .filter(ChiTietLichHen.idLichHen == lich_hen.idLichHen)
        .all()
    )

    if not appointment_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lịch hẹn chưa có dịch vụ để lập hoá đơn",
        )

    invoice_items_by_service_id = {}

    for detail in appointment_details:
        id_dich_vu = int(detail.idDichVu)
        quantity = int(detail.soLuong or 1)
        unit_price = to_decimal(detail.donGia)
        amount = unit_price * quantity

        if id_dich_vu not in invoice_items_by_service_id:
            invoice_items_by_service_id[id_dich_vu] = {
                "idDichVu": id_dich_vu,
                "soLuong": quantity,
                "donGia": unit_price,
                "thanhTien": amount,
            }
        else:
            invoice_items_by_service_id[id_dich_vu]["soLuong"] += quantity
            invoice_items_by_service_id[id_dich_vu]["thanhTien"] += amount

    for extra_item in payload.dichVuPhatSinh:
        dich_vu = (
            db.query(DichVu)
            .filter(DichVu.idDichVu == extra_item.idDichVu)
            .first()
        )

        if not dich_vu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy dịch vụ phát sinh ID {extra_item.idDichVu}",
            )

        id_dich_vu = int(dich_vu.idDichVu)
        quantity = int(extra_item.soLuong or 1)
        unit_price = to_decimal(dich_vu.gia)
        amount = unit_price * quantity

        if id_dich_vu not in invoice_items_by_service_id:
            invoice_items_by_service_id[id_dich_vu] = {
                "idDichVu": id_dich_vu,
                "soLuong": quantity,
                "donGia": unit_price,
                "thanhTien": amount,
            }
        else:
            invoice_items_by_service_id[id_dich_vu]["soLuong"] += quantity
            invoice_items_by_service_id[id_dich_vu]["thanhTien"] += amount

    total_amount = sum(
        item["thanhTien"] for item in invoice_items_by_service_id.values()
    )

    discount = to_decimal(payload.giamGia)

    if discount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giảm giá không được nhỏ hơn 0",
        )

    final_amount = total_amount - discount

    if final_amount < 0:
        final_amount = Decimal("0")

    hoa_don = HoaDon(
        maHD=generate_invoice_code(),
        idLichHen=lich_hen.idLichHen,
        idTaiKhoan=lich_hen.idTaiKhoan,
        tongTien=total_amount,
        giamGia=discount,
        thanhTien=final_amount,
        phuongThucThanhToan=payload.phuongThucThanhToan,
        trangThaiThanhToan="Đã thanh toán",
        ghiChu=payload.ghiChu,
    )

    db.add(hoa_don)
    db.flush()

    for item in invoice_items_by_service_id.values():
        db.add(
            ChiTietHoaDon(
                idHoaDon=hoa_don.idHoaDon,
                idDichVu=item["idDichVu"],
                soLuong=item["soLuong"],
                donGia=item["donGia"],
                thanhTien=item["thanhTien"],
            )
        )

    lich_hen.trangThai = "Đã hoàn thành"

    db.commit()
    db.refresh(hoa_don)
    db.refresh(lich_hen)

    return {
        "message": "Lập hoá đơn thành công",
        "invoice": build_staff_invoice_response(db, hoa_don),
        "appointment": build_staff_appointment_response(db, lich_hen),
    }
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan
from app.models.hoa_don import HoaDon
from app.models.chi_tiet_hoa_don import ChiTietHoaDon
from app.services.booking_email_service import send_booking_success_email
from app.crud.danh_gia_crud import get_review_by_detail


ACTIVE_SERVICE_STATUSES = [
    "Hoạt động",
    "HOAT_DONG",
    "Hoat dong",
    "ACTIVE",
]

CANCELLED_APPOINTMENT_STATUSES = [
    "Đã huỷ",
    "Không đến",
]

BLOCKING_APPOINTMENT_STATUSES = [
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đã check-in",
    "Đang thực hiện",
]

# Spa mở cửa 09:00 - 21:00, chỉ nhận lịch theo mốc 00 hoặc 30 phút.
SPA_OPEN_HOUR = 9
SPA_CLOSE_HOUR = 21
SPA_SLOT_MINUTES = {0, 30}

# Số lịch tối đa spa có thể nhận trong cùng một khoảng thời gian.
# Có thể đổi theo số nhân viên/phòng/giường thực tế.
MAX_CONCURRENT_APPOINTMENTS = 5

HISTORY_APPOINTMENT_STATUSES = [
    "Đã hoàn thành",
    "Đã huỷ",
    "Không đến",
]

STATUS_CODE_MAP = {
    "Chờ xác nhận": "pending",
    "Đã xác nhận": "confirmed",
    "Đã check-in": "checkedin",
    "Đang thực hiện": "doing",
    "Đã hoàn thành": "completed",
    "Đã huỷ": "cancelled",
    "Không đến": "no_show",
}


def generate_appointment_code(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")
    max_id = db.query(func.max(LichHen.idLichHen)).scalar() or 0
    next_number = int(max_id) + 1

    while True:
        code = f"LH{today}{next_number:04d}"

        existed = db.query(LichHen).filter(LichHen.maLH == code).first()

        if not existed:
            return code

        next_number += 1


def parse_booking_datetime(ngay_hen: str, gio_hen: str) -> datetime:
    try:
        return datetime.strptime(f"{ngay_hen} {gio_hen}", "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày hoặc giờ hẹn không đúng định dạng",
        )


def validate_booking_business_time(start_time: datetime, end_time: datetime):
    opening_time = start_time.replace(
        hour=SPA_OPEN_HOUR,
        minute=0,
        second=0,
        microsecond=0,
    )
    closing_time = start_time.replace(
        hour=SPA_CLOSE_HOUR,
        minute=0,
        second=0,
        microsecond=0,
    )

    if start_time.minute not in SPA_SLOT_MINUTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giờ hẹn phải theo khung 30 phút, ví dụ 09:00, 09:30, 10:00",
        )

    if start_time < opening_time or end_time > closing_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spa chỉ nhận lịch từ 09:00 đến 21:00. Vui lòng chọn khung giờ khác",
        )


def validate_account(db: Session, id_tai_khoan: int) -> TaiKhoan:
    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == id_tai_khoan)
        .first()
    )

    if not tai_khoan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy tài khoản đặt lịch",
        )

    if tai_khoan.trangThai == "KHOA":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    return tai_khoan


def get_valid_services(db: Session, service_ids: list[int]) -> list[DichVu]:
    if not service_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn ít nhất một dịch vụ",
        )

    clean_ids = []

    for service_id in service_ids:
        if service_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dữ liệu đặt lịch thiếu mã dịch vụ",
            )

        try:
            clean_id = int(service_id)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã dịch vụ không hợp lệ",
            )

        if clean_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã dịch vụ không hợp lệ",
            )

        clean_ids.append(clean_id)

    unique_ids = list(dict.fromkeys(clean_ids))

    services = (
        db.query(DichVu)
        .filter(DichVu.idDichVu.in_(unique_ids))
        .all()
    )

    if len(services) != len(unique_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Có dịch vụ không tồn tại trong hệ thống",
        )

    inactive_services = [
        service.tenDV
        for service in services
        if service.trangThai not in ACTIVE_SERVICE_STATUSES
    ]

    if inactive_services:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dịch vụ đã ngừng hoạt động: {', '.join(inactive_services)}",
        )

    service_map = {int(service.idDichVu): service for service in services}

    return [service_map[int(service_id)] for service_id in unique_ids]


def check_customer_time_conflict(
    db: Session,
    id_tai_khoan: int,
    start_time: datetime,
    end_time: datetime,
    exclude_appointment_id: int | None = None,
):
    query = db.query(LichHen).filter(
        LichHen.idTaiKhoan == id_tai_khoan,
        ~LichHen.trangThai.in_(CANCELLED_APPOINTMENT_STATUSES),
        LichHen.thoiGianBatDau < end_time,
        LichHen.thoiGianKetThuc > start_time,
    )

    if exclude_appointment_id:
        query = query.filter(LichHen.idLichHen != exclude_appointment_id)

    conflict = query.first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã có lịch hẹn khác trong khoảng thời gian này",
        )

def count_spa_overlapping_appointments(
    db: Session,
    start_time: datetime,
    end_time: datetime,
    exclude_appointment_id: int | None = None,
) -> int:
    query = db.query(func.count(LichHen.idLichHen)).filter(
        LichHen.trangThai.in_(BLOCKING_APPOINTMENT_STATUSES),
        LichHen.thoiGianBatDau < end_time,
        LichHen.thoiGianKetThuc > start_time,
    )

    if exclude_appointment_id:
        query = query.filter(LichHen.idLichHen != exclude_appointment_id)

    return int(query.scalar() or 0)


def check_spa_capacity(
    db: Session,
    start_time: datetime,
    end_time: datetime,
    exclude_appointment_id: int | None = None,
):
    overlap_count = count_spa_overlapping_appointments(
        db=db,
        start_time=start_time,
        end_time=end_time,
        exclude_appointment_id=exclude_appointment_id,
    )

    if overlap_count >= MAX_CONCURRENT_APPOINTMENTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Khung giờ này đã có {overlap_count} lịch hẹn, "
                f"đạt sức chứa tối đa {MAX_CONCURRENT_APPOINTMENTS} lịch. "
                "Vui lòng chọn khung giờ khác."
            ),
        )

    return overlap_count

def format_time_from_minutes(total_minutes: int) -> str:
    hour = total_minutes // 60
    minute = total_minutes % 60

    return f"{hour:02d}:{minute:02d}"


def get_available_booking_slots(
    db: Session,
    ngay: str,
    thoi_luong: int,
):
    try:
        selected_date = datetime.strptime(ngay, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày không đúng định dạng yyyy-mm-dd",
        )

    try:
        duration = int(thoi_luong)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời lượng dịch vụ không hợp lệ",
        )

    if duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thời lượng dịch vụ phải lớn hơn 0",
        )

    open_minutes = SPA_OPEN_HOUR * 60
    close_minutes = SPA_CLOSE_HOUR * 60
    now = datetime.now()

    slots = []

    for current_minutes in range(open_minutes, close_minutes, 30):
        end_minutes = current_minutes + duration

        if end_minutes > close_minutes:
            continue

        start_time_text = format_time_from_minutes(current_minutes)
        end_time_text = format_time_from_minutes(end_minutes)

        slot_start = selected_date.replace(
            hour=current_minutes // 60,
            minute=current_minutes % 60,
            second=0,
            microsecond=0,
        )

        slot_end = selected_date.replace(
            hour=end_minutes // 60,
            minute=end_minutes % 60,
            second=0,
            microsecond=0,
        )

        overlap_count = count_spa_overlapping_appointments(
            db=db,
            start_time=slot_start,
            end_time=slot_end,
        )

        is_past = slot_start <= now
        is_full = overlap_count >= MAX_CONCURRENT_APPOINTMENTS

        if is_past:
            reason = "Đã qua"
        elif is_full:
            reason = "Hết chỗ"
        else:
            reason = "Còn chỗ"

        slots.append(
            {
                "startTime": start_time_text,
                "endTime": end_time_text,
                "available": not is_past and not is_full,
                "reason": reason,
                "overlapCount": overlap_count,
                "maxConcurrentAppointments": MAX_CONCURRENT_APPOINTMENTS,
            }
        )

    return {
        "ngay": ngay,
        "thoiLuong": duration,
        "maxConcurrentAppointments": MAX_CONCURRENT_APPOINTMENTS,
        "slots": slots,
    }


def get_status_code(status_value: str) -> str:
    return STATUS_CODE_MAP.get(status_value, "pending")


def format_datetime_value(value: datetime) -> str:
    return value.strftime("%Y-%m-%d %H:%M:%S")


def get_service_image(db: Session, id_dich_vu: int) -> str:
    image = (
        db.query(HinhAnhDichVu)
        .filter(HinhAnhDichVu.idDichVu == id_dich_vu)
        .order_by(
            HinhAnhDichVu.anhChinh.desc(),
            HinhAnhDichVu.idHinhAnh.asc(),
        )
        .first()
    )

    return image.duongDanAnh if image else ""


def create_booking(db: Session, payload):
    tai_khoan = validate_account(db, payload.idTaiKhoan)

    start_time = parse_booking_datetime(payload.ngayHen, payload.gioHen)

    if start_time < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đặt lịch ở thời gian đã qua",
        )

    booking_items = payload.dichVuItems or []

    if len(booking_items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn ít nhất một dịch vụ",
        )

    service_ids = []
    quantity_map = {}

    for item in booking_items:
        if item.idDichVu is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dữ liệu đặt lịch thiếu mã dịch vụ",
            )

        service_id = int(item.idDichVu)
        so_luong = int(item.soLuong or 1)

        if service_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã dịch vụ không hợp lệ",
            )

        if so_luong <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số lượng dịch vụ không hợp lệ",
            )

        service_ids.append(service_id)
        quantity_map[service_id] = so_luong

    services = get_valid_services(db, service_ids)

    total_duration = sum(int(service.thoiLuongPhut or 0) for service in services)

    if total_duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tổng thời lượng dịch vụ không hợp lệ",
        )

    end_time = start_time + timedelta(minutes=total_duration)

    validate_booking_business_time(start_time, end_time)

    check_customer_time_conflict(
        db=db,
        id_tai_khoan=payload.idTaiKhoan,
        start_time=start_time,
        end_time=end_time,
    )

    check_spa_capacity(
        db=db,
        start_time=start_time,
        end_time=end_time,
    )

    try:
        lich_hen = LichHen(
            maLH=generate_appointment_code(db),
            idTaiKhoan=payload.idTaiKhoan,
            thoiGianBatDau=start_time,
            thoiGianKetThuc=end_time,
            trangThai="Chờ xác nhận",
            ghiChu=payload.ghiChu,
            lyDoHuy=None,
            nguonTao="Khách hàng",
        )

        db.add(lich_hen)
        db.flush()

        chi_tiet_output = []
        tong_tien = 0

        for service in services:
            service_id = int(service.idDichVu)
            don_gia = float(service.gia or 0)
            thoi_luong = int(service.thoiLuongPhut or 0)
            so_luong = quantity_map.get(service_id, 1)
            thanh_tien = don_gia * so_luong

            tong_tien += thanh_tien

            chi_tiet = ChiTietLichHen(
                idLichHen=lich_hen.idLichHen,
                idDichVu=service_id,
                soLuong=so_luong,
                donGia=don_gia,
                thoiLuongPhut=thoi_luong,
            )

            db.add(chi_tiet)

            chi_tiet_output.append(
                {
                    "idDichVu": service_id,
                    "tenDichVu": service.tenDV,
                    "donGia": don_gia,
                    "thoiLuongPhut": thoi_luong,
                    "soLuong": so_luong,
                    "thanhTien": thanh_tien,
                }
            )

        db.commit()
        db.refresh(lich_hen)

        tong_so_luong = sum(quantity_map.values())

        booking_response = {
            "idLichHen": int(lich_hen.idLichHen),
            "maLH": lich_hen.maLH,
            "idTaiKhoan": int(lich_hen.idTaiKhoan),
            "thoiGianBatDau": lich_hen.thoiGianBatDau.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "thoiGianKetThuc": lich_hen.thoiGianKetThuc.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "trangThai": lich_hen.trangThai,
            "ghiChu": lich_hen.ghiChu,
            "soLuongNguoi": tong_so_luong,
            "tongTienDuKien": tong_tien,
            "tongThoiLuong": total_duration,
            "chiTietLichHen": chi_tiet_output,
            "message": "Đặt lịch thành công",
            "emailDaGui": False,
            "emailThongBao": None,
        }

        khach_hang = (
            db.query(KhachHang)
            .filter(KhachHang.idTaiKhoan == payload.idTaiKhoan)
            .first()
        )

        customer_name = (
            khach_hang.hoTen
            if khach_hang and khach_hang.hoTen
            else tai_khoan.email.split("@")[0]
        )

        email_da_gui, email_thong_bao = send_booking_success_email(
            to_email=tai_khoan.email,
            customer_name=customer_name,
            booking_data=booking_response,
        )

        booking_response["emailDaGui"] = email_da_gui
        booking_response["emailThongBao"] = email_thong_bao

        return booking_response

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo lịch hẹn: {str(error)}",
        )


def build_appointment_response(db: Session, lich_hen: LichHen):
    appointment_rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, ChiTietLichHen.idDichVu == DichVu.idDichVu)
        .filter(ChiTietLichHen.idLichHen == lich_hen.idLichHen)
        .all()
    )

    invoice = (
        db.query(HoaDon)
        .filter(
            HoaDon.idLichHen == lich_hen.idLichHen,
            HoaDon.trangThaiThanhToan != "Đã huỷ",
        )
        .order_by(HoaDon.idHoaDon.desc())
        .first()
    )

    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == lich_hen.idTaiKhoan)
        .first()
    )

    id_khach_hang = int(khach_hang.idKhachHang) if khach_hang else None

    chi_tiet_output = []
    tong_tien = 0
    tong_thoi_luong = 0
    tong_so_luong = 0

    booked_remaining_by_service = {}
    booked_detail_by_service = {}

    for chi_tiet, dich_vu in appointment_rows:
        id_dich_vu = int(dich_vu.idDichVu)

        booked_remaining_by_service[id_dich_vu] = (
            booked_remaining_by_service.get(id_dich_vu, 0)
            + int(chi_tiet.soLuong or 1)
        )

        booked_detail_by_service[id_dich_vu] = {
            "idChiTietLH": int(chi_tiet.idChiTietLH)
            if chi_tiet.idChiTietLH is not None
            else None,
            "idDichVu": id_dich_vu,
            "tenDichVu": dich_vu.tenDV,
            "donGia": float(chi_tiet.donGia or dich_vu.gia or 0),
            "thoiLuongPhut": int(
                chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0
            ),
            "hinhAnh": get_service_image(db, id_dich_vu),
        }

    if invoice and lich_hen.trangThai == "Đã hoàn thành":
        invoice_rows = (
            db.query(ChiTietHoaDon, DichVu)
            .join(DichVu, ChiTietHoaDon.idDichVu == DichVu.idDichVu)
            .filter(ChiTietHoaDon.idHoaDon == invoice.idHoaDon)
            .all()
        )

        for chi_tiet_hd, dich_vu in invoice_rows:
            id_dich_vu = int(dich_vu.idDichVu)
            invoice_quantity = int(chi_tiet_hd.soLuong or 1)
            invoice_price = float(chi_tiet_hd.donGia or dich_vu.gia or 0)
            duration = int(dich_vu.thoiLuongPhut or 0)

            booked_quantity = min(
                invoice_quantity,
                booked_remaining_by_service.get(id_dich_vu, 0),
            )

            if booked_quantity > 0:
                base_detail = booked_detail_by_service.get(id_dich_vu, {})
                base_id_chi_tiet = base_detail.get("idChiTietLH")

                review_data = (
                    get_review_by_detail(
                        db=db,
                        id_khach_hang=id_khach_hang,
                        id_chi_tiet_lh=base_id_chi_tiet,
                    )
                    if base_id_chi_tiet
                    else None
                )

                thanh_tien = invoice_price * booked_quantity

                tong_tien += thanh_tien
                tong_thoi_luong += duration * booked_quantity
                tong_so_luong += booked_quantity

                chi_tiet_output.append(
                    {
                        "idChiTietLH": base_detail.get("idChiTietLH"),
                        "idDichVu": id_dich_vu,
                        "tenDichVu": dich_vu.tenDV,
                        "donGia": invoice_price,
                        "thoiLuongPhut": duration,
                        "soLuong": booked_quantity,
                        "thanhTien": thanh_tien,
                        "hinhAnh": get_service_image(db, id_dich_vu),
                        "type": "booked",
                        "isAdditional": False,
                        "reviewed": review_data is not None,
                        "review": review_data,
                    }
                )

                booked_remaining_by_service[id_dich_vu] = (
                    booked_remaining_by_service.get(id_dich_vu, 0)
                    - booked_quantity
                )

            additional_quantity = invoice_quantity - booked_quantity

            if additional_quantity > 0:
                thanh_tien = invoice_price * additional_quantity

                tong_tien += thanh_tien
                tong_thoi_luong += duration * additional_quantity
                tong_so_luong += additional_quantity

                chi_tiet_output.append(
                    {
                        # Dịch vụ phát sinh nằm trong ChiTietHoaDon,
                        # không có idChiTietLH thật nên dùng id âm để frontend có key riêng.
                        "idChiTietLH": -int(chi_tiet_hd.idChiTietHD),
                        "idDichVu": id_dich_vu,
                        "tenDichVu": dich_vu.tenDV,
                        "donGia": invoice_price,
                        "thoiLuongPhut": duration,
                        "soLuong": additional_quantity,
                        "thanhTien": thanh_tien,
                        "hinhAnh": get_service_image(db, id_dich_vu),
                        "type": "additional",
                        "isAdditional": True,
                        "reviewed": False,
                        "review": None,
                    }
                )

        # Nếu muốn tổng tiền đúng theo hoá đơn đã thanh toán thì ưu tiên thanhTien
        if invoice.thanhTien is not None:
            tong_tien = float(invoice.thanhTien or 0)

    else:
        for chi_tiet, dich_vu in appointment_rows:
            id_chi_tiet = (
                int(chi_tiet.idChiTietLH)
                if chi_tiet.idChiTietLH is not None
                else None
            )

            review_data = (
                get_review_by_detail(
                    db=db,
                    id_khach_hang=id_khach_hang,
                    id_chi_tiet_lh=id_chi_tiet,
                )
                if id_chi_tiet
                else None
            )

            id_dich_vu = int(dich_vu.idDichVu)
            so_luong = int(chi_tiet.soLuong or 1)
            don_gia = float(chi_tiet.donGia or dich_vu.gia or 0)
            thoi_luong = int(chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0)
            thanh_tien = don_gia * so_luong

            tong_tien += thanh_tien
            tong_thoi_luong += thoi_luong * so_luong
            tong_so_luong += so_luong

            chi_tiet_output.append(
                {
                    "idChiTietLH": id_chi_tiet,
                    "idDichVu": id_dich_vu,
                    "tenDichVu": dich_vu.tenDV,
                    "donGia": don_gia,
                    "thoiLuongPhut": thoi_luong,
                    "soLuong": so_luong,
                    "thanhTien": thanh_tien,
                    "hinhAnh": get_service_image(db, id_dich_vu),
                    "type": "booked",
                    "isAdditional": False,
                    "reviewed": review_data is not None,
                    "review": review_data,
                }
            )

    return {
        "idLichHen": int(lich_hen.idLichHen),
        "maLH": lich_hen.maLH,
        "idTaiKhoan": int(lich_hen.idTaiKhoan),
        "thoiGianBatDau": format_datetime_value(lich_hen.thoiGianBatDau),
        "thoiGianKetThuc": format_datetime_value(lich_hen.thoiGianKetThuc),
        "ngayHen": lich_hen.thoiGianBatDau.strftime("%Y-%m-%d"),
        "gioHen": lich_hen.thoiGianBatDau.strftime("%H:%M"),
        "gioKetThuc": lich_hen.thoiGianKetThuc.strftime("%H:%M"),
        "trangThai": lich_hen.trangThai,
        "trangThaiCode": get_status_code(lich_hen.trangThai),
        "ghiChu": lich_hen.ghiChu,
        "lyDoHuy": lich_hen.lyDoHuy,
        "tongTienDuKien": tong_tien,
        "tongThoiLuong": tong_thoi_luong,
        "tongSoLuong": tong_so_luong,
        "invoiceCode": invoice.maHD if invoice else None,
        "paymentMethod": invoice.phuongThucThanhToan if invoice else None,
        "paymentStatus": invoice.trangThaiThanhToan if invoice else None,
        "totalPayment": float(invoice.thanhTien or 0) if invoice else None,
        "chiTietLichHen": chi_tiet_output,
    }

def build_staff_appointment_response(db: Session, lich_hen: LichHen):
    khach_hang = (
        db.query(KhachHang)
        .filter(KhachHang.idTaiKhoan == lich_hen.idTaiKhoan)
        .first()
    )

    tai_khoan = (
        db.query(TaiKhoan)
        .filter(TaiKhoan.idTaiKhoan == lich_hen.idTaiKhoan)
        .first()
    )

    customer_name = "Khách hàng"
    customer_phone = ""

    if khach_hang:
        customer_name = khach_hang.hoTen or "Khách hàng"
        customer_phone = khach_hang.sdt or ""
    elif tai_khoan:
        customer_name = tai_khoan.email.split("@")[0]
        customer_phone = tai_khoan.email

    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, ChiTietLichHen.idDichVu == DichVu.idDichVu)
        .filter(ChiTietLichHen.idLichHen == lich_hen.idLichHen)
        .all()
    )

    services = []
    total_price = 0
    total_duration = 0
    total_quantity = 0

    for chi_tiet, dich_vu in rows:
        service_id = int(dich_vu.idDichVu)
        quantity = int(chi_tiet.soLuong or 1)
        price = float(chi_tiet.donGia or dich_vu.gia or 0)
        duration = int(chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0)
        line_total = price * quantity

        total_price += line_total
        total_duration += duration * quantity
        total_quantity += quantity

        services.append(
            {
                "idChiTietLH": int(chi_tiet.idChiTietLH),
                "idDichVu": service_id,
                "maDV": dich_vu.maDV,
                "name": dich_vu.tenDV,
                "price": price,
                "soLuong": quantity,
                "thoiLuongPhut": duration,
                "thanhTien": line_total,
            }
        )

    status_reason = None

    if lich_hen.trangThai in ["Đã huỷ", "Không đến"]:
        status_reason = lich_hen.lyDoHuy

    return {
        "idLichHen": int(lich_hen.idLichHen),
        "maLH": lich_hen.maLH,
        "customer": customer_name,
        "phone": customer_phone,
        "date": lich_hen.thoiGianBatDau.strftime("%Y-%m-%d"),
        "time": lich_hen.thoiGianBatDau.strftime("%H:%M"),
        "endTime": lich_hen.thoiGianKetThuc.strftime("%H:%M"),
        "status": lich_hen.trangThai,
        "note": lich_hen.ghiChu,
        "lyDoHuy": lich_hen.lyDoHuy,
        "statusReason": status_reason,
        "totalPrice": total_price,
        "totalDuration": total_duration,
        "totalQuantity": total_quantity,
        "services": services,
    }

def get_staff_appointments(
    db: Session,
    ngay: str | None = None,
    keyword: str | None = None,
    trang_thai: str | None = None,
):
    query = db.query(LichHen)

    if ngay:
        try:
            start_date = datetime.strptime(ngay, "%Y-%m-%d")
            end_date = start_date + timedelta(days=1)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ngày lọc không đúng định dạng yyyy-mm-dd",
            )

        query = query.filter(
            LichHen.thoiGianBatDau >= start_date,
            LichHen.thoiGianBatDau < end_date,
        )

    if trang_thai and trang_thai != "Tất cả":
        query = query.filter(LichHen.trangThai == trang_thai)

    if keyword and keyword.strip():
        keyword_like = f"%{keyword.strip()}%"

        query = (
            query.outerjoin(
                KhachHang,
                KhachHang.idTaiKhoan == LichHen.idTaiKhoan,
            )
            .filter(
                or_(
                    LichHen.maLH.ilike(keyword_like),
                    KhachHang.hoTen.ilike(keyword_like),
                    KhachHang.sdt.ilike(keyword_like),
                )
            )
        )

    appointments = (
        query.order_by(
            LichHen.thoiGianBatDau.asc(),
            LichHen.idLichHen.desc(),
        )
        .all()
    )

    return [build_staff_appointment_response(db, item) for item in appointments]

STAFF_ALLOWED_TRANSITIONS = {
    "Chờ xác nhận": ["Đã xác nhận", "Đã huỷ"],
    "Đã xác nhận": ["Đã check-in", "Không đến", "Đã huỷ"],
    "Đã check-in": ["Đang thực hiện"],
    "Đang thực hiện": [],
    "Đã hoàn thành": [],
    "Đã huỷ": [],
    "Không đến": [],
}


def create_staff_appointment(db: Session, payload):
    tai_khoan = validate_account(db, payload.idTaiKhoan)

    start_time = parse_booking_datetime(payload.ngayHen, payload.gioHen)

    if start_time < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tạo lịch hẹn ở thời gian đã qua",
        )

    booking_items = payload.dichVuItems or []

    if len(booking_items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng chọn ít nhất một dịch vụ",
        )

    service_ids = []
    quantity_map = {}

    for item in booking_items:
        service_id = int(item.idDichVu)
        so_luong = int(item.soLuong or 1)

        if service_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã dịch vụ không hợp lệ",
            )

        if so_luong <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số lượng dịch vụ không hợp lệ",
            )

        service_ids.append(service_id)
        quantity_map[service_id] = so_luong

    services = get_valid_services(db, service_ids)

    # Thời lượng lịch hẹn tính theo mỗi dịch vụ một lần.
    # Ví dụ 1 dịch vụ số lượng 3 người vẫn là cùng khung giờ, không nhân 3.
    total_duration = sum(int(service.thoiLuongPhut or 0) for service in services)

    if total_duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tổng thời lượng dịch vụ không hợp lệ",
        )

    end_time = start_time + timedelta(minutes=total_duration)

    validate_booking_business_time(start_time, end_time)

    check_customer_time_conflict(
        db=db,
        id_tai_khoan=payload.idTaiKhoan,
        start_time=start_time,
        end_time=end_time,
    )

    overlap_count = check_spa_capacity(
        db=db,
        start_time=start_time,
        end_time=end_time,
    )

    try:
        lich_hen = LichHen(
            maLH=generate_appointment_code(db),
            idTaiKhoan=payload.idTaiKhoan,
            thoiGianBatDau=start_time,
            thoiGianKetThuc=end_time,
            trangThai="Đã xác nhận",
            ghiChu=(
                payload.ghiChu
                or (
                    "Lịch hẹn được tạo tại quầy. "
                    + (
                        f"Khung giờ này đang có {overlap_count} lịch hẹn khác; "
                        "lễ tân đã kiểm tra thủ công nhân viên/phòng."
                        if overlap_count > 0
                        else ""
                    )
                ).strip()
            ),
            lyDoHuy=None,
            nguonTao="Lễ tân",
        )

        db.add(lich_hen)
        db.flush()

        for service in services:
            service_id = int(service.idDichVu)
            don_gia = float(service.gia or 0)
            thoi_luong = int(service.thoiLuongPhut or 0)
            so_luong = quantity_map.get(service_id, 1)

            chi_tiet = ChiTietLichHen(
                idLichHen=lich_hen.idLichHen,
                idDichVu=service_id,
                soLuong=so_luong,
                donGia=don_gia,
                thoiLuongPhut=thoi_luong,
            )

            db.add(chi_tiet)

        db.commit()
        db.refresh(lich_hen)

        return {
            "message": "Tạo lịch hẹn thành công",
            "appointment": build_staff_appointment_response(db, lich_hen),
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo lịch hẹn: {str(error)}",
        )


def update_staff_appointment_status(db: Session, appointment_id: int, payload):
    lich_hen = (
        db.query(LichHen)
        .filter(LichHen.idLichHen == appointment_id)
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    current_status = lich_hen.trangThai
    next_status = payload.trangThai

    allowed_next_statuses = STAFF_ALLOWED_TRANSITIONS.get(current_status, [])

    if next_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể cập nhật trạng thái này theo quy trình hiện tại",
        )

    reason = (payload.lyDo or "").strip()

    if next_status in ["Đã huỷ", "Không đến"] and not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng nhập lý do",
        )

    lich_hen.trangThai = next_status

    if next_status in ["Đã huỷ", "Không đến"]:
        lich_hen.lyDoHuy = reason

    db.commit()
    db.refresh(lich_hen)

    return {
        "message": "Cập nhật trạng thái lịch hẹn thành công",
        "appointment": build_staff_appointment_response(db, lich_hen),
    }

def get_customer_appointments(db: Session, id_tai_khoan: int):
    validate_account(db, id_tai_khoan)

    appointments = (
        db.query(LichHen)
        .filter(LichHen.idTaiKhoan == id_tai_khoan)
        .order_by(LichHen.thoiGianBatDau.desc())
        .all()
    )

    return [build_appointment_response(db, item) for item in appointments]


def get_customer_appointment_detail(
    db: Session,
    id_tai_khoan: int,
    appointment_id: int,
):
    validate_account(db, id_tai_khoan)

    lich_hen = (
        db.query(LichHen)
        .filter(
            LichHen.idLichHen == appointment_id,
            LichHen.idTaiKhoan == id_tai_khoan,
        )
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    return build_appointment_response(db, lich_hen)


def get_customer_service_history(db: Session, id_tai_khoan: int):
    validate_account(db, id_tai_khoan)

    appointments = (
        db.query(LichHen)
        .filter(
            LichHen.idTaiKhoan == id_tai_khoan,
            LichHen.trangThai.in_(HISTORY_APPOINTMENT_STATUSES),
        )
        .order_by(LichHen.thoiGianBatDau.desc())
        .all()
    )

    return [build_appointment_response(db, item) for item in appointments]


def cancel_customer_appointment(
    db: Session,
    appointment_id: int,
    id_tai_khoan: int,
    ly_do_huy: str,
):
    lich_hen = (
        db.query(LichHen)
        .filter(
            LichHen.idLichHen == appointment_id,
            LichHen.idTaiKhoan == id_tai_khoan,
        )
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    if lich_hen.trangThai not in ["Chờ xác nhận", "Đã xác nhận"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể hủy lịch ở trạng thái chờ xác nhận hoặc đã xác nhận",
        )

    lich_hen.trangThai = "Đã huỷ"
    lich_hen.lyDoHuy = ly_do_huy.strip()

    db.commit()

    return {
        "message": "Hủy lịch hẹn thành công",
    }


def reschedule_customer_appointment(
    db: Session,
    appointment_id: int,
    id_tai_khoan: int,
    ngay_hen: str,
    gio_hen: str,
):
    lich_hen = (
        db.query(LichHen)
        .filter(
            LichHen.idLichHen == appointment_id,
            LichHen.idTaiKhoan == id_tai_khoan,
        )
        .first()
    )

    if not lich_hen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch hẹn",
        )

    if lich_hen.trangThai not in ["Chờ xác nhận", "Đã xác nhận"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể đổi lịch ở trạng thái chờ xác nhận hoặc đã xác nhận",
        )

    start_time = parse_booking_datetime(ngay_hen, gio_hen)

    if start_time < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đổi sang thời gian đã qua",
        )

    total_duration = (
        db.query(func.coalesce(func.sum(ChiTietLichHen.thoiLuongPhut), 0))
        .filter(ChiTietLichHen.idLichHen == appointment_id)
        .scalar()
    )

    total_duration = int(total_duration or 0)

    if total_duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không xác định được thời lượng lịch hẹn",
        )

    end_time = start_time + timedelta(minutes=total_duration)

    validate_booking_business_time(start_time, end_time)

    check_customer_time_conflict(
        db=db,
        id_tai_khoan=id_tai_khoan,
        start_time=start_time,
        end_time=end_time,
        exclude_appointment_id=appointment_id,
    )

    lich_hen.thoiGianBatDau = start_time
    lich_hen.thoiGianKetThuc = end_time

    db.commit()

    return {
        "message": "Đổi lịch hẹn thành công",
    }
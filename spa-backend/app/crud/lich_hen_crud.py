from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.hinh_anh_dich_vu import HinhAnhDichVu
from app.models.khach_hang import KhachHang
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan
from app.services.booking_email_service import send_booking_success_email


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

    check_customer_time_conflict(
        db=db,
        id_tai_khoan=payload.idTaiKhoan,
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
    rows = (
        db.query(ChiTietLichHen, DichVu)
        .join(DichVu, ChiTietLichHen.idDichVu == DichVu.idDichVu)
        .filter(ChiTietLichHen.idLichHen == lich_hen.idLichHen)
        .all()
    )

    chi_tiet_output = []
    tong_tien = 0
    tong_thoi_luong = 0
    tong_so_luong = 0

    for chi_tiet, dich_vu in rows:
        id_chi_tiet = (
            int(chi_tiet.idChiTietLH)
            if chi_tiet.idChiTietLH is not None
            else None
        )
        id_dich_vu = int(dich_vu.idDichVu)
        so_luong = int(chi_tiet.soLuong or 1)
        don_gia = float(chi_tiet.donGia or dich_vu.gia or 0)
        thoi_luong = int(chi_tiet.thoiLuongPhut or dich_vu.thoiLuongPhut or 0)
        thanh_tien = don_gia * so_luong

        tong_tien += thanh_tien
        tong_thoi_luong += thoi_luong
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
        "chiTietLichHen": chi_tiet_output,
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
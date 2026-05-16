from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.chi_tiet_lich_hen import ChiTietLichHen
from app.models.dich_vu import DichVu
from app.models.lich_hen import LichHen
from app.models.tai_khoan import TaiKhoan
from app.models.khach_hang import KhachHang
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
    unique_ids = list(dict.fromkeys(service_ids))

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
):
    conflict = (
        db.query(LichHen)
        .filter(
            LichHen.idTaiKhoan == id_tai_khoan,
            ~LichHen.trangThai.in_(CANCELLED_APPOINTMENT_STATUSES),
            LichHen.thoiGianBatDau < end_time,
            LichHen.thoiGianKetThuc > start_time,
        )
        .first()
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã có lịch hẹn khác trong khoảng thời gian này",
        )


def create_booking(db: Session, payload):
    tai_khoan = validate_account(db, payload.idTaiKhoan)

    start_time = parse_booking_datetime(payload.ngayHen, payload.gioHen)

    if start_time < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đặt lịch ở thời gian đã qua",
        )
    booking_items = payload.dichVuItems

    service_ids = [item.idDichVu for item in booking_items]
    quantity_map = {
        int(item.idDichVu): int(item.soLuong or 1)
        for item in booking_items
    }

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
            don_gia = float(service.gia or 0)
            so_luong = quantity_map.get(int(service.idDichVu), 1)
            thanh_tien = don_gia * so_luong
            tong_tien += thanh_tien

            chi_tiet = ChiTietLichHen(
                idLichHen=lich_hen.idLichHen,
                idDichVu=service.idDichVu,
                soLuong=so_luong,
                donGia=don_gia,
                thoiLuongPhut=service.thoiLuongPhut,
            )

            db.add(chi_tiet)

            chi_tiet_output.append(
                {
                    "idDichVu": int(service.idDichVu),
                    "tenDichVu": service.tenDV,
                    "donGia": don_gia,
                    "thoiLuongPhut": int(service.thoiLuongPhut or 0),
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
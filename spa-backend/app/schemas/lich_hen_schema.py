from typing import Optional

from pydantic import BaseModel, Field


class DichVuDatLichItem(BaseModel):
    idDichVu: int = Field(..., ge=1)
    soLuong: int = Field(1, ge=1)


class LichHenCreateRequest(BaseModel):
    idTaiKhoan: int = Field(..., ge=1)
    ngayHen: str = Field(..., examples=["2026-05-15"])
    gioHen: str = Field(..., examples=["09:00"])
    ghiChu: Optional[str] = None
    dichVuItems: list[DichVuDatLichItem] = Field(..., min_length=1)


class ChiTietLichHenOut(BaseModel):
    idDichVu: int
    tenDichVu: str
    donGia: float
    thoiLuongPhut: int
    soLuong: int
    thanhTien: float


class LichHenCreateResponse(BaseModel):
    idLichHen: int
    maLH: str
    idTaiKhoan: int
    thoiGianBatDau: str
    thoiGianKetThuc: str
    trangThai: str
    ghiChu: Optional[str] = None
    soLuongNguoi: int
    tongTienDuKien: float
    tongThoiLuong: int
    chiTietLichHen: list[ChiTietLichHenOut]
    message: str
    emailDaGui: bool = False
    emailThongBao: Optional[str] = None


class LichHenDichVuOut(BaseModel):
    idChiTietLH: Optional[int] = None
    idDichVu: int
    tenDichVu: str
    donGia: float
    thoiLuongPhut: int
    soLuong: int
    thanhTien: float
    hinhAnh: Optional[str] = ""

    # Dùng cho trang lịch sử dịch vụ khách hàng
    type: Optional[str] = "booked"
    isAdditional: bool = False


class LichHenCustomerOut(BaseModel):
    idLichHen: int
    maLH: str
    idTaiKhoan: int

    thoiGianBatDau: str
    thoiGianKetThuc: str
    ngayHen: str
    gioHen: str
    gioKetThuc: str

    trangThai: str
    trangThaiCode: str

    ghiChu: Optional[str] = None
    lyDoHuy: Optional[str] = None

    tongTienDuKien: float
    tongThoiLuong: int
    tongSoLuong: int

    # Thông tin hoá đơn nếu lịch đã thanh toán
    invoiceCode: Optional[str] = None
    paymentMethod: Optional[str] = None
    paymentStatus: Optional[str] = None
    totalPayment: Optional[float] = None

    chiTietLichHen: list[LichHenDichVuOut]


class LichHenCancelRequest(BaseModel):
    idTaiKhoan: int = Field(..., ge=1)
    lyDoHuy: str = Field(..., min_length=2)


class LichHenRescheduleRequest(BaseModel):
    idTaiKhoan: int = Field(..., ge=1)
    ngayHen: str = Field(..., examples=["2026-05-17"])
    gioHen: str = Field(..., examples=["09:00"])


class LichHenActionResponse(BaseModel):
    message: str

class StaffLichHenDichVuOut(BaseModel):
    idChiTietLH: Optional[int] = None
    idDichVu: int
    maDV: Optional[str] = None
    name: str
    price: float
    soLuong: int
    thoiLuongPhut: int
    thanhTien: float


class StaffLichHenOut(BaseModel):
    idLichHen: int
    maLH: str

    customer: str
    phone: str

    date: str
    time: str
    endTime: str

    status: str
    note: Optional[str] = None
    lyDoHuy: Optional[str] = None
    statusReason: Optional[str] = None

    totalPrice: float
    totalDuration: int
    totalQuantity: int

    services: list[StaffLichHenDichVuOut]

class StaffLichHenCreateItem(BaseModel):
    idDichVu: int
    soLuong: int = 1


class StaffLichHenCreateRequest(BaseModel):
    idTaiKhoan: int
    ngayHen: str
    gioHen: str
    ghiChu: Optional[str] = None
    dichVuItems: list[StaffLichHenCreateItem]


class StaffLichHenStatusRequest(BaseModel):
    trangThai: str
    lyDo: Optional[str] = None


class StaffLichHenActionResponse(BaseModel):
    message: str
    appointment: StaffLichHenOut
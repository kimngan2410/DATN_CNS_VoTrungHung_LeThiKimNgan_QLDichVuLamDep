from typing import Optional

from pydantic import BaseModel, Field


class LichHenCreateRequest(BaseModel):
    idTaiKhoan: int = Field(..., ge=1)
    ngayHen: str = Field(..., examples=["2026-05-15"])
    gioHen: str = Field(..., examples=["09:00"])
    soLuongNguoi: int = Field(1, ge=1)
    ghiChu: Optional[str] = None
    dichVuIds: list[int] = Field(..., min_length=1)


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
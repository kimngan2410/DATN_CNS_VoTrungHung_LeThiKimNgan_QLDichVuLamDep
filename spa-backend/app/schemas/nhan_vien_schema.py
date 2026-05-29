from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class AdminEmployeeOut(BaseModel):
    idNhanVien: int
    idTaiKhoan: int
    maNV: str

    hoTen: str
    email: str
    sdt: str

    chucVu: str
    gioiTinh: Optional[str] = ""
    ngaySinh: Optional[str] = ""

    anhDaiDien: Optional[str] = ""

    ngayVaoLam: Optional[str] = ""
    trangThaiLamViec: str

    ngayTao: Optional[str] = ""


class AdminEmployeeCreateRequest(BaseModel):
    hoTen: str = Field(..., min_length=2)
    email: EmailStr
    sdt: str = Field(..., min_length=9)

    chucVu: str
    gioiTinh: Optional[str] = "Nữ"
    ngaySinh: Optional[str] = None

    anhDaiDien: Optional[str] = ""

    ngayVaoLam: Optional[str] = None
    trangThaiLamViec: Optional[str] = "Đang làm"


class AdminEmployeeUpdateRequest(BaseModel):
    hoTen: str = Field(..., min_length=2)
    email: EmailStr
    sdt: str = Field(..., min_length=9)

    chucVu: str
    gioiTinh: Optional[str] = "Nữ"
    ngaySinh: Optional[str] = None

    anhDaiDien: Optional[str] = ""

    ngayVaoLam: Optional[str] = None
    trangThaiLamViec: Optional[str] = "Đang làm"


class AdminEmployeeActionResponse(BaseModel):
    message: str
    employee: Optional[AdminEmployeeOut] = None
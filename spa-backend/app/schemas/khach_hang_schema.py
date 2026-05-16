from typing import Optional

from pydantic import BaseModel


class AccountProfileResponse(BaseModel):
    idTaiKhoan: int
    idKhachHang: Optional[int] = None
    maKH: Optional[str] = None

    fullName: str
    email: str
    phone: Optional[str] = ""
    birthDate: Optional[str] = ""
    gender: Optional[str] = ""
    avatar: Optional[str] = ""

    customerType: Optional[str] = "Thường"
    accountType: Optional[str] = ""
    loginType: Optional[str] = ""
    status: Optional[str] = ""
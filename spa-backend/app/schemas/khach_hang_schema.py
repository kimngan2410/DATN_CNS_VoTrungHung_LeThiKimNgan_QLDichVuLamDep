from typing import Optional

from pydantic import BaseModel, Field  


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

class StaffCustomerAppointmentOut(BaseModel):
    id: str
    date: str
    time: str
    services: str
    status: str


class StaffCustomerServiceHistoryOut(BaseModel):
    id: str
    serviceName: str
    date: str
    amount: float


class StaffCustomerOut(BaseModel):
    id: str
    idKhachHang: int
    idTaiKhoan: int
    maKH: str

    fullName: str
    avatarText: str
    avatar: Optional[str] = ""

    phone: str
    email: str
    gender: str
    birthday: str
    createdAt: str

    loaiKH: str
    status: str

    totalAppointments: int
    totalSpent: float
    lastVisit: str

    appointments: list[StaffCustomerAppointmentOut] = []
    serviceHistory: list[StaffCustomerServiceHistoryOut] = []


class StaffCustomerCreateRequest(BaseModel):
    fullName: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=8)
    email: Optional[str] = None
    gender: Optional[str] = "Nữ"
    birthday: Optional[str] = None
    loaiKH: Optional[str] = "Thường"
    status: Optional[str] = "Đang hoạt động"


class StaffCustomerActionResponse(BaseModel):
    message: str
    customer: StaffCustomerOut


class AdminCustomerOut(StaffCustomerOut):
    pass
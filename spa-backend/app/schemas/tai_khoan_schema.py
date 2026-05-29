from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class AdminAccountOut(BaseModel):
    idTaiKhoan: int
    id: str

    fullName: str
    email: str
    phone: Optional[str] = ""

    role: str
    status: str

    createdAt: Optional[str] = ""
    lastLoginAt: Optional[str] = ""

    relatedUser: str
    avatar: Optional[str] = ""
    note: Optional[str] = ""


class AdminAccountCreateRequest(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = ""
    role: str = "Khách hàng"
    status: str = "Hoạt động"
    password: Optional[str] = "TK@123456"
    note: Optional[str] = ""


class AdminAccountUpdateRequest(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = ""
    role: str
    status: str
    relatedUser: Optional[str] = ""
    note: Optional[str] = ""


class AdminAccountStatusRequest(BaseModel):
    status: str
from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginUserResponse(BaseModel):
    maTK: int
    email: str
    vaiTro: str

    maKH: Optional[int] = None
    maNV: Optional[int] = None

    hoTen: Optional[str] = None
    avatar: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: LoginUserResponse
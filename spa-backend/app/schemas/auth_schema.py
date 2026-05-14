from typing import Optional

from pydantic import BaseModel, EmailStr, Field


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


class RegisterSendOtpRequest(BaseModel):
    hoTen: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    sdt: str = Field(..., min_length=9, max_length=20)
    password: str = Field(..., min_length=6, max_length=100)
    confirmPassword: str = Field(..., min_length=6, max_length=100)


class RegisterSendOtpResponse(BaseModel):
    message: str
    email: str
    expires_in_seconds: int

    # Chỉ dùng khi test local.
    # Sau này gửi OTP qua email thật thì có thể bỏ trường này.
    dev_otp: Optional[str] = None


class RegisterVerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class RegisterResendOtpRequest(BaseModel):
    email: EmailStr
from pydantic import BaseModel
from typing import Optional


class ReviewImageOut(BaseModel):
    id: int
    url: str
    name: str


class ReviewOut(BaseModel):
    idDanhGia: int
    idKhachHang: int
    idChiTietLH: int
    rating: int
    content: str
    images: list[ReviewImageOut] = []
    createdAt: Optional[str] = None

class AdminReviewReplyOut(BaseModel):
    noiDungPhanHoi: str
    ngayTao: Optional[str] = None
    ngayCapNhat: Optional[str] = None


class AdminReviewOut(BaseModel):
    idDanhGia: int
    maDanhGia: str

    idKhachHang: int
    tenKhachHang: str
    avatar: Optional[str] = ""

    idDichVu: int
    tenDichVu: str

    soSao: int
    noiDung: str

    hinhAnh: list[str] = []

    ngayDanhGia: Optional[str] = None
    trangThai: str

    phanHoi: Optional[AdminReviewReplyOut] = None


class AdminReviewReplyRequest(BaseModel):
    noiDungPhanHoi: str
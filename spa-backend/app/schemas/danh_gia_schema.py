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
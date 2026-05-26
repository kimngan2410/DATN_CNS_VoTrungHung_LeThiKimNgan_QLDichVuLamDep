from pydantic import BaseModel, Field
from typing import Optional


class DanhMucDichVuOut(BaseModel):
    id: int
    tenDM: str
    moTa: Optional[str] = None


class DichVuOut(BaseModel):
    id: int
    maDV: str
    title: str
    category: str
    categoryId: int
    description: str
    detailDescription: Optional[str] = None
    price: float
    duration: int
    image: str
    isActive: bool
    isFeatured: bool = True


class DichVuDetailOut(DichVuOut):
    images: list[str] = []
    relatedServices: list[DichVuOut] = []


class DichVuCreate(BaseModel):
    idDanhMuc: int
    tenDV: str = Field(..., min_length=1, max_length=200)
    moTaNgan: Optional[str] = None
    moTaChiTiet: Optional[str] = None
    gia: float = Field(..., ge=0)
    thoiLuongPhut: int = Field(..., ge=1)
    trangThai: str = "Hoạt động"
    anhChinh: Optional[str] = None


class ReviewImageOut(BaseModel):
    id: int
    imageUrl: str


class ReviewReplyOut(BaseModel):
    adminName: str
    content: str
    createdAt: str


class ServiceReviewOut(BaseModel):
    id: int
    serviceId: int
    customerName: str
    avatar: Optional[str] = None
    rating: int
    content: Optional[str] = None
    createdAt: str
    images: list[ReviewImageOut] = []
    reply: Optional[ReviewReplyOut] = None


class ServiceReviewResponse(BaseModel):
    averageRating: float
    totalReviews: int
    reviews: list[ServiceReviewOut]

class AdminServiceImageOut(BaseModel):
    idHinhAnh: int | None = None
    imageUrl: str
    isMain: bool = False


class AdminServiceOut(BaseModel):
    id: str
    idDichVu: int
    maDV: str
    name: str
    categoryId: int
    categoryName: str
    price: float
    duration: int
    status: str
    createdAt: str
    shortDescription: str | None = None
    detailDescription: str | None = None
    isUsedInAppointments: bool = False
    images: list[str] = []


class AdminServiceCreate(BaseModel):
    idDanhMuc: int
    tenDV: str = Field(..., min_length=1, max_length=200)
    moTaNgan: str | None = None
    moTaChiTiet: str | None = None
    gia: float = Field(..., ge=0)
    thoiLuongPhut: int = Field(..., ge=1)
    trangThai: str = "Hoạt động"
    images: list[str] = []


class AdminServiceUpdate(BaseModel):
    idDanhMuc: int
    tenDV: str = Field(..., min_length=1, max_length=200)
    moTaNgan: str | None = None
    moTaChiTiet: str | None = None
    gia: float = Field(..., ge=0)
    thoiLuongPhut: int = Field(..., ge=1)
    trangThai: str = "Hoạt động"
    images: list[str] = []


class AdminServiceActionResponse(BaseModel):
    message: str
    service: AdminServiceOut | None = None


class AdminUploadImagesResponse(BaseModel):
    images: list[str] = []
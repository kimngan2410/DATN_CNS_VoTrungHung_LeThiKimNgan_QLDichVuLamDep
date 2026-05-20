from pydantic import BaseModel
from typing import Optional


class HomeServiceOut(BaseModel):
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


class HomeCategoryOut(BaseModel):
    id: int
    tenDM: str
    moTa: Optional[str] = None


class HomeTestimonialOut(BaseModel):
    id: int
    customerName: str
    avatar: Optional[str] = None
    rating: int
    content: str
    createdAt: str


class HomeResponse(BaseModel):
    newServices: list[HomeServiceOut]
    categories: list[HomeCategoryOut]
    testimonials: list[HomeTestimonialOut]
from typing import Optional

from pydantic import BaseModel, Field


class AdminCategoryServiceOut(BaseModel):
    id: str
    idDichVu: int
    maDV: str
    name: str
    price: float
    duration: int
    status: str


class AdminServiceCategoryOut(BaseModel):
    id: str
    idDanhMuc: int
    name: str
    description: str
    createdAt: str
    serviceCount: int
    services: list[AdminCategoryServiceOut] = []


class AdminServiceCategoryCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = ""


class AdminServiceCategoryUpdate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = ""


class AdminServiceCategoryActionResponse(BaseModel):
    message: str
    category: Optional[AdminServiceCategoryOut] = None
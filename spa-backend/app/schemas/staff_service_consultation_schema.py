from typing import Any

from pydantic import BaseModel


class StaffConsultationServiceOut(BaseModel):
    id: int
    idDichVu: int
    maDV: str
    serviceName: str
    category: str
    price: float
    duration: int
    description: str
    image: str


class StaffConsultationServiceSearchResponse(BaseModel):
    keyword: str
    total: int
    services: list[StaffConsultationServiceOut]


class StaffConsultationTemplateRequest(BaseModel):
    idDichVu: int
    customerConcern: str | None = ""


class StaffConsultationTemplateResponse(BaseModel):
    service: dict[str, Any]
    messageTemplate: str
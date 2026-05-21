from pydantic import BaseModel, Field


class InvoiceExtraServiceItem(BaseModel):
    idDichVu: int
    soLuong: int = Field(default=1, ge=1)


class CreateStaffInvoiceRequest(BaseModel):
    idLichHen: int
    phuongThucThanhToan: str
    dichVuPhatSinh: list[InvoiceExtraServiceItem] = []
    giamGia: float = 0
    ghiChu: str | None = None
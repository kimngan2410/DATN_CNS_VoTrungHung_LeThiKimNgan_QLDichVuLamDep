from typing import Any

from pydantic import BaseModel


class AdminInvoiceReportResponse(BaseModel):
    fromDate: str
    toDate: str
    keyword: str
    paymentMethod: str
    status: str
    summary: dict[str, Any]
    invoices: list[dict[str, Any]]
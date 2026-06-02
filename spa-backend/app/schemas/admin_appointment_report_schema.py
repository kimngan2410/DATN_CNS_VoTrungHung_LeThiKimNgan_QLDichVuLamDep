from typing import Any

from pydantic import BaseModel


class AdminAppointmentReportResponse(BaseModel):
    fromDate: str
    toDate: str
    keyword: str
    status: str
    summary: dict[str, Any]
    appointments: list[dict[str, Any]]
from typing import Any

from pydantic import BaseModel


class AdminServiceUsageReportResponse(BaseModel):
    fromDate: str
    toDate: str
    keyword: str
    category: str
    usageStatus: str
    serviceStatus: str
    sortBy: str
    categoryOptions: list[str]
    summary: dict[str, Any]
    chartData: list[dict[str, Any]]
    services: list[dict[str, Any]]
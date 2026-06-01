from typing import Any

from pydantic import BaseModel


class AdminRevenueReportResponse(BaseModel):
    fromDate: str
    toDate: str
    compare: str
    summary: dict[str, Any]
    chartData: list[dict[str, Any]]
    categoryRevenue: list[dict[str, Any]]
    rows: list[dict[str, Any]]
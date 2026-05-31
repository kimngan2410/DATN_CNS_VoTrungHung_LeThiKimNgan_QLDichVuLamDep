from typing import Any

from pydantic import BaseModel


class AdminOverviewResponse(BaseModel):
    period: str
    label: str
    compareText: str
    startDate: str = ""
    endDate: str = ""
    summary: dict[str, Any]
    growth: dict[str, Any]
    revenueTrend: list[dict[str, Any]]
    customerGrowth: list[dict[str, Any]]
    topServices: list[dict[str, Any]]
    paymentMethods: list[dict[str, Any]]
    recentInvoices: list[dict[str, Any]]
    recentActivities: list[dict[str, Any]]
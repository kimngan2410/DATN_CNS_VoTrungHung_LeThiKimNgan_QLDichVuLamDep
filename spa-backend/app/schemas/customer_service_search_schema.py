from typing import Any

from pydantic import BaseModel


class CustomerServiceSearchResponse(BaseModel):
    keyword: str
    category: str
    priceRange: str
    duration: str
    rating: str
    sortBy: str
    page: int
    limit: int
    total: int
    totalPages: int
    services: list[dict[str, Any]]
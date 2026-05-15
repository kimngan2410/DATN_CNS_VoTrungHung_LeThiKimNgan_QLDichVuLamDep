from pydantic import BaseModel


class HomeServiceOut(BaseModel):
    id: int
    title: str
    category: str
    description: str | None = None
    price: float
    duration: int
    image: str | None = None
    isFeatured: bool = True
    isActive: bool = True


class HomeTestimonialOut(BaseModel):
    id: int
    name: str
    role: str | None = None
    content: str
    rating: int
    avatar: str | None = None


class HomeResponse(BaseModel):
    featuredServices: list[HomeServiceOut]
    testimonials: list[HomeTestimonialOut]
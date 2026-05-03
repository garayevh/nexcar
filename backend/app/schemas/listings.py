from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ListingCreate(BaseModel):
    car_brand: str
    car_model: str
    year: int
    price: float
    mileage: int
    color: Optional[str] = None
    engine_volume: Optional[float] = None
    description: Optional[str] = None
    city: str = "Bakı"

class ListingResponse(BaseModel):
    id: int
    car_brand: str
    car_model: str
    year: int
    price: float
    mileage: int
    color: Optional[str]
    engine_volume: Optional[float]
    description: Optional[str]
    city: str
    status: str
    view_count: int
    suggested_price_min: Optional[float]
    suggested_price_max: Optional[float]
    price_rating: Optional[str]
    seller_name: str
    seller_phone: str
    photos: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ListingList(BaseModel):
    id: int
    car_brand: str
    car_model: str
    year: int
    price: float
    mileage: int
    color: Optional[str]
    city: str
    status: str
    price_rating: Optional[str]
    main_photo: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

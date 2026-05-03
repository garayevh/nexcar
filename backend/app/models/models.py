from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    user = "user"
    dealer = "dealer"
    admin = "admin"
    student = "student"

class ListingStatus(str, enum.Enum):
    active = "active"
    sold = "sold"
    expired = "expired"
    pending = "pending"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    telegram_id = Column(String(50), nullable=True)
    company_name = Column(String(200), nullable=True)
    is_verified_dealer = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    listings = relationship("Listing", back_populates="seller", foreign_keys="Listing.seller_id")

class CarBrand(Base):
    __tablename__ = "car_brands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    models = relationship("CarModel", back_populates="brand")

class CarModel(Base):
    __tablename__ = "car_models"
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("car_brands.id"), nullable=False)
    name = Column(String(100), nullable=False)
    brand = relationship("CarBrand", back_populates="models")
    listings = relationship("Listing", back_populates="car_model")

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    car_model_id = Column(Integer, ForeignKey("car_models.id"), nullable=False)
    year = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    mileage = Column(Integer, nullable=False)
    color = Column(String(50), nullable=True)
    engine_volume = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    city = Column(String(100), default="Bakı")
    suggested_price_min = Column(Float, nullable=True)
    suggested_price_max = Column(Float, nullable=True)
    price_rating = Column(String(20), nullable=True)
    status = Column(SAEnum(ListingStatus), default=ListingStatus.pending)
    is_vip = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    car_model = relationship("CarModel", back_populates="listings")
    photos = relationship("ListingPhoto", back_populates="listing")

class ListingPhoto(Base):
    __tablename__ = "listing_photos"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)
    is_main = Column(Boolean, default=False)
    listing = relationship("Listing", back_populates="photos")

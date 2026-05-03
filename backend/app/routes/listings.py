from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import Listing, CarBrand, CarModel, User, ListingStatus
from app.schemas.listings import ListingCreate, ListingResponse, ListingList
from app.services.suggested_price import get_suggested_price

router = APIRouter()

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Не авторизован")
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")
        return user
    except:
        raise HTTPException(status_code=401, detail="Неверный токен")

@router.get("", response_model=List[dict])
def get_listings(
    brand: Optional[str] = None,
    model: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    city: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Listing).join(CarModel).join(CarBrand).filter(
        Listing.status == ListingStatus.active
    )

    if brand:
        query = query.filter(CarBrand.name.ilike(f"%{brand}%"))
    if model:
        query = query.filter(CarModel.name.ilike(f"%{model}%"))
    if year_min:
        query = query.filter(Listing.year >= year_min)
    if year_max:
        query = query.filter(Listing.year <= year_max)
    if price_min:
        query = query.filter(Listing.price >= price_min)
    if price_max:
        query = query.filter(Listing.price <= price_max)
    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%"))

    listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for l in listings:
        result.append({
            "id": l.id,
            "brand": l.car_model.brand.name,
            "model": l.car_model.name,
            "year": l.year,
            "price": l.price,
            "mileage": l.mileage,
            "color": l.color,
            "city": l.city,
            "price_rating": l.price_rating,
            "view_count": l.view_count,
            "created_at": l.created_at
        })
    return result

@router.post("", response_model=dict)
def create_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # находим или создаём бренд
    brand = db.query(CarBrand).filter(
        CarBrand.name.ilike(data.car_brand)
    ).first()
    if not brand:
        brand = CarBrand(name=data.car_brand.title())
        db.add(brand)
        db.flush()

    # находим или создаём модель
    model = db.query(CarModel).filter(
        CarModel.brand_id == brand.id,
        CarModel.name.ilike(data.car_model)
    ).first()
    if not model:
        model = CarModel(name=data.car_model.title(), brand_id=brand.id)
        db.add(model)
        db.flush()

    # считаем suggested price
    price_data = get_suggested_price(
        db, data.car_brand, data.car_model,
        data.year, data.mileage, data.price
    )

    listing = Listing(
        seller_id=current_user.id,
        car_model_id=model.id,
        year=data.year,
        price=data.price,
        mileage=data.mileage,
        color=data.color,
        engine_volume=data.engine_volume,
        description=data.description,
        city=data.city,
        status=ListingStatus.active,
        expires_at=datetime.utcnow() + timedelta(days=30),
        **price_data
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return {
        "id": listing.id,
        "message": "Объявление создано!",
        "price_rating": listing.price_rating,
        "suggested_price_min": listing.suggested_price_min,
        "suggested_price_max": listing.suggested_price_max,
        "expires_at": listing.expires_at
    }

@router.get("/{listing_id}", response_model=dict)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Объявление не найдено")

    # увеличиваем счётчик просмотров
    listing.view_count += 1
    db.commit()

    return {
        "id": listing.id,
        "brand": listing.car_model.brand.name,
        "model": listing.car_model.name,
        "year": listing.year,
        "price": listing.price,
        "mileage": listing.mileage,
        "color": listing.color,
        "engine_volume": listing.engine_volume,
        "description": listing.description,
        "city": listing.city,
        "status": listing.status,
        "view_count": listing.view_count,
        "price_rating": listing.price_rating,
        "suggested_price_min": listing.suggested_price_min,
        "suggested_price_max": listing.suggested_price_max,
        "seller_name": listing.seller.name,
        "seller_phone": listing.seller.phone,
        "expires_at": listing.expires_at,
        "created_at": listing.created_at
    }

@router.patch("/{listing_id}/sold")
def mark_as_sold(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваше объявление")

    listing.status = ListingStatus.sold
    db.commit()
    return {"message": "Машина отмечена как проданная ✅"}

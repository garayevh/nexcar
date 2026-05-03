from sqlalchemy.orm import Session
from app.models.models import Listing, CarModel, CarBrand

def get_suggested_price(db, brand_name, model_name, year, mileage, user_price):
    similar = db.query(Listing).join(CarModel).join(CarBrand).filter(
        CarBrand.name.ilike(brand_name),
        CarModel.name.ilike(model_name),
        Listing.year.between(year - 1, year + 1),
        Listing.status == "active"
    ).all()

    if len(similar) < 3:
        return {
            "suggested_price_min": round(user_price * 0.9),
            "suggested_price_max": round(user_price * 1.1),
            "price_rating": "unknown"
        }

    prices = [s.price for s in similar]
    avg = sum(prices) / len(prices)
    mileage_factor = 0.92 if mileage > 100000 else 0.96 if mileage > 50000 else 1.0
    suggested_min = round(avg * mileage_factor * 0.93)
    suggested_max = round(avg * mileage_factor * 1.07)

    if user_price < suggested_min:
        price_rating = "great_deal"
    elif user_price > suggested_max:
        price_rating = "overpriced"
    else:
        price_rating = "fair"

    return {
        "suggested_price_min": suggested_min,
        "suggested_price_max": suggested_max,
        "price_rating": price_rating
    }

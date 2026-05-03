from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_token
from app.models.models import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # проверяем что номер не занят
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Этот номер уже зарегистрирован")

    user = User(
        name=data.name,
        phone=data.phone,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role
    )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный номер или пароль")

    token = create_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role
    )

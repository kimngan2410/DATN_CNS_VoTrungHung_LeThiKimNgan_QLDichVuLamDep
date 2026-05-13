from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.crud.auth_crud import authenticate_user, create_test_customer_account
from app.db.session import get_db
from app.schemas.auth_schema import LoginRequest, LoginResponse

router = APIRouter()


@router.get("/")
def auth_home():
    return {
        "message": "API Auth đang hoạt động"
    }


@router.post("/dang-nhap", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    access_token = create_access_token(
        data={
            "sub": str(user["maTK"]),
            "email": user["email"],
            "vaiTro": user["vaiTro"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/tao-tai-khoan-test")
def create_test_account(db: Session = Depends(get_db)):
    try:
        return create_test_customer_account(db)
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi tạo tài khoản test: {str(error)}",
        )
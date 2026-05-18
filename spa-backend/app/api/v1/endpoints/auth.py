from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.crud.auth_crud import (
    authenticate_user,
    change_password,
    create_or_login_social_user,
    resend_register_otp,
    send_register_otp,
    verify_register_otp,
    resend_forgot_password_otp,
    reset_password_by_otp,
    send_forgot_password_otp,
    verify_forgot_password_otp,
)
from app.db.session import get_db
from app.schemas.auth_schema import (
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
    RegisterResendOtpRequest,
    RegisterSendOtpRequest,
    RegisterSendOtpResponse,
    RegisterVerifyOtpRequest,
    ForgotPasswordResendOtpRequest,
    ForgotPasswordResetRequest,
    ForgotPasswordSendOtpRequest,
    ForgotPasswordVerifyOtpRequest,
)

import json
import secrets
from urllib.parse import quote, urlencode

import httpx
from fastapi import Request
from fastapi.responses import RedirectResponse

from app.core.config import settings

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

@router.put(
    "/doi-mat-khau/{id_tai_khoan}",
    response_model=ChangePasswordResponse,
)
def change_account_password(
    id_tai_khoan: int,
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
):
    return change_password(
        db=db,
        id_tai_khoan=id_tai_khoan,
        payload=payload,
    )

@router.post("/dang-ky/gui-otp", response_model=RegisterSendOtpResponse)
def register_send_otp(
    payload: RegisterSendOtpRequest,
    db: Session = Depends(get_db),
):
    return send_register_otp(db, payload)


@router.post("/dang-ky/xac-nhan", response_model=LoginResponse)
def register_verify_otp(
    payload: RegisterVerifyOtpRequest,
    db: Session = Depends(get_db),
):
    return verify_register_otp(db, payload)


@router.post("/dang-ky/gui-lai-otp", response_model=RegisterSendOtpResponse)
def register_resend_otp(
    payload: RegisterResendOtpRequest,
    db: Session = Depends(get_db),
):
    return resend_register_otp(db, payload)

@router.post("/quen-mat-khau/gui-otp")
def forgot_password_send_otp(
    payload: ForgotPasswordSendOtpRequest,
    db: Session = Depends(get_db),
):
    return send_forgot_password_otp(db, payload)


@router.post("/quen-mat-khau/gui-lai-otp")
def forgot_password_resend_otp(
    payload: ForgotPasswordResendOtpRequest,
    db: Session = Depends(get_db),
):
    return resend_forgot_password_otp(db, payload)


@router.post("/quen-mat-khau/xac-nhan-otp")
def forgot_password_verify_otp(
    payload: ForgotPasswordVerifyOtpRequest,
    db: Session = Depends(get_db),
):
    return verify_forgot_password_otp(db, payload)


@router.post("/quen-mat-khau/dat-lai-mat-khau")
def forgot_password_reset(
    payload: ForgotPasswordResetRequest,
    db: Session = Depends(get_db),
):
    return reset_password_by_otp(db, payload)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"


def redirect_to_frontend_with_error(message: str):
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    return RedirectResponse(
        url=f"{frontend_url}/dang-nhap?oauth_error={quote(message)}"
    )


def redirect_to_frontend_with_auth(data: dict):
    frontend_url = settings.FRONTEND_URL.rstrip("/")

    query = urlencode(
        {
            "access_token": data["access_token"],
            "token_type": data.get("token_type", "bearer"),
            "user": json.dumps(data["user"], ensure_ascii=False),
        }
    )

    return RedirectResponse(url=f"{frontend_url}/oauth-callback?{query}")


@router.get("/google")
def google_login():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return redirect_to_frontend_with_error("Chưa cấu hình Google OAuth")

    state = secrets.token_urlsafe(24)

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    }

    response = RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")

    response.set_cookie(
        key="google_oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        max_age=600,
    )

    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        return redirect_to_frontend_with_error("Người dùng đã hủy đăng nhập Google")

    saved_state = request.cookies.get("google_oauth_state")

    if not state or not saved_state or state != saved_state:
        return redirect_to_frontend_with_error("Phiên đăng nhập Google không hợp lệ")

    if not code:
        return redirect_to_frontend_with_error("Không nhận được mã xác thực Google")

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            )

            token_response.raise_for_status()
            token_data = token_response.json()

            access_token = token_data.get("access_token")

            if not access_token:
                return redirect_to_frontend_with_error(
                    "Google không trả về access token"
                )

            user_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
            )

            user_response.raise_for_status()
            google_user = user_response.json()

        email = google_user.get("email")
        email_verified = google_user.get("email_verified")
        full_name = google_user.get("name")
        avatar = google_user.get("picture")

        if not email:
            return redirect_to_frontend_with_error(
                "Không lấy được email từ Google"
            )

        if email_verified is False:
            return redirect_to_frontend_with_error(
                "Email Google chưa được xác thực"
            )

        data = create_or_login_social_user(
            db=db,
            email=email,
            full_name=full_name,
            avatar=avatar,
            provider="GOOGLE",
        )

        response = redirect_to_frontend_with_auth(data)
        response.delete_cookie("google_oauth_state")

        return response

    except Exception as error:
        return redirect_to_frontend_with_error(
            f"Lỗi đăng nhập Google: {str(error)}"
        )


@router.get("/facebook")
def facebook_login():
    if not settings.FACEBOOK_CLIENT_ID or not settings.FACEBOOK_CLIENT_SECRET:
        return redirect_to_frontend_with_error("Chưa cấu hình Facebook OAuth")

    state = secrets.token_urlsafe(24)

    facebook_auth_url = (
        f"https://www.facebook.com/{settings.FACEBOOK_GRAPH_VERSION}/dialog/oauth"
    )

    params = {
        "client_id": settings.FACEBOOK_CLIENT_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "state": state,
        "scope": "email,public_profile",
        "response_type": "code",
    }

    response = RedirectResponse(url=f"{facebook_auth_url}?{urlencode(params)}")

    response.set_cookie(
        key="facebook_oauth_state",
        value=state,
        httponly=True,
        samesite="lax",
        max_age=600,
    )

    return response


@router.get("/facebook/callback")
async def facebook_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        return redirect_to_frontend_with_error(
            "Người dùng đã hủy đăng nhập Facebook"
        )

    saved_state = request.cookies.get("facebook_oauth_state")

    if not state or not saved_state or state != saved_state:
        return redirect_to_frontend_with_error(
            "Phiên đăng nhập Facebook không hợp lệ"
        )

    if not code:
        return redirect_to_frontend_with_error(
            "Không nhận được mã xác thực Facebook"
        )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            token_url = (
                f"https://graph.facebook.com/"
                f"{settings.FACEBOOK_GRAPH_VERSION}/oauth/access_token"
            )

            token_response = await client.get(
                token_url,
                params={
                    "client_id": settings.FACEBOOK_CLIENT_ID,
                    "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                    "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
                    "code": code,
                },
            )

            token_response.raise_for_status()
            token_data = token_response.json()

            access_token = token_data.get("access_token")

            if not access_token:
                return redirect_to_frontend_with_error(
                    "Facebook không trả về access token"
                )

            userinfo_url = (
                f"https://graph.facebook.com/"
                f"{settings.FACEBOOK_GRAPH_VERSION}/me"
            )

            user_response = await client.get(
                userinfo_url,
                params={
                    "fields": "id,name,email,picture.type(large)",
                    "access_token": access_token,
                },
            )

            user_response.raise_for_status()
            facebook_user = user_response.json()

        email = facebook_user.get("email")
        full_name = facebook_user.get("name")
        avatar = (
            facebook_user.get("picture", {})
            .get("data", {})
            .get("url")
        )

        if not email:
            return redirect_to_frontend_with_error(
                "Không lấy được email từ Facebook. Hãy thử tài khoản khác hoặc cấp quyền email."
            )

        data = create_or_login_social_user(
            db=db,
            email=email,
            full_name=full_name,
            avatar=avatar,
            provider="FACEBOOK",
        )

        response = redirect_to_frontend_with_auth(data)
        response.delete_cookie("facebook_oauth_state")

        return response

    except Exception as error:
        return redirect_to_frontend_with_error(
            f"Lỗi đăng nhập Facebook: {str(error)}"
        )
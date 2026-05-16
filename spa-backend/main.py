from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.v1.api import api_router
from app.db.database import Base, engine

# Quan trọng: import toàn bộ models để SQLAlchemy biết các bảng cần tạo
from app import models  # noqa: F401


app = FastAPI(
    title="Serenity Spa API",
    version="1.0.0",
    description="Backend API cho hệ thống quản lý dịch vụ làm đẹp Serenity Spa",
)

# Tạo thư mục uploads nếu chưa có
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Cho phép truy cập file upload qua URL:
# http://127.0.0.1:8000/uploads/...
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Cấu hình CORS để frontend React gọi được backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tự động tạo bảng trong MySQL dựa trên các model trong app/models
Base.metadata.create_all(bind=engine)

# Gắn toàn bộ API route vào prefix /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Serenity Spa Backend is running",
        "docs": "http://127.0.0.1:8000/docs",
    }


@app.get("/test-db")
def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT DATABASE() AS db_name, NOW() AS server_time")
            )

            row = result.mappings().first()

            return {
                "status": "success",
                "message": "Kết nối MySQL thành công",
                "database": row["db_name"],
                "server_time": str(row["server_time"]),
            }

    except Exception as error:
        return {
            "status": "error",
            "message": "Kết nối MySQL thất bại",
            "detail": str(error),
        }
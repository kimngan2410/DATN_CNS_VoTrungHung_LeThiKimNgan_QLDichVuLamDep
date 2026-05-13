from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import khach_hang
from app.api.v1.endpoints import nhan_vien
from app.api.v1.endpoints import danh_muc_dich_vu
from app.api.v1.endpoints import dich_vu
from app.api.v1.endpoints import lich_hen
from app.api.v1.endpoints import hoa_don
from app.api.v1.endpoints import hoi_thoai
from app.api.v1.endpoints import danh_gia
from app.api.v1.endpoints import bao_cao

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(khach_hang.router, prefix="/khach-hang", tags=["Khách hàng"])
api_router.include_router(nhan_vien.router, prefix="/nhan-vien", tags=["Nhân viên"])
api_router.include_router(danh_muc_dich_vu.router, prefix="/danh-muc-dich-vu", tags=["Danh mục dịch vụ"])
api_router.include_router(dich_vu.router, prefix="/dich-vu", tags=["Dịch vụ"])
api_router.include_router(lich_hen.router, prefix="/lich-hen", tags=["Lịch hẹn"])
api_router.include_router(hoa_don.router, prefix="/hoa-don", tags=["Hóa đơn"])
api_router.include_router(hoi_thoai.router, prefix="/hoi-thoai", tags=["Hội thoại"])
api_router.include_router(danh_gia.router, prefix="/danh-gia", tags=["Đánh giá"])
api_router.include_router(bao_cao.router, prefix="/bao-cao", tags=["Báo cáo"])
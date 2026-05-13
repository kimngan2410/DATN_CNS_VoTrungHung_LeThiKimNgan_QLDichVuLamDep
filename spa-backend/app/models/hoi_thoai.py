from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class HoiThoai(Base):
    __tablename__ = "HoiThoai"

    idHoiThoai = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idKhachHang = Column(
        BigInteger,
        ForeignKey("KhachHang.idKhachHang"),
        nullable=False,
    )

    idNhanVienPhuTrach = Column(
        BigInteger,
        ForeignKey("NhanVien.idNhanVien"),
        nullable=True,
    )

    trangThai = Column(String(50), nullable=False, default="Đang hoạt động")

    ngayTao = Column(DateTime, server_default=func.now())

    khachHang = relationship("KhachHang")
    nhanVienPhuTrach = relationship("NhanVien")
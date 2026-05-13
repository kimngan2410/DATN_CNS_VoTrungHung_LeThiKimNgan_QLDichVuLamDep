from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class KhachHang(Base):
    __tablename__ = "KhachHang"

    idKhachHang = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
        unique=True,
    )

    maKH = Column(String(50), nullable=False, unique=True)

    hoTen = Column(String(150), nullable=False)
    sdt = Column(String(20), nullable=True, unique=True)

    ngaySinh = Column(Date, nullable=True)
    gioiTinh = Column(String(20), nullable=True)

    anhDaiDien = Column(String(500), nullable=True)

    loaiKH = Column(String(50), nullable=False, default="Thường")

    ngayTao = Column(DateTime, server_default=func.now())

    taiKhoan = relationship("TaiKhoan")
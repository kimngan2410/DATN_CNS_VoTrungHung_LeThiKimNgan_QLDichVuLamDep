from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class LichHen(Base):
    __tablename__ = "LichHen"

    idLichHen = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    maLH = Column(String(50), nullable=False, unique=True)

    idTaiKhoan = Column(
        BigInteger,
        ForeignKey("TaiKhoan.idTaiKhoan"),
        nullable=False,
    )

    thoiGianBatDau = Column(DateTime, nullable=False)
    thoiGianKetThuc = Column(DateTime, nullable=False)

    trangThai = Column(String(50), nullable=False, default="Chờ xác nhận")

    ghiChu = Column(Text, nullable=True)
    lyDoHuy = Column(Text, nullable=True)

    nguonTao = Column(String(50), nullable=False, default="Khách hàng")

    ngayTao = Column(DateTime, server_default=func.now())

    taiKhoan = relationship("TaiKhoan")
from sqlalchemy import BigInteger, CheckConstraint, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class DanhGia(Base):
    __tablename__ = "DanhGia"

    idDanhGia = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idKhachHang = Column(
        BigInteger,
        ForeignKey("KhachHang.idKhachHang"),
        nullable=False,
    )

    idChiTietLH = Column(
        BigInteger,
        ForeignKey("ChiTietLichHen.idChiTietLH"),
        nullable=False,
    )

    soSao = Column(Integer, nullable=False)
    noiDung = Column(Text, nullable=True)

    ngayDanhGia = Column(DateTime, server_default=func.now())

    trangThaiHienThi = Column(String(50), nullable=False, default="Hiển thị")
    ngayTao = Column(DateTime, server_default=func.now())

    khachHang = relationship("KhachHang")
    chiTietLichHen = relationship("ChiTietLichHen")

    __table_args__ = (
        CheckConstraint("soSao >= 1 AND soSao <= 5", name="ck_danhgia_sosao"),
    )
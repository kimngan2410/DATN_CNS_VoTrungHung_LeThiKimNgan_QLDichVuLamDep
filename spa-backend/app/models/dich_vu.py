from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class DichVu(Base):
    __tablename__ = "DichVu"

    idDichVu = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idDanhMuc = Column(
        BigInteger,
        ForeignKey("DanhMucDichVu.idDanhMuc"),
        nullable=False,
    )

    maDV = Column(String(50), nullable=False, unique=True)

    tenDV = Column(String(200), nullable=False)

    moTaChiTiet = Column(Text, nullable=True)
    moTaNgan = Column(String(500), nullable=True)

    gia = Column(Numeric(12, 2), nullable=False, default=0)
    thoiLuongPhut = Column(Integer, nullable=False)

    trangThai = Column(String(50), nullable=False, default="Hoạt động")

    ngayTao = Column(DateTime, server_default=func.now())

    danhMuc = relationship("DanhMucDichVu")
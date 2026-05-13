from sqlalchemy import BigInteger, Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.database import Base


class ChiTietHoaDon(Base):
    __tablename__ = "ChiTietHoaDon"

    idChiTietHD = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idHoaDon = Column(
        BigInteger,
        ForeignKey("HoaDon.idHoaDon"),
        nullable=False,
    )

    idDichVu = Column(
        BigInteger,
        ForeignKey("DichVu.idDichVu"),
        nullable=False,
    )

    soLuong = Column(Integer, nullable=False, default=1)
    donGia = Column(Numeric(12, 2), nullable=False, default=0)
    thanhTien = Column(Numeric(12, 2), nullable=False, default=0)

    hoaDon = relationship("HoaDon")
    dichVu = relationship("DichVu")
from sqlalchemy import BigInteger, Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.database import Base


class ChiTietLichHen(Base):
    __tablename__ = "ChiTietLichHen"

    idChiTietLH = Column(BigInteger, primary_key=True, autoincrement=True, index=True)

    idLichHen = Column(
        BigInteger,
        ForeignKey("LichHen.idLichHen"),
        nullable=False,
    )

    idDichVu = Column(
        BigInteger,
        ForeignKey("DichVu.idDichVu"),
        nullable=False,
    )

    soLuong = Column(Integer, nullable=False, default=1)
    donGia = Column(Numeric(12, 2), nullable=False, default=0)
    thoiLuongPhut = Column(Integer, nullable=False)

    lichHen = relationship("LichHen")
    dichVu = relationship("DichVu")